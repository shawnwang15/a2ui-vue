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

import Ajv2020, { type ValidateFunction } from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import type { A2uiCatalog } from './catalog.js';
import {
  BASE_SCHEMA_URL,
  CATALOG_COMPONENTS_KEY,
  CATALOG_STYLES_KEY,
  VERSION_0_8,
} from './constants.js';
import { wrapAsJsonArray } from './utils.js';

// RFC 6901 compliant regex for JSON Pointer
const JSON_POINTER_PATTERN = /^(?:\/(?:[^~/]|~[01])*)*$/;

// Recursion Limits
const MAX_GLOBAL_DEPTH = 50;
const MAX_FUNC_CALL_DEPTH = 5;

// Constants
const COMPONENTS = 'components';
const ID = 'id';
const ROOT = 'root';
const PATH = 'path';
const CALL = 'call';
const ARGS = 'args';

type SchemaObj = Record<string, unknown>;

function injectAdditionalProperties(
  schema: SchemaObj,
  sourceProperties: Record<string, unknown>,
): [SchemaObj, Set<string>] {
  const injectedKeys = new Set<string>();

  function recursiveInject(obj: unknown): unknown {
    if (Array.isArray(obj)) {
      return obj.map(recursiveInject);
    }
    if (obj !== null && typeof obj === 'object') {
      const input = obj as SchemaObj;
      const newObj: SchemaObj = {};
      for (const [k, v] of Object.entries(input)) {
        if (
          typeof v === 'object' &&
          v !== null &&
          (v as SchemaObj)['additionalProperties'] === true
        ) {
          if (k in sourceProperties) {
            injectedKeys.add(k);
            const newNode: SchemaObj = { ...(v as SchemaObj) };
            newNode['additionalProperties'] = false;
            newNode['properties'] = {
              ...((newNode['properties'] as SchemaObj) ?? {}),
              ...(sourceProperties[k] as SchemaObj),
            };
            newObj[k] = newNode;
          } else {
            newObj[k] = recursiveInject(v);
          }
        } else {
          newObj[k] = recursiveInject(v);
        }
      }
      return newObj;
    }
    return obj;
  }

  return [recursiveInject(schema) as SchemaObj, injectedKeys];
}

export class A2uiValidator {
  private readonly _catalog: A2uiCatalog;
  private readonly _validateFn: ValidateFunction;

  constructor(catalog: A2uiCatalog) {
    this._catalog = catalog;
    this._validateFn = this._buildValidator();
  }

  private _buildValidator(): ValidateFunction {
    if (this._catalog.version === VERSION_0_8) {
      return this._build08Validator();
    }
    return this._build09Validator();
  }

  private _bundle08Schemas(): SchemaObj {
    if (!this._catalog.s2cSchema) return {};
    const bundled = JSON.parse(JSON.stringify(this._catalog.s2cSchema)) as SchemaObj;

    const sourceProperties: Record<string, unknown> = {};
    const catalogSchema = this._catalog.catalogSchema;
    if (catalogSchema) {
      if (CATALOG_COMPONENTS_KEY in catalogSchema) {
        // v0.8 special mapping: "components" -> "component"
        sourceProperties['component'] = catalogSchema[CATALOG_COMPONENTS_KEY];
      }
      if (CATALOG_STYLES_KEY in catalogSchema) {
        sourceProperties[CATALOG_STYLES_KEY] = catalogSchema[CATALOG_STYLES_KEY];
      }
    }

    const [result] = injectAdditionalProperties(bundled, sourceProperties);
    return result;
  }

  private _build08Validator(): ValidateFunction {
    const bundledSchema = this._bundle08Schemas();
    const fullSchema = wrapAsJsonArray(bundledSchema);

    const ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);

    if (this._catalog.commonTypesSchema) {
      const baseUri = (this._catalog.s2cSchema['$id'] as string | undefined) ?? BASE_SCHEMA_URL;
      const siblingUri = (uri: string, filename: string) => {
        const lastSlash = uri.lastIndexOf('/');
        return uri.substring(0, lastSlash + 1) + filename;
      };
      const commonTypesUri = siblingUri(baseUri, 'common_types.json');
      ajv.addSchema({ ...this._catalog.commonTypesSchema, $id: commonTypesUri });
      ajv.addSchema({ ...this._catalog.commonTypesSchema, $id: 'common_types.json' });
    }

