

import type { Component, DefineComponent } from 'vue';
import { z } from 'zod';
import {
  Catalog as CoreCatalog,
  type ComponentApi,
} from '@a2ui/web_core/v0_9';
import { BASIC_FUNCTIONS } from '@a2ui/web_core/v0_9/basic_catalog';

/**
 * A v0.9 ComponentApi specialised for the Vue renderer.
 *
 * Mirrors the angular `AngularComponentImplementation` / lit `LitComponentApi`
 * pattern: extends the core ComponentApi with framework-specific metadata.
 * For Vue we only need a `name` + a permissive `schema`; the actual Vue
 * component class is resolved through the Vue-style `Catalog` map below.
 */
export interface VueComponentApi extends ComponentApi {
  /** Component name as it appears in the A2UI JSON. */
  readonly name: string;
  /** Zod schema describing the component's properties (permissive by default). */
  readonly schema: z.ZodType<any>;
}

/**
 * Lightweight adapter object passed to Vue components in lieu of the v0.8
 * `AnyComponentNode` tree. Built from a v0.9 `ComponentModel`.
 */
export interface VueComponentNode {
  id: string;
  type: string;
  properties: Record<string, any>;
  /** Absolute base path of the component within its surface's data model. */
  dataContextPath: string;
  weight?: string | number;
}

export type CatalogLoader = () =>
  | Promise<Component | DefineComponent<any, any, any>>
  | Component
  | DefineComponent<any, any, any>;

export type CatalogEntry =
  | CatalogLoader
  | {
      type: CatalogLoader;
      props: (node: VueComponentNode) => Record<string, any>;
    };

/**
 * Vue-style catalog: a plain map from component-type name to its loader and
 * (optional) prop-extraction function. This is the user-facing catalog format
 * that has been part of vue-renderer's API since v0.8 and is intentionally
 * preserved for backwards compatibility.
 */
export interface Catalog {
  [key: string]: CatalogEntry;
}

/**
 * Builds a v0.9 `Catalog<VueComponentApi>` from the Vue-style plain map so it
 * can be handed to the v0.9 `MessageProcessor`. Every entry maps to a minimal
 * `ComponentApi` with a permissive schema (the renderer relies on the
 * agent-side validator for schema enforcement).
 */
export function buildCoreCatalog(catalog: Catalog, id: string = 'default'): CoreCatalog<VueComponentApi> {
  const components: VueComponentApi[] = Object.keys(catalog).map((name) => ({
    name,
    schema: z.any(),
  }));
  // Register basic v0.9 functions (formatString, formatDate, arithmetic, etc.)
  // so that DataContext.resolveSignal can evaluate `{ call: ..., args: ... }`.
  return new CoreCatalog<VueComponentApi>(id, components, BASIC_FUNCTIONS);
}
