

import * as Types from '@a2ui/web_core/types/types';

export function createSingleComponentSurface(type: string, properties: Record<string, unknown>): Types.Surface {
  const rootId = 'root';
  return {
    rootComponentId: rootId,
    dataModel: new Map(),
    styles: {},
    componentTree: {
      id: rootId,
      type: type,
      properties: properties,
    } as Types.AnyComponentNode,
    components: new Map(),
  };
}

export function createComponent(type: string, properties: Record<string, unknown>): Types.AnyComponentNode {
  return {
    id: 'generated-' + Math.random().toString(36).substr(2, 9),
    type: type,
    properties: properties,
  } as Types.AnyComponentNode;
}

export function getJson(surface: Types.Surface): string {
  return JSON.stringify(
    surface,
    (key, value) => {
      if (key === 'rootComponentId' || key === 'dataModel' || key === 'styles') return undefined;
      if (value instanceof Map) return Object.fromEntries(value.entries());
      return value;
    },
    2,
  );
}