    const validatorSchema = { ...fullSchema, $schema: 'https://json-schema.org/draft/2020-12/schema' };
    return ajv.compile(validatorSchema);
  }

  private _build09Validator(): ValidateFunction {
    const fullSchema = wrapAsJsonArray(this._catalog.s2cSchema);

    const ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);

    const baseUri = (this._catalog.s2cSchema['$id'] as string | undefined) ?? BASE_SCHEMA_URL;
    const siblingUri = (uri: string, filename: string) => {
      const lastSlash = uri.lastIndexOf('/');
      return uri.substring(0, lastSlash + 1) + filename;
    };

    const catalogUri = siblingUri(baseUri, 'catalog.json');
    const commonTypesUri = siblingUri(baseUri, 'common_types.json');

    if (this._catalog.commonTypesSchema) {
      ajv.addSchema({ ...this._catalog.commonTypesSchema, $id: commonTypesUri });
      ajv.addSchema({ ...this._catalog.commonTypesSchema, $id: 'common_types.json' });
    }

    ajv.addSchema({ ...this._catalog.catalogSchema, $id: catalogUri });
    ajv.addSchema({ ...this._catalog.catalogSchema, $id: 'catalog.json' });

    // Also register by catalog ID if different
    const catalogIdVal = this._catalog.catalogSchema['$id'] as string | undefined;
    if (catalogIdVal && catalogIdVal !== catalogUri) {
      try {
        ajv.addSchema({ ...this._catalog.catalogSchema, $id: catalogIdVal });
      } catch {
        // ignore duplicate
      }
    }

    const validatorSchema = { ...fullSchema, $schema: 'https://json-schema.org/draft/2020-12/schema' };
    return ajv.compile(validatorSchema);
  }

  validate(a2uiJson: unknown): void {
    const messages = Array.isArray(a2uiJson) ? a2uiJson : [a2uiJson];

    const valid = this._validateFn(messages);
    if (!valid) {
      const errors = this._validateFn.errors ?? [];
      const msgs = errors.map((e: { instancePath: string; message?: string }) => `${e.instancePath} ${e.message}`).join('\n  ');
      throw new Error(`Validation failed:\n  ${msgs}`);
    }

    const rootId = _findRootId(messages as SchemaObj[]);

    for (const message of messages) {
      if (typeof message !== 'object' || message === null) continue;
      const msg = message as SchemaObj;

      let components: unknown = null;
      if ('surfaceUpdate' in msg) {
        // v0.8
        components = (msg['surfaceUpdate'] as SchemaObj)?.[COMPONENTS];
      } else if ('updateComponents' in msg && typeof msg['updateComponents'] === 'object') {
        // v0.9
        components = (msg['updateComponents'] as SchemaObj)?.[COMPONENTS];
      }

      if (Array.isArray(components)) {
        const refMap = _extractComponentRefFields(this._catalog);
        _validateComponentIntegrity(rootId, components as SchemaObj[], refMap);
        _validateTopology(rootId, components as SchemaObj[], refMap);
      }

      _validateRecursionAndPaths(msg);
    }
  }
}

function _findRootId(messages: SchemaObj[]): string {
  for (const message of messages) {
    if ('beginRendering' in message) {
      return ((message['beginRendering'] as SchemaObj)?.[ROOT] as string | undefined) ?? ROOT;
    }
  }
  return ROOT;
}

function _validateComponentIntegrity(
  rootId: string,
  components: SchemaObj[],
  refMap: Map<string, [Set<string>, Set<string>]>,
): void {
  const ids = new Set<string>();

  for (const comp of components) {
    const compId = comp[ID] as string | undefined;
    if (compId === undefined) continue;
    if (ids.has(compId)) {
      throw new Error(`Duplicate component ID: ${compId}`);
    }
    ids.add(compId);
  }

  if (!ids.has(rootId)) {
    throw new Error(`Missing root component: No component has id='${rootId}'`);
  }

  for (const comp of components) {
    for (const [refId, fieldName] of _getComponentReferences(comp, refMap)) {
      if (!ids.has(refId)) {
        throw new Error(
          `Component '${comp[ID]}' references non-existent component '${refId}' in field '${fieldName}'`,
        );
      }
    }
  }
}

