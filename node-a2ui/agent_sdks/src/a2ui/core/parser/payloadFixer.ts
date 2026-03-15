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
 * Removes trailing commas from a JSON string (common LLM output issue).
 */
function removeTrailingCommas(jsonStr: string): string {
  const fixed = jsonStr.replace(/,(\s*[\]}])/g, '$1');
  if (fixed !== jsonStr) {
    console.warn('Detected trailing commas in LLM output; applied autofix.');
  }
  return fixed;
}

function parseRaw(payload: string): unknown[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${String(e)}`);
  }
  if (!Array.isArray(parsed)) {
    console.info('Received a single JSON object, wrapping in a list for validation.');
    return [parsed];
  }
  return parsed as unknown[];
}

/**
 * Validates and applies autofixes to a raw JSON string, returning the parsed payload.
 */
export function parseAndFix(payload: string): unknown[] {
  try {
    return parseRaw(payload);
  } catch (e) {
    console.warn(`Initial A2UI payload validation failed: ${String(e)}`);
    const fixed = removeTrailingCommas(payload);
    return parseRaw(fixed);
  }
}
