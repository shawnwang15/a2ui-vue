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

import { readFileSync } from 'node:fs';

export type A2UISchemaDict = Record<string, unknown>;

export abstract class A2uiCatalogProvider {
  abstract load(): A2UISchemaDict;
}

export class FileSystemCatalogProvider extends A2uiCatalogProvider {
  constructor(private readonly path: string) {
    super();
  }

  load(): A2UISchemaDict {
    try {
      const content = readFileSync(this.path, 'utf-8');
      return JSON.parse(content) as A2UISchemaDict;
    } catch (e) {
      throw new Error(`Could not load schema from ${this.path}: ${String(e)}`);
    }
  }
}