function _validateTopology(
  rootId: string,
  components: SchemaObj[],
  refMap: Map<string, [Set<string>, Set<string>]>,
): void {
  const adjList = new Map<string, string[]>();
  const allIds = new Set<string>();

  for (const comp of components) {
    const compId = comp[ID] as string | undefined;
    if (compId === undefined) continue;
    allIds.add(compId);
    if (!adjList.has(compId)) adjList.set(compId, []);

    for (const [refId, fieldName] of _getComponentReferences(comp, refMap)) {
      if (refId === compId) {
        throw new Error(
          `Self-reference detected: Component '${compId}' references itself in field '${fieldName}'`,
        );
      }
      adjList.get(compId)!.push(refId);
    }
  }

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string, depth: number): void {
    if (depth > MAX_GLOBAL_DEPTH) {
      throw new Error(`Global recursion limit exceeded: logical depth > ${MAX_GLOBAL_DEPTH}`);
    }
    visited.add(nodeId);
    recursionStack.add(nodeId);

    for (const neighbor of adjList.get(nodeId) ?? []) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, depth + 1);
      } else if (recursionStack.has(neighbor)) {
        throw new Error(`Circular reference detected involving component '${neighbor}'`);
      }
    }

    recursionStack.delete(nodeId);
  }

  if (allIds.has(rootId)) {
    dfs(rootId, 0);
  }

  const orphans = [...allIds].filter((id) => !visited.has(id));
  if (orphans.length > 0) {
    throw new Error(`Component '${orphans.sort()[0]}' is not reachable from '${rootId}'`);
  }
}

function _extractComponentRefFields(
  catalog: A2uiCatalog,
): Map<string, [Set<string>, Set<string>]> {
  const refMap = new Map<string, [Set<string>, Set<string>]>();

  let allComponents: Record<string, unknown> = {};

  if (catalog.version === VERSION_0_8) {
    try {
      const s2c = catalog.s2cSchema ?? {};
      const props = (s2c['properties'] as SchemaObj) ?? {};
      if ('surfaceUpdate' in props) {
        const su = (props['surfaceUpdate'] as SchemaObj)['properties'] as SchemaObj ?? {};
        if ('components' in su) {
          const items = ((su['components'] as SchemaObj)['items'] as SchemaObj) ?? {};
          if ('properties' in items) {
            const compWrapper = (items['properties'] as SchemaObj)['component'] as SchemaObj ?? {};
            allComponents = (compWrapper['properties'] as Record<string, unknown>) ?? {};
          }
        }
      }
    } catch {
      // ignore
    }
    if (Object.keys(allComponents).length === 0 && catalog.catalogSchema) {
      allComponents = (catalog.catalogSchema[CATALOG_COMPONENTS_KEY] as Record<string, unknown>) ?? {};
    }
  } else {
    allComponents = (catalog.catalogSchema[CATALOG_COMPONENTS_KEY] as Record<string, unknown>) ?? {};
  }

  function isComponentIdRef(propSchema: unknown): boolean {
    if (typeof propSchema !== 'object' || propSchema === null) return false;
    const ps = propSchema as SchemaObj;
    const ref = ps['$ref'];
    if (typeof ref === 'string' && (ref.endsWith('ComponentId') || ref.endsWith('child') || ref.includes('/child'))) {
      return true;
    }
    if (ps['type'] === 'string' && ps['title'] === 'ComponentId') return true;
    for (const key of ['oneOf', 'anyOf', 'allOf'] as const) {
      if (Array.isArray(ps[key])) {
        if ((ps[key] as unknown[]).some(isComponentIdRef)) return true;
      }
    }
    return false;
  }

  function isChildListRef(propSchema: unknown): boolean {
    if (typeof propSchema !== 'object' || propSchema === null) return false;
    const ps = propSchema as SchemaObj;
    const ref = ps['$ref'];
    if (typeof ref === 'string' && (ref.endsWith('ChildList') || ref.endsWith('children') || ref.includes('/children'))) {
      return true;
    }
    if (ps['type'] === 'object') {
      const props2 = ps['properties'] as SchemaObj | undefined;
      if (props2 && ('explicitList' in props2 || 'template' in props2 || 'componentId' in props2)) return true;
    }
    if (ps['type'] === 'array') {
      if (isComponentIdRef(ps['items'])) return true;
    }
    for (const key of ['oneOf', 'anyOf', 'allOf'] as const) {
      if (Array.isArray(ps[key])) {
        if ((ps[key] as unknown[]).some(isChildListRef)) return true;
      }
    }
    return false;
  }

  for (const [compName, compSchema] of Object.entries(allComponents)) {
    const singleRefs = new Set<string>();
    const listRefs = new Set<string>();

    function extractFromProps(cs: unknown): void {
      if (typeof cs !== 'object' || cs === null) return;
      const cso = cs as SchemaObj;
      const props2 = cso['properties'] as Record<string, unknown> | undefined;
      if (props2) {
        for (const [propName, propSchema] of Object.entries(props2)) {
          if (isComponentIdRef(propSchema) || ['child', 'contentChild', 'entryPointChild'].includes(propName)) {
            singleRefs.add(propName);
          } else if (isChildListRef(propSchema) || propName === 'children') {
            listRefs.add(propName);
          }
        }
      }
      for (const key of ['allOf', 'oneOf', 'anyOf'] as const) {
        if (Array.isArray(cso[key])) {
          for (const sub of cso[key] as unknown[]) {
            extractFromProps(sub);
          }
        }
      }
    }

    extractFromProps(compSchema);
    if (singleRefs.size > 0 || listRefs.size > 0) {
      refMap.set(compName, [singleRefs, listRefs]);
    }
  }

  return refMap;
}

