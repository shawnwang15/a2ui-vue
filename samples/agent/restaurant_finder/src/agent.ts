// Copyright 2026 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Restaurant Finder agent — TypeScript port of agent.py
 *
 * Uses the Vercel AI SDK with tool calling.
 */

import { streamText , tool } from 'ai';
import type { LanguageModel } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import {
  A2uiSchemaManager,
  BasicCatalog,
  VERSION_0_8,
  parseResponse,
  parseResponseToParts,
  A2UI_OPEN_TAG,
  A2UI_CLOSE_TAG,
} from '@a2ui/agent-sdk';
import { getRestaurants } from './tools.js';
import { ROLE_DESCRIPTION, UI_DESCRIPTION, getTextPrompt } from './promptBuilder.js';
import type { WirePart } from './server.js';

function toWirePart(part: {
  root: {
    text?: string;
    data?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  };
}): WirePart {
  const root = part.root;
  if ('text' in root && typeof root.text === 'string') {
    return { kind: 'text', text: root.text };
  }
  return {
    kind: 'data',
    data: (root.data ?? {}) as Record<string, unknown>,
    metadata: root.metadata as Record<string, unknown> | undefined,
  };
}

export class RestaurantAgent {
  private readonly schemaManager: A2uiSchemaManager | null;
  private readonly model: LanguageModel;
  private readonly systemPrompt: string;

  private static resolveModel(): LanguageModel {
    const series = (process.env['LLM_MODEL_SERIES'] ?? 'qwen').toLowerCase();
    const apiKey =
      process.env['LLM_API_KEY'] ??
      '';

    if (series === 'gemini') {
      const google = createGoogleGenerativeAI({ apiKey });
      const modelName =
        process.env['MODEL_NAME'] ??
        'gemini-2.0-flash';
      return google(modelName);
    }

    if (series === 'claude') {
      const anthropic = createAnthropic({ apiKey });
      const modelName =
        process.env['MODEL_NAME'] ??
        'claude-3-5-haiku-latest';
      return anthropic(modelName);
    }

    if (series === 'minimax') {
      const minimax = createOpenAI({
        apiKey,
        baseURL: process.env['LLM_API_BASE'] ?? 'https://api.minimaxi.com/v1',
        compatibility: 'compatible',
      });
      const modelName = process.env['MODEL_NAME'] ?? 'MiniMax-M2';
      return minimax(modelName);
    }

    const apiBase =
      process.env['LLM_API_BASE'] ??
      'https://dashscope.aliyuncs.com/compatible-mode/v1';
    const openai = createOpenAI({ apiKey, baseURL: apiBase, compatibility: 'compatible' });

    const modelName = process.env['MODEL_NAME'] ?? 'qwen-flash';
    return openai(modelName);
  }

  constructor(
    private readonly baseUrl: string,
    private readonly useUI: boolean,
  ) {
    this.model = RestaurantAgent.resolveModel();

    if (useUI) {
      this.schemaManager = new A2uiSchemaManager({
        version: VERSION_0_8,
        catalogs: [BasicCatalog.getConfig(VERSION_0_8, 'examples')],
      });
      this.systemPrompt = this.schemaManager.generateSystemPrompt({
        roleDescription: ROLE_DESCRIPTION,
        uiDescription: UI_DESCRIPTION,
        includeSchema: true,
        includeExamples: true,
        validateExamples: true,
      });
    } else {
      this.schemaManager = null;
      this.systemPrompt = getTextPrompt();
    }
  }

  get processingMessage(): string {
    return 'Finding restaurants that match your criteria...';
  }

  async stream(query: string): Promise<WirePart[]> {
    console.log(`[RestaurantAgent] Query: ${query}, useUI: ${this.useUI}`);

    const maxRetries = 1;
    let currentQuery = query;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      console.log(`[RestaurantAgent] Attempt ${attempt + 1}/${maxRetries + 1}`);

      let responseText: string | null;
      try {
        responseText = await this.callLLM(currentQuery);
      } catch (llmErr) {
        console.error(`[RestaurantAgent] LLM call failed: ${String(llmErr)}`);
        return [{ kind: 'text', text: "I'm sorry, I'm unable to process your request right now. Please try again later." }];
      }

      if (!responseText) {
        if (attempt < maxRetries) {
          currentQuery = `I received no response. Please retry: '${query}'`;
          continue;
        }
        return [
          {
            kind: 'text',
            text: "I'm sorry, I encountered an error. Please try again.",
          },
        ];
      }

      if (!this.useUI) {
        return [{ kind: 'text', text: responseText }];
      }

      // Validate A2UI response
      try {
        const parsed = parseResponse(responseText);
        const catalog = this.schemaManager!.getSelectedCatalog();

        let isValid = true;
        let errorMessage = '';

        for (const part of parsed) {
          if (!part.a2uiJson) continue;
          if (Array.isArray(part.a2uiJson) && part.a2uiJson.length === 0) continue;

          try {
            catalog.validator.validate(part.a2uiJson);
          } catch (err) {
            isValid = false;
            errorMessage = String(err);
            break;
          }
        }

        if (isValid) {
          return parseResponseToParts(responseText, undefined, 'OK.').map(toWirePart);
        }

        if (attempt < maxRetries) {
          console.warn(`[RestaurantAgent] Validation failed (attempt ${attempt + 1}): ${errorMessage}`);
          currentQuery =
            `Your previous response was invalid. ${errorMessage} ` +
            `You MUST generate a valid response that strictly follows the A2UI JSON SCHEMA. ` +
            `Ensure each JSON part is wrapped in '${A2UI_OPEN_TAG}' and '${A2UI_CLOSE_TAG}' tags. ` +
            `Please retry the original request: '${query}'`;
          continue;
        }

        console.error('[RestaurantAgent] Max retries exhausted.');
        return [
          {
            kind: 'text',
            text: "I'm sorry, I'm having trouble generating the interface right now. Please try again.",
          },
        ];
      } catch (err) {
        if (attempt < maxRetries) {
          currentQuery = `Your previous response was invalid. ${String(err)} Please retry: '${query}'`;
          continue;
        }
        return [
          {
            kind: 'text',
            text: "I'm sorry, I'm having trouble generating the interface right now. Please try again.",
          },
        ];
      }
    }

    return [{ kind: 'text', text: 'Unexpected error.' }];
  }

  private async callLLM(userQuery: string): Promise<string | null> {
    const result = streamText ({
      model: this.model,
      system: this.systemPrompt,
      prompt: userQuery,
      tools: {
        get_restaurants: tool({
          description:
            'Get a list of restaurants based on cuisine and location. Returns JSON array of matching restaurants.',
          parameters: z.object({
            cuisine: z.string().describe('The type of cuisine to search for.'),
            location: z.string().describe('The city or location to search in.'),
            count: z.number().optional().describe('The number of restaurants to return (default 5).'),
          }),
          execute: async ({ cuisine, location, count }) => {
            return getRestaurants(cuisine, location, this.baseUrl, count ?? 5);
          },
        }),
      },
      maxSteps: 5,
    });
    const reader = result.textStream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      process.stdout.write(value);
    }
    return result.text || null;
  }
}
