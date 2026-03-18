

// Core exports
export { provideA2UI, useA2UIConfig } from './config';
export { useMessageProcessor, MessageProcessor } from './data/processor';
export { useMarkdownRenderer } from './data/markdown';
export type { A2AServerPayload, A2TextPayload, A2DataPayload } from './data/types';

// Rendering exports
export { default as A2UiRenderer } from './rendering/A2UIRenderer.vue';
export { useDynamicComponent } from './rendering/useDynamicComponent';
export type { Catalog, CatalogEntry } from './rendering/catalog';
export { DEFAULT_CATALOG } from './catalog/default';

// Component exports
export { default as A2UISurface } from './catalog/A2UISurface.vue';
export {theme as defaultTheme} from './theme';
// Re-export types from @a2ui/web_core
// export type * as Types from '@a2ui/web_core/types/types';
// export type * as Primitives from '@a2ui/web_core/types/primitives';
// export * as Styles from '@a2ui/web_core/styles/index';