function* _getComponentReferences(
  component: SchemaObj,
  refFieldsMap: Map<string, [Set<string>, Set<string>]>,
): Generator<[string, string]> {
  if ('component' in component) {
    const compVal = component['component'];
    if (typeof compVal === 'string') {
      // v0.9 flattened
      yield* _getRefsRecursively(compVal, component, refFieldsMap);
    } else if (typeof compVal === 'object' && compVal !== null) {
      // v0.8 structured
      for (const [cType, cProps] of Object.entries(compVal as SchemaObj)) {
        if (typeof cProps === 'object' && cProps !== null) {
          yield* _getRefsRecursively(cType, cProps as SchemaObj, refFieldsMap);
        }
      }
    }
  }
}

function* _getRefsRecursively(
  compType: string,
  props: SchemaObj,
  refFieldsMap: Map<string, [Set<string>, Set<string>]>,
): Generator<[string, string]> {
  if (!compType || typeof props !== 'object' || props === null) return;

  const [singleRefs, listRefs] = refFieldsMap.get(compType) ?? [new Set<string>(), new Set<string>()];

  for (const [key, value] of Object.entries(props)) {
    if (singleRefs.has(key)) {
      if (typeof value === 'string') {
        yield [value, key];
      } else if (typeof value === 'object' && value !== null && 'componentId' in (value as SchemaObj)) {
        yield [(value as SchemaObj)['componentId'] as string, `${key}.componentId`];
      }
    } else if (listRefs.has(key)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'string') yield [item, key];
        }
      } else if (typeof value === 'object' && value !== null) {
        const val = value as SchemaObj;
        if ('explicitList' in val && Array.isArray(val['explicitList'])) {
          for (const item of val['explicitList'] as unknown[]) {
            if (typeof item === 'string') yield [item, `${key}.explicitList`];
          }
        } else if ('template' in val) {
          const template = val['template'] as SchemaObj | undefined;
          if (template && 'componentId' in template) {
            yield [template['componentId'] as string, `${key}.template.componentId`];
          }
        } else if ('componentId' in val) {
          yield [val['componentId'] as string, `${key}.componentId`];
        }
      }
    }

    // Special handling for tabs or other nested arrays
    if (Array.isArray(value) && !listRefs.has(key)) {
      for (let idx = 0; idx < value.length; idx++) {
        const item = value[idx];
        if (typeof item === 'object' && item !== null) {
          const childId = (item as SchemaObj)['child'];
          if (typeof childId === 'string') {
            yield [childId, `${key}[${idx}].child`];
          }
        }
      }
    }
  }
}

function _validateRecursionAndPaths(data: unknown): void {
  function traverse(item: unknown, globalDepth: number, funcDepth: number): void {
    if (globalDepth > MAX_GLOBAL_DEPTH) {
      throw new Error(`Global recursion limit exceeded: Depth > ${MAX_GLOBAL_DEPTH}`);
    }

    if (Array.isArray(item)) {
      for (const x of item) {
        traverse(x, globalDepth + 1, funcDepth);
      }
      return;
    }

    if (typeof item === 'object' && item !== null) {
      const obj = item as SchemaObj;

      // Check for path
      if (PATH in obj && typeof obj[PATH] === 'string') {
        if (!JSON_POINTER_PATTERN.test(obj[PATH] as string)) {
          throw new Error(`Invalid JSON Pointer syntax: '${obj[PATH]}'`);
        }
      }

      const isFunc = CALL in obj && ARGS in obj;
      if (isFunc) {
        if (funcDepth >= MAX_FUNC_CALL_DEPTH) {
          throw new Error(`Recursion limit exceeded: functionCall depth > ${MAX_FUNC_CALL_DEPTH}`);
        }
        for (const [k, v] of Object.entries(obj)) {
          if (k === ARGS) {
            traverse(v, globalDepth + 1, funcDepth + 1);
          } else {
            traverse(v, globalDepth + 1, funcDepth);
          }
        }
      } else {
        for (const v of Object.values(obj)) {
          traverse(v, globalDepth + 1, funcDepth);
        }
      }
    }
  }

  traverse(data, 0, 0);
}
