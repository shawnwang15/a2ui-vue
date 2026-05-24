

// Core exports
export { provideA2UI, useA2UIConfig } from './config';
export type { A2UIConfig, A2UITheme, ProvideA2UIOptions } from './config';
export { useMessageProcessor, MessageProcessor } from './data/processor';
export type { DispatchedEvent } from './data/processor';
export { useMarkdownRenderer } from './data/markdown';
export type { A2AServerPayload, A2TextPayload, A2DataPayload } from './data/types';

// Rendering exports
export { default as A2UiRenderer } from './rendering/A2UIRenderer.vue';
export { useDynamicComponent } from './rendering/useDynamicComponent';
export { buildCoreCatalog } from './rendering/catalog';
export type {
  Catalog,
  CatalogEntry,
  CatalogLoader,
  VueComponentApi,
  VueComponentNode,
} from './rendering/catalog';
export { DEFAULT_CATALOG } from './catalog/default';

// Component exports
export { default as A2UISurface } from './catalog/A2UISurface.vue';
export { theme as defaultTheme } from './theme';

// Re-export commonly used v0.9 types from @a2ui/web_core for downstream samples.
export type {
  A2uiMessage,
  A2uiClientAction,
  A2uiClientMessage,
  A2uiClientCapabilities,
} from '@a2ui/web_core/v0_9';
