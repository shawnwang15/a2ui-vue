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

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { A2UISchemaDict } from './catalogProvider.js';
import { FileSystemCatalogProvider } from './catalogProvider.js';
import { CATALOG_COMPONENTS_KEY, CATALOG_ID_KEY } from './constants.js';
// Note: A2uiValidator imports A2uiCatalog as `import type`, so this import
// does not create a runtime circular dependency.
import { A2uiValidator } from './validator.js';

export interface CatalogConfigOptions {
  name: string;
  provider: import('./catalogProvider.js').A2uiCatalogProvider;
  examplesPath?: string | null;
}

export class CatalogConfig {
  readonly name: string;
  readonly provider: import('./catalogProvider.js').A2uiCatalogProvider;
  readonly examplesPath: string | null;

  constructor(opts: CatalogConfigOptions) {
    this.name = opts.name;
    this.provider = opts.provider;
    this.examplesPath = opts.examplesPath ?? null;
  }

  static fromPath(name: string, catalogPath: string, examplesPath?: string): CatalogConfig {
    return new CatalogConfig({
      name,
      provider: new FileSystemCatalogProvider(catalogPath),
      examplesPath,
    });
  }
}

export class A2uiCatalog {
  readonly version: string;
  readonly name: string;
  readonly s2cSchema: A2UISchemaDict;
  readonly commonTypesSchema: A2UISchemaDict | null;
  readonly catalogSchema: A2UISchemaDict;

  constructor(opts: {
    version: string;
    name: string;
    s2cSchema: A2UISchemaDict;
    commonTypesSchema: A2UISchemaDict | null;
    catalogSchema: A2UISchemaDict;
  }) {
    this.version = opts.version;
    this.name = opts.name;
    this.s2cSchema = opts.s2cSchema;
    this.commonTypesSchema = opts.commonTypesSchema;
    this.catalogSchema = opts.catalogSchema;
  }

  get catalogId(): string {
    if (!(CATALOG_ID_KEY in this.catalogSchema)) {
      throw new Error(`Catalog '${this.name}' missing catalogId`);
    }
    return this.catalogSchema[CATALOG_ID_KEY] as string;
  }

  get validator(): A2uiValidator {
    return new A2uiValidator(this);
  }

  withPrunedComponents(allowedComponents: string[]): A2uiCatalog {
    if (!allowedComponents || allowedComponents.length === 0) {
      return this;
    }

    const schemaCopy = JSON.parse(JSON.stringify(this.catalogSchema)) as A2UISchemaDict;

    // Prune top-level components map
    if (
      CATALOG_COMPONENTS_KEY in schemaCopy &&
      typeof schemaCopy[CATALOG_COMPONENTS_KEY] === 'object' &&
      schemaCopy[CATALOG_COMPONENTS_KEY] !== null
    ) {
      const allComps = schemaCopy[CATALOG_COMPONENTS_KEY] as Record<string, unknown>;
      const filtered: Record<string, unknown> = {};
      for (const key of Object.keys(allComps)) {
        if (allowedComponents.includes(key)) {
          filtered[key] = allComps[key];
        }
      }
      schemaCopy[CATALOG_COMPONENTS_KEY] = filtered;
    }

    // Filter anyComponent oneOf
    const defs = schemaCopy['$defs'] as Record<string, unknown> | undefined;
    if (defs && typeof defs['anyComponent'] === 'object' && defs['anyComponent'] !== null) {
      const anyComp = defs['anyComponent'] as Record<string, unknown>;
      if (Array.isArray(anyComp['oneOf'])) {
        anyComp['oneOf'] = (anyComp['oneOf'] as Record<string, unknown>[]).filter((item) => {
          if ('$ref' in item && typeof item['$ref'] === 'string') {
            const ref = item['$ref'] as string;
            if (ref.startsWith(`#/${CATALOG_COMPONENTS_KEY}/`)) {
              const compName = ref.split('/').pop()!;
              return allowedComponents.includes(compName);
            }
          }
          return false;
        });
      }
    }

    return new A2uiCatalog({
      version: this.version,
      name: this.name,
      s2cSchema: this.s2cSchema,
      commonTypesSchema: this.commonTypesSchema,
      catalogSchema: schemaCopy,
    });
  }

  renderAsLlmInstructions(): string {
    const parts: string[] = ['---BEGIN A2UI JSON SCHEMA---'];

    const s2cStr = this.s2cSchema ? JSON.stringify(this.s2cSchema, null, 2) : '{}';
    parts.push(`### Server To Client Schema:\n${s2cStr}`);

    if (this.commonTypesSchema) {
      parts.push(`### Common Types Schema:\n${JSON.stringify(this.commonTypesSchema, null, 2)}`);
    }

    parts.push(`### Catalog Schema:\n${JSON.stringify(this.catalogSchema, null, 2)}`);
    parts.push('---END A2UI JSON SCHEMA---');

    return parts.join('\n\n');
  }

  loadExamples(examplesPath: string | null, validate = false): string {
    if (!examplesPath || !existsSync(examplesPath)) {
      if (examplesPath) {
        console.warn(`Example path ${examplesPath} does not exist`);
      }
      return '';
    }

    const mergedExamples: string[] = [];
    for (const filename of readdirSync(examplesPath)) {
      if (!filename.endsWith('.json')) continue;
      const fullPath = path.join(examplesPath, filename);
      const basename = path.basename(filename, '.json');
      try {
        const content = readFileSync(fullPath, 'utf-8');
        if (validate && !this._validateExample(fullPath, basename, content)) {
          continue;
        }
        mergedExamples.push(`---BEGIN ${basename}---\n${content}\n---END ${basename}---`);
      } catch (e) {
        console.warn(`Failed to load example ${fullPath}: ${String(e)}`);
      }
    }

    return mergedExamples.join('\n\n');
  }

  private _validateExample(_fullPath: string, _basename: string, content: string): boolean {
    try {
      const jsonData = JSON.parse(content);
      this.validator.validate(jsonData);
      return true;
    } catch (e) {
      console.warn(`Failed to validate example ${_fullPath}: ${String(e)}`);
      return false;
    }
  }
}
