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
 * A2A protocol utilities for A2UI.
 *
 * This module provides helper types and functions that mirror the behaviour
 * of the Python a2ui.a2a module, adapted for environments that use the A2A
 * TypeScript/JavaScript SDK or custom A2A server implementations.
 *
 * Because the A2A TypeScript SDK may differ across consumers, the types here
 * use plain interfaces rather than importing from a specific SDK package.
 */

import { parseResponse } from './core/parser/parser.js';
import type { A2uiValidator } from './core/schema/validator.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const A2UI_EXTENSION_URI = 'https://a2ui.org/a2a-extension/a2ui/v0.8';
export const AGENT_EXTENSION_SUPPORTED_CATALOG_IDS_KEY = 'supportedCatalogIds';
export const AGENT_EXTENSION_ACCEPTS_INLINE_CATALOGS_KEY = 'acceptsInlineCatalogs';
export const MIME_TYPE_KEY = 'mimeType';
export const A2UI_MIME_TYPE = 'application/json+a2ui';

// ---------------------------------------------------------------------------
// Generic A2A Part types
// ---------------------------------------------------------------------------

export interface DataPart {
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface TextPart {
  text: string;
}

/** A discriminated union representing an A2A Part. */
export type A2APart = { root: DataPart } | { root: TextPart };

// ---------------------------------------------------------------------------
// AgentExtension
// ---------------------------------------------------------------------------

export interface AgentExtension {
  uri: string;
  params?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates an A2A Part containing A2UI data.
 */
export function createA2uiPart(a2uiData: Record<string, unknown>): A2APart {
  return {
    root: {
      data: a2uiData,
      metadata: { [MIME_TYPE_KEY]: A2UI_MIME_TYPE },
    } as DataPart,
  };
}

/**
 * Returns true if the given A2A Part contains A2UI data.
 */
export function isA2uiPart(part: A2APart): boolean {
  const root = (part as { root: unknown }).root;
  if (typeof root !== 'object' || root === null) return false;
  const dp = root as DataPart;
  return (
    'data' in dp &&
    typeof dp.metadata === 'object' &&
    dp.metadata !== null &&
    dp.metadata[MIME_TYPE_KEY] === A2UI_MIME_TYPE
  );
}

/**
 * Extracts the DataPart from an A2A Part if it contains A2UI data.
 */
export function getA2uiDataPart(part: A2APart): DataPart | null {
  return isA2uiPart(part) ? ((part as { root: DataPart }).root) : null;
}

/**
 * Creates the A2UI AgentExtension configuration object.
 */
export function getA2uiAgentExtension(opts?: {
  acceptsInlineCatalogs?: boolean;
  supportedCatalogIds?: string[];
}): AgentExtension {
  const params: Record<string, unknown> = {};

  if (opts?.acceptsInlineCatalogs) {
    params[AGENT_EXTENSION_ACCEPTS_INLINE_CATALOGS_KEY] = true;
  }
  if (opts?.supportedCatalogIds && opts.supportedCatalogIds.length > 0) {
    params[AGENT_EXTENSION_SUPPORTED_CATALOG_IDS_KEY] = opts.supportedCatalogIds;
  }

  return { uri: A2UI_EXTENSION_URI, params };
}

/**
 * Parses an LLM text response that may contain A2UI JSON blocks, returning
 * a list of A2A Parts (TextPart and/or DataPart).
 *
 * @param content - Raw LLM response containing `<a2ui-json>…</a2ui-json>` blocks.
 * @param validator - Optional validator to validate each A2UI JSON payload.
 * @param fallbackText - Text used as a TextPart when parsing completely fails.
 */
export function parseResponseToParts(
  content: string,
  validator?: A2uiValidator,
  fallbackText?: string,
): A2APart[] {
  const parts: A2APart[] = [];

  try {
    const responseParts = parseResponse(content);

    for (const part of responseParts) {
      if (part.text) {
        parts.push({ root: { text: part.text } as TextPart });
      }

      if (part.a2uiJson) {
        const jsonData = part.a2uiJson;
        if (validator) {
          validator.validate(jsonData);
        }

        if (Array.isArray(jsonData)) {
          for (const message of jsonData) {
            parts.push(createA2uiPart(message as Record<string, unknown>));
          }
        } else {
          parts.push(createA2uiPart(jsonData as Record<string, unknown>));
        }
      }
    }
  } catch (e) {
    console.warn(`Failed to parse or validate A2UI response: ${String(e)}`);
  }

  if (parts.length === 0 && fallbackText) {
    parts.push({ root: { text: fallbackText } as TextPart });
  }

  return parts;
}
