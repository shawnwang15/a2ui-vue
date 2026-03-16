

import type { Component, DefineComponent } from 'vue';
import * as Types from '@a2ui/web_core/types/types';

export type CatalogLoader = () =>
  | Promise<Component | DefineComponent<any, any, any>>
  | Component
  | DefineComponent<any, any, any>;

export type CatalogEntry<T extends Types.AnyComponentNode = Types.AnyComponentNode> =
  | CatalogLoader
  | {
      type: CatalogLoader;
      props: (data: T) => Record<string, any>;
    };

export interface Catalog {
  [key: string]: CatalogEntry<Types.AnyComponentNode>;
}
