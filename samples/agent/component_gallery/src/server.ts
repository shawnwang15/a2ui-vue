// Copyright 2026 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * A2A HTTP server for the Component Gallery agent.
 *
 * Implements the A2A protocol (JSON-RPC 2.0) using Express:
 *  - GET  /.well-known/agent-card.json  →  AgentCard
 *  - POST /                             →  message/send handler
 *  - GET  /assets/*                     →  static assets
 */

import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { getA2uiAgentExtension } from '@a2ui/agent-sdk';

/** Minimal A2A wire-format Part (text or data). */
export interface WirePart {
  kind: 'text' | 'data';
  text?: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

const A2UI_EXTENSION_URI = 'https://a2ui.org/a2a-extension/a2ui/v0.8';

/** Returns true when the client announces A2UI extension support. */
function clientSupportsA2UI(req: Request, message?: { extensions?: string[] }): boolean {
  const header = (req.headers['x-a2a-extensions'] as string | undefined) ?? '';
  if (header.includes(A2UI_EXTENSION_URI)) return true;
  return (message?.extensions ?? []).includes(A2UI_EXTENSION_URI);
}

/** Build a completed A2A Task JSON-RPC response. */
function buildTaskResponse(
  rpcId: string | number,
  contextId: string,
  parts: WirePart[],
): Record<string, unknown> {
  const taskId = randomUUID();
  return {
    jsonrpc: '2.0',
    id: rpcId,
    result: {
      id: taskId,
      contextId,
      kind: 'task',
      status: {
        state: 'completed',
        message: {
          kind: 'message',
          messageId: randomUUID(),
          role: 'agent',
          parts,
          taskId,
          contextId,
        },
        timestamp: new Date().toISOString(),
      },
    },
  };
}

export function createServer(agentCardFn: () => Record<string, unknown>) {
  const app = express();

  app.use(
    cors({
      origin: /^http:\/\/localhost:\d+$/,
      credentials: true,
    }),
  );
  app.use(express.json());

  // Agent card endpoint
  app.get('/.well-known/agent-card.json', (_req, res: Response) => {
    res.json(agentCardFn());
  });

  return app;
}

/** Helper: attach the message/send handler to an Express app. */
export function attachMessageSendHandler(
  app: ReturnType<typeof express>,
  handler: (query: string, useUI: boolean, req: Request) => Promise<WirePart[]>,
) {
  app.post('/', async (req: Request, res: Response) => {
    const body = req.body as {
      jsonrpc: string;
      method: string;
      id: string | number;
      params?: {
        message?: {
          parts?: Array<{ kind: string; text?: string; data?: Record<string, unknown> }>;
          extensions?: string[];
          contextId?: string;
        };
      };
    };

    if (body.method !== 'message/send' && body.method !== 'message/stream') {
      res.json({
        jsonrpc: '2.0',
        id: body.id,
        error: { code: -32601, message: 'Method not found' },
      });
      return;
    }

    const message = body.params?.message;
    const contextId = message?.contextId ?? randomUUID();
    const useUI = clientSupportsA2UI(req, message);

    // Extract the query from message parts
    let query = 'START';
    let uiEvent: Record<string, unknown> | null = null;

    for (const part of message?.parts ?? []) {
      if (part.kind === 'text' && part.text) {
        query = part.text;
      } else if (part.kind === 'data' && part.data) {
        const data = part.data as Record<string, unknown>;
        if ('userAction' in data) {
          uiEvent = data['userAction'] as Record<string, unknown>;
        } else if ('request' in data) {
          query = data['request'] as string;
        }
      }
    }

    if (uiEvent) {
      const action = uiEvent['name'] as string;
      const ctx = (uiEvent['context'] ?? {}) as Record<string, unknown>;
      query = `ACTION: ${action} with ${JSON.stringify(ctx)}`;
    }

    try {
      const parts = await handler(query, useUI, req);
      res.json(buildTaskResponse(body.id, contextId, parts));
    } catch (err) {
      console.error('Error processing request:', err);
      res.json({
        jsonrpc: '2.0',
        id: body.id,
        error: { code: -32603, message: 'Internal error' },
      });
    }
  });
}

/** Build the agent card for the Component Gallery agent. */
export function buildAgentCard(baseUrl: string): Record<string, unknown> {
  const extension = getA2uiAgentExtension({
    acceptsInlineCatalogs: false,
    supportedCatalogIds: [],
  });

  return {
    name: 'Component Gallery Agent',
    description: 'A2UI Component Gallery',
    url: baseUrl,
    version: '0.0.1',
    protocolVersion: '0.2.7',
    defaultInputModes: ['text'],
    defaultOutputModes: ['text'],
    capabilities: {
      streaming: false,
      extensions: [extension],
    },
    skills: [
      {
        id: 'component_gallery',
        name: 'Component Gallery',
        description: 'Demonstrates A2UI components.',
        tags: ['gallery', 'demo'],
        examples: ['Show me the gallery'],
      },
    ],
  };
}

/** Resolve the `assets/` directory relative to this file's package root. */
export function resolveAssetsDir(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.join(__dirname, '..', 'assets');
}
