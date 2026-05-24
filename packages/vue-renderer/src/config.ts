


import { inject, type InjectionKey, type App } from 'vue';
import {
  buildCoreCatalog,
  type Catalog,
  type VueComponentApi,
} from './rendering/catalog';
import type { Catalog as CoreCatalog } from '@a2ui/web_core/v0_9';
import { useMessageProcessor ,MESSAGE_PROCESSOR_KEY} from './data/processor';

/**
 * Theme shape used by the Vue renderer. Mirrors the legacy v0.8 `Types.Theme`
 * structure but is now defined locally so the renderer no longer depends on
 * v0.8 protocol type imports. The shape is intentionally permissive — callers
 * may extend it via `additionalStyles` / per-component slots.
 */
export interface A2UITheme {
  additionalStyles?: Record<string, any>;
  components: Record<string, any>;
  elements?: Record<string, any>;
  markdown?: Record<string, string[]>;
}

export interface A2UIConfig {
  catalog: Catalog;
  theme: A2UITheme;
  /** Catalog identifier used when the agent issues `createSurface`. */
  catalogId: string;
  /** Pre-built v0.9 `Catalog<VueComponentApi>` derived from `catalog`. */
  coreCatalog: CoreCatalog<VueComponentApi>;
}

export interface ProvideA2UIOptions {
  app: App
  catalog: Catalog;
  theme: A2UITheme;
  /** Catalog id matching the `catalogId` field of `createSurface` messages. Defaults to `'default'`. */
  catalogId?: string;
}

export const A2UI_CONFIG_KEY: InjectionKey<A2UIConfig> = Symbol('a2ui-config');

/**
 * Provide an A2UI configuration to descendant components and bind the
 * v0.9 catalog to the message processor.
 *
 * Must be called from inside a Vue `setup()` so that `provide()` and
 * `useMessageProcessor()` resolve correctly.
 */
export function provideA2UI(options: ProvideA2UIOptions): void {
  const catalogId = options.catalogId ?? 'default';
  const coreCatalog = buildCoreCatalog(options.catalog, catalogId);

  const config: A2UIConfig = {
    catalog: options.catalog,
    theme: options.theme,
    catalogId,
    coreCatalog,
  };
  options.app.provide(A2UI_CONFIG_KEY, config);

  // Wire the catalog into the v0.9 processor so subsequent `processMessages`
  // calls can resolve `createSurface` messages against the active catalog.
  const processor = useMessageProcessor();
  options.app.provide(MESSAGE_PROCESSOR_KEY, processor);
  processor.setCatalogs([coreCatalog]);
}

export function useA2UIConfig(): A2UIConfig {
  const config = inject(A2UI_CONFIG_KEY);
  if (!config) {
    throw new Error('A2UI config not provided. Please call provideA2UI() in a parent component.');
  }
  return config;
}
