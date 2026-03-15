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

import type { A2UISchemaDict } from './catalogProvider.js';
import { A2uiCatalog, CatalogConfig } from './catalog.js';
import {
  CATALOG_SCHEMA_KEY,
  DEFAULT_WORKFLOW_RULES,
  INLINE_CATALOG_NAME,
  INLINE_CATALOGS_KEY,
  SPEC_VERSION_MAP,
  SUPPORTED_CATALOG_IDS_KEY,
  VERSION_0_8,
} from './constants.js';
import { loadFromBundledResource } from './utils.js';
import {
  COMMON_TYPES_SCHEMA_KEY,
  SERVER_TO_CLIENT_SCHEMA_KEY,
} from './constants.js';
import type { InferenceStrategy, GenerateSystemPromptOptions } from '../inferenceStrategy.js';

export type SchemaModifier = (schema: A2UISchemaDict) => A2UISchemaDict;

export interface A2uiSchemaManagerOptions {
  version: string;
  catalogs?: CatalogConfig[];
  acceptsInlineCatalogs?: boolean;
  schemaModifiers?: SchemaModifier[];
}

export interface ClientUiCapabilities {
  inlineCatalogs?: A2UISchemaDict[];
  supportedCatalogIds?: string[];
  [key: string]: unknown;
}

export class A2uiSchemaManager implements InferenceStrategy {
  private readonly _version: string;
  private readonly _acceptsInlineCatalogs: boolean;
  private _serverToClientSchema: A2UISchemaDict | null = null;
  private _commonTypesSchema: A2UISchemaDict | null = null;
  private readonly _supportedCatalogs: A2uiCatalog[] = [];
  private readonly _catalogExamplePaths: Map<string, string> = new Map();
  private readonly _schemaModifiers: SchemaModifier[];

  constructor(opts: A2uiSchemaManagerOptions) {
    this._version = opts.version;
    this._acceptsInlineCatalogs = opts.acceptsInlineCatalogs ?? false;
    this._schemaModifiers = opts.schemaModifiers ?? [];
    this._loadSchemas(opts.version, opts.catalogs ?? []);
  }

  get acceptsInlineCatalogs(): boolean {
    return this._acceptsInlineCatalogs;
  }

  get supportedCatalogIds(): string[] {
    return this._supportedCatalogs.map((c) => c.catalogId);
  }

  private _applyModifiers(schema: A2UISchemaDict): A2UISchemaDict {
    let result = schema;
    for (const modifier of this._schemaModifiers) {
      result = modifier(result);
    }
    return result;
  }

  private _loadSchemas(version: string, catalogs: CatalogConfig[]): void {
    if (!(version in SPEC_VERSION_MAP)) {
      throw new Error(
        `Unknown A2UI specification version: ${version}. Supported: ${Object.keys(SPEC_VERSION_MAP).join(', ')}`,
      );
    }

    const s2cRaw = loadFromBundledResource(version, SERVER_TO_CLIENT_SCHEMA_KEY, SPEC_VERSION_MAP);
    if (s2cRaw) {
      this._serverToClientSchema = this._applyModifiers(s2cRaw);
    }

    const ctRaw = loadFromBundledResource(version, COMMON_TYPES_SCHEMA_KEY, SPEC_VERSION_MAP);
    if (ctRaw) {
      this._commonTypesSchema = this._applyModifiers(ctRaw);
    }

    for (const config of catalogs) {
      let catalogSchema = config.provider.load();
      catalogSchema = this._applyModifiers(catalogSchema);

      const catalog = new A2uiCatalog({
        version,
        name: config.name,
        catalogSchema,
        s2cSchema: this._serverToClientSchema ?? {},
        commonTypesSchema: this._commonTypesSchema,
      });
      this._supportedCatalogs.push(catalog);

      if (config.examplesPath) {
        this._catalogExamplePaths.set(catalog.catalogId, config.examplesPath);
      }
    }
  }

