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
 * Restaurant Finder agent — Mastra-based implementation.
 */

import { Agent } from '@mastra/core/agent';
import {
  A2uiSchemaManager,
  BasicCatalog,
  VERSION_0_9,
  parseResponse,
  parseResponseToParts,
  A2UI_OPEN_TAG,
  A2UI_CLOSE_TAG,
} from '@a2ui/agent-sdk';
import { ROLE_DESCRIPTION, UI_DESCRIPTION, getTextPrompt } from './promptBuilder.js';
import { createGetRestaurantsTool } from './mastraTools.js';
import { resolveMastraModel } from './modelConfig.js';
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
  private readonly mastraAgent: Agent;
  private readonly systemPrompt: string;

  constructor(
    private readonly baseUrl: string,
    private readonly useUI: boolean,
  ) {
    if (useUI) {
      this.schemaManager = new A2uiSchemaManager({
        version: VERSION_0_9,
        catalogs: [BasicCatalog.getConfig(VERSION_0_9, 'examples')],
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

    this.mastraAgent = new Agent({
      id: useUI ? 'restaurant-ui-agent' : 'restaurant-text-agent',
      name: useUI ? 'Restaurant UI Agent' : 'Restaurant Text Agent',
      instructions: this.systemPrompt,
      model: resolveMastraModel(),
      tools: {
        get_restaurants: createGetRestaurantsTool(baseUrl),
      },
    });
  }

  get processingMessage(): string {
    return 'Finding restaurants that match your criteria...';
  }

  async stream(query: string): Promise<WirePart[]> {
    console.log(`[RestaurantAgent] Query: ${query}, useUI: ${this.useUI}`);

    const maxRetries = 3;
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
    console.log('[RestaurantAgent] -> calling LLM...');
    const abortController = new AbortController();
    const timeoutMs = Number(process.env['LLM_TIMEOUT_MS'] ?? 60000);
    const timer = setTimeout(() => {
      console.error(`[RestaurantAgent] LLM request timed out after ${timeoutMs}ms, aborting.`);
      abortController.abort();
    }, timeoutMs);

    try {
      const stream = await this.mastraAgent.stream(userQuery, {
        maxSteps: 5,
        abortSignal: abortController.signal,
      });

      const reader = stream.fullStream.getReader();
      let firstChunk = true;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value.type === 'text-delta') {
          if (firstChunk) {
            console.log('[RestaurantAgent] <- first token received');
            firstChunk = false;
          }
          process.stdout.write(value.payload.text);
        }
      }

      return (await stream.text) || null;
    } finally {
      clearTimeout(timer);
    }
  }
}
