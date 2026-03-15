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

import { A2UI_CLOSE_TAG, A2UI_OPEN_TAG } from '../schema/constants.js';
import { parseAndFix } from './payloadFixer.js';

const OPEN_ESCAPED = A2UI_OPEN_TAG.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const CLOSE_ESCAPED = A2UI_CLOSE_TAG.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const A2UI_BLOCK_PATTERN = new RegExp(`${OPEN_ESCAPED}(.*?)${CLOSE_ESCAPED}`, 'gs');

export interface ResponsePart {
  /** Conversational text preceding the A2UI block. Can be empty string. */
  text: string;
  /** Parsed A2UI JSON data. Null if this part only contains trailing text. */
  a2uiJson: unknown[] | null;
}

export function hasA2uiParts(content: string): boolean {
  return content.includes(A2UI_OPEN_TAG) && content.includes(A2UI_CLOSE_TAG);
}

function sanitizeJsonString(jsonString: string): string {
  let s = jsonString.trim();
  if (s.startsWith('```json')) {
    s = s.slice('```json'.length);
  } else if (s.startsWith('```')) {
    s = s.slice('```'.length);
  }
  if (s.endsWith('```')) {
    s = s.slice(0, -'```'.length);
  }
  return s.trim();
}

/**
 * Parses the LLM response into a list of ResponsePart objects.
 *
 * @throws {Error} If no A2UI tags are found or if the JSON part is invalid.
 */
export function parseResponse(content: string): ResponsePart[] {
  // Reset lastIndex for global regex
  A2UI_BLOCK_PATTERN.lastIndex = 0;
  const matches = [...content.matchAll(A2UI_BLOCK_PATTERN)];

  if (matches.length === 0) {
    throw new Error(
      `A2UI tags '${A2UI_OPEN_TAG}' and '${A2UI_CLOSE_TAG}' not found in response.`,
    );
  }

  const responseParts: ResponsePart[] = [];
  let lastEnd = 0;

  for (const match of matches) {
    const start = match.index!;
    const end = start + match[0].length;

    const textPart = content.slice(lastEnd, start).trim();
    const jsonString = match[1];
    const jsonStringCleaned = sanitizeJsonString(jsonString);

    if (!jsonStringCleaned) {
      throw new Error('A2UI JSON part is empty.');
    }

    const jsonData = parseAndFix(jsonStringCleaned);
    responseParts.push({ text: textPart, a2uiJson: jsonData });
    lastEnd = end;
  }

  const trailingText = content.slice(lastEnd).trim();
  if (trailingText) {
    responseParts.push({ text: trailingText, a2uiJson: null });
  }

  return responseParts;
}
