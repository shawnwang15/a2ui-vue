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

import type { A2UISchemaDict } from '../core/schema/catalogProvider.js';
import { A2uiCatalogProvider } from '../core/schema/catalogProvider.js';
import { CatalogConfig } from '../core/schema/catalog.js';
import {
  BASE_SCHEMA_URL,
  CATALOG_ID_KEY,
  CATALOG_SCHEMA_KEY,
} from '../core/schema/constants.js';
import { loadFromBundledResource } from '../core/schema/utils.js';
import { BASIC_CATALOG_NAME, BASIC_CATALOG_PATHS } from './constants.js';

export class BundledCatalogProvider extends A2uiCatalogProvider {
  constructor(private readonly version: string) {
    super();
  }

  load(): A2UISchemaDict {
    const resource = loadFromBundledResource(
      this.version,
      CATALOG_SCHEMA_KEY,
      BASIC_CATALOG_PATHS,
    );

    if (!resource) {
      throw new Error(
        `Could not load basic catalog for version ${this.version}`,
      );
    }

    // Post-load processing: ensure catalogId is set
    if (!(CATALOG_ID_KEY in resource)) {
      const specMap = BASIC_CATALOG_PATHS[this.version];
      if (specMap && CATALOG_SCHEMA_KEY in specMap) {
        const relPath = specMap[CATALOG_SCHEMA_KEY];
        // Strip the `json/` part from the catalog file path for the ID.
        const catalogFile = relPath.replace('/json/', '/');
        resource[CATALOG_ID_KEY] = BASE_SCHEMA_URL + catalogFile;
      }
    }

    if (!('$schema' in resource)) {
      resource['$schema'] = 'https://json-schema.org/draft/2020-12/schema';
    }

    return resource;
  }
}

export class BasicCatalog {
  /**
   * Returns a CatalogConfig for the basic bundled catalog.
   */
  static getConfig(version: string, examplesPath?: string): CatalogConfig {
    return new CatalogConfig({
      name: BASIC_CATALOG_NAME,
      provider: new BundledCatalogProvider(version),
      examplesPath,
    });
  }
}
