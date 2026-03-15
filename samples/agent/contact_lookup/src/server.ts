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
 * A2A HTTP server for the Contact Lookup agent.
 */

import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { getA2uiAgentExtension, VERSION_0_8 } from '@a2ui/agent-sdk';

/** Minimal A2A wire-format Part (text or data). */
export interface WirePart {
  kind: 'text' | 'data';
  text?: string;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

const A2UI_EXTENSION_URI = 'https://a2ui.org/a2a-extension/a2ui/v0.8';

export function clientSupportsA2UI(
  req: Request,
  message?: { extensions?: string[] },
): boolean {
  const header = (req.headers['x-a2a-extensions'] as string | undefined) ?? '';
  if (header.includes(A2UI_EXTENSION_URI)) return true;
  return (message?.extensions ?? []).includes(A2UI_EXTENSION_URI);
}

export function buildTaskResponse(
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

export function createServer() {
  const app = express();
  app.use(cors({ origin: /^http:\/\/localhost:\d+$/, credentials: true }));
  app.use(express.json());
  return app;
}

export function buildAgentCard(
  baseUrl: string,
  schemaManager: { acceptsInlineCatalogs: boolean; supportedCatalogIds: string[] },
): Record<string, unknown> {
  const extension = getA2uiAgentExtension({
    acceptsInlineCatalogs: schemaManager.acceptsInlineCatalogs,
    supportedCatalogIds: schemaManager.supportedCatalogIds,
  });

  return {
    name: 'Contact Lookup Agent',
    description: 'This agent helps find contact info for people in your organization.',
    url: baseUrl,
    version: '1.0.0',
    protocolVersion: '0.2.7',
    defaultInputModes: ['text', 'text/plain'],
    defaultOutputModes: ['text', 'text/plain'],
    capabilities: {
      streaming: false,
      extensions: [extension],
    },
    skills: [
      {
        id: 'find_contact',
        name: 'Find Contact Tool',
        description:
          'Helps find contact information for colleagues (e.g., email, location, team).',
        tags: ['contact', 'directory', 'people', 'finder'],
        examples: [
          'Who is David Chen in marketing?',
          'Find Sarah Lee from engineering',
        ],
      },
    ],
  };
}

export function attachHandlers(
  app: ReturnType<typeof express>,
  agentCardFn: () => Record<string, unknown>,
  messageHandler: (
    query: string,
    useUI: boolean,
    req: Request,
  ) => Promise<WirePart[]>,
) {
  app.get('/.well-known/agent-card.json', (_req, res: Response) => {
    res.json(agentCardFn());
  });

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

    // Extract query and UI events
    let query = '';
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
      const action = (uiEvent['name'] as string) ?? '';
      const ctx = (uiEvent['context'] ?? {}) as Record<string, unknown>;

      switch (action) {
        case 'view_profile': {
          const name = ctx['contactName'] ?? 'Unknown';
          const dept = ctx['department'] ?? '';
          query = `WHO_IS: ${name} from ${dept}`;
          break;
        }
        case 'send_email': {
          const name = ctx['contactName'] ?? 'Unknown';
          const email = ctx['email'] ?? 'Unknown';
          query = `USER_WANTS_TO_EMAIL: ${name} at ${email}`;
          break;
        }
        case 'send_message': {
          const name = ctx['contactName'] ?? 'Unknown';
          query = `USER_WANTS_TO_MESSAGE: ${name}`;
          break;
        }
        case 'follow_contact':
          query = 'ACTION: follow_contact';
          break;
        case 'view_full_profile': {
          const name = ctx['contactName'] ?? 'Unknown';
          query = `USER_WANTS_FULL_PROFILE: ${name}`;
          break;
        }
        default:
          query = `User submitted an event: ${action} with data: ${JSON.stringify(ctx)}`;
      }
    }

    if (!query) {
      query = 'Hello';
    }

    console.log(
      `[ContactAgentExecutor] Received query: "${query}", useUI: ${useUI}`,
    );

    try {
      const parts = await messageHandler(query, useUI, req);
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
