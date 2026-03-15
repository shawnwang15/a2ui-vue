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

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { A2UISchemaDict } from './catalogProvider.js';
import { FileSystemCatalogProvider } from './catalogProvider.js';
import { SPECIFICATION_DIR } from './constants.js';

/**
 * Returns the directory of this source file, compatible with both ESM and CJS.
 * In CJS (tsup-bundled), __dirname is injected. In ESM we use import.meta.url.
 */
function getCurrentDir(): string {
  // __dirname is available in CJS bundles and when running with ts-node/tsx in CJS mode.
  // In a pure ESM context, __dirname is undefined, so we use import.meta.url.
  try {
    // @ts-ignore — __dirname is a CJS global, not available in strict ESM typings
    if (typeof __dirname !== 'undefined') return __dirname as string;
  } catch {
    // ignore
  }
  // ESM path
  try {
    const { fileURLToPath } = require('node:url') as typeof import('node:url');
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
}

function findRepoRoot(startPath: string): string | null {
  let current = path.resolve(startPath);
  while (true) {
    if (existsSync(path.join(current, SPECIFICATION_DIR))) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

export function loadFromBundledResource(
  version: string,
  resourceKey: string,
  specMap: Record<string, Record<string, string>>,
): A2UISchemaDict | null {
  const versionMap = specMap[version];
  if (!versionMap) {
    throw new Error(`Unknown A2UI version: ${version}`);
  }
  if (!(resourceKey in versionMap)) {
    return null;
  }

  const relPath = versionMap[resourceKey];
  const filename = path.basename(relPath);
  const currentDir = getCurrentDir();

  // 1. Try local assets (parallel to this file: assets/<version>/<filename>)
  try {
    const localAssetsPath = path.resolve(
      currentDir,
      '..',
      '..',
      'assets',
      version,
      filename,
    );
    if (existsSync(localAssetsPath)) {
      return new FileSystemCatalogProvider(localAssetsPath).load();
    }
  } catch {
    // continue to next fallback
  }

  // 2. Fallback: source repository (specification/...)
  try {
    const repoRoot = findRepoRoot(currentDir);
    if (repoRoot) {
      const sourcePath = path.join(repoRoot, relPath);
      if (existsSync(sourcePath)) {
        return new FileSystemCatalogProvider(sourcePath).load();
      }
    }
  } catch {
    // continue
  }

  throw new Error(`Could not load schema ${filename} for version ${version}`);
}

/** Wraps the A2UI schema in an array object so the LLM generates lists. */
export function wrapAsJsonArray(a2uiSchema: A2UISchemaDict): A2UISchemaDict {
  if (!a2uiSchema || Object.keys(a2uiSchema).length === 0) {
    throw new Error('A2UI schema is empty');
  }
  return { type: 'array', items: a2uiSchema };
}
