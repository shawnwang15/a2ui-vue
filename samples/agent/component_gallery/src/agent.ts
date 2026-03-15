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
 * Agent logic for the Component Gallery — TypeScript port of agent.py
 */

import { A2UI_OPEN_TAG, A2UI_CLOSE_TAG, parseResponseToParts } from '@a2ui/agent-sdk';
import { getGalleryJson } from './galleryExamples.js';
import type { WirePart } from './server.js';

export class ComponentGalleryAgent {
  constructor(private readonly baseUrl: string) {}

  async process(query: string): Promise<WirePart[]> {
    // Initial load or reset
    if (query.includes('WHO_ARE_YOU') || query.includes('START')) {
      const galleryJson = getGalleryJson(this.baseUrl);
      const rawParts = parseResponseToParts(
        `Here is the component gallery.\n${A2UI_OPEN_TAG}\n${galleryJson}\n${A2UI_CLOSE_TAG}`,
      );
      return rawParts.map(toWirePart);
    }

    // Handle client-sent actions
    if (query.startsWith('ACTION:')) {
      await delay(500);
      const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
      const responseUpdate = {
        surfaceUpdate: {
          surfaceId: 'response-surface',
          components: [
            {
              id: 'response-text',
              component: {
                Text: {
                  text: {
                    literalString: `Agent Processed Action: ${query} at ${timestamp}`,
                  },
                },
              },
            },
          ],
        },
      };

      return [
        { kind: 'text', text: 'Action processed.' },
        {
          kind: 'data',
          data: responseUpdate,
          metadata: { mimeType: 'application/json+a2ui' },
        },
      ];
    }

    // Fallback
    return [{ kind: 'text', text: 'I am the Component Gallery Agent.' }];
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Convert SDK-style A2APart ({root: ...}) to A2A wire-format Part */
function toWirePart(part: { root: { text?: string; data?: Record<string, unknown>; metadata?: Record<string, unknown> } }): WirePart {
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