  private _selectCatalog(clientUiCapabilities?: ClientUiCapabilities | null): A2uiCatalog {
    if (this._supportedCatalogs.length === 0) {
      throw new Error('No supported catalogs found.');
    }

    if (!clientUiCapabilities || typeof clientUiCapabilities !== 'object') {
      return this._supportedCatalogs[0];
    }

    const inlineCatalogs: A2UISchemaDict[] = (clientUiCapabilities[INLINE_CATALOGS_KEY] as A2UISchemaDict[] | undefined) ?? [];
    const clientSupportedCatalogIds: string[] = (clientUiCapabilities[SUPPORTED_CATALOG_IDS_KEY] as string[] | undefined) ?? [];

    if (!this._acceptsInlineCatalogs && inlineCatalogs.length > 0) {
      throw new Error(
        `Inline catalog '${INLINE_CATALOGS_KEY}' is provided in client UI capabilities. However, the agent does not accept inline catalogs.`,
      );
    }

    if (inlineCatalogs.length > 0 && clientSupportedCatalogIds.length > 0) {
      throw new Error(
        `Both '${INLINE_CATALOGS_KEY}' and '${SUPPORTED_CATALOG_IDS_KEY}' are provided in client UI capabilities. Only one is allowed.`,
      );
    }

    if (inlineCatalogs.length > 0) {
      const inlineCatalogSchema = this._applyModifiers(inlineCatalogs[0]);
      return new A2uiCatalog({
        version: this._version,
        name: INLINE_CATALOG_NAME,
        catalogSchema: inlineCatalogSchema,
        s2cSchema: this._serverToClientSchema ?? {},
        commonTypesSchema: this._commonTypesSchema,
      });
    }

    if (clientSupportedCatalogIds.length === 0) {
      return this._supportedCatalogs[0];
    }

    const agentCatalogsById = new Map(this._supportedCatalogs.map((c) => [c.catalogId, c]));
    for (const cscid of clientSupportedCatalogIds) {
      if (agentCatalogsById.has(cscid)) {
        return agentCatalogsById.get(cscid)!;
      }
    }

    throw new Error(
      `No client-supported catalog found on the agent side. Agent-supported catalogs are: ${this.supportedCatalogIds.join(', ')}`,
    );
  }

  getSelectedCatalog(
    clientUiCapabilities?: ClientUiCapabilities | null,
    allowedComponents: string[] = [],
  ): A2uiCatalog {
    const catalog = this._selectCatalog(clientUiCapabilities);
    return catalog.withPrunedComponents(allowedComponents);
  }

  loadExamples(catalog: A2uiCatalog, validate = false): string {
    const examplesPath = this._catalogExamplePaths.get(catalog.catalogId);
    if (examplesPath) {
      return catalog.loadExamples(examplesPath, validate);
    }
    return '';
  }

  generateSystemPrompt(opts: GenerateSystemPromptOptions & { clientUiCapabilities?: ClientUiCapabilities | null }): string {
    const {
      roleDescription,
      workflowDescription = '',
      uiDescription = '',
      allowedComponents = [],
      includeSchema = false,
      includeExamples = false,
      validateExamples = false,
      clientUiCapabilities,
    } = opts;

    const parts: string[] = [roleDescription];

    let workflow = DEFAULT_WORKFLOW_RULES;
    if (workflowDescription) {
      workflow += `\n${workflowDescription}`;
    }
    parts.push(`## Workflow Description:\n${workflow}`);

    if (uiDescription) {
      parts.push(`## UI Description:\n${uiDescription}`);
    }

    const selectedCatalog = this.getSelectedCatalog(clientUiCapabilities, allowedComponents);

    if (includeSchema) {
      parts.push(selectedCatalog.renderAsLlmInstructions());
    }

    if (includeExamples) {
      const examplesStr = this.loadExamples(selectedCatalog, validateExamples);
      if (examplesStr) {
        parts.push(`### Examples:\n${examplesStr}`);
      }
    }

    return parts.join('\n\n');
  }
}
