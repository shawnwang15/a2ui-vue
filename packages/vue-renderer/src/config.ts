

import { inject, provide, type InjectionKey } from 'vue';
import type { Catalog } from './rendering/catalog';
import * as Types from '@a2ui/web_core/types/types';

export interface A2UIConfig {
  catalog: Catalog;
  theme: Types.Theme;
}

export const A2UI_CONFIG_KEY: InjectionKey<A2UIConfig> = Symbol('a2ui-config');

export function provideA2UI(config: A2UIConfig): void {
  provide(A2UI_CONFIG_KEY, config);
}

export function useA2UIConfig(): A2UIConfig {
  const config = inject(A2UI_CONFIG_KEY);
  if (!config) {
    throw new Error('A2UI config not provided. Please call provideA2UI() in a parent component.');
  }
  return config;
}
