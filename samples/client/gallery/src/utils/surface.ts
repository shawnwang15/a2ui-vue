

import type { A2uiMessage } from '@a2ui/web_core/v0_9';

/**
 * Inline component descriptor used when authoring sample surfaces. Mirrors the
 * legacy `Types.AnyComponentNode` shape — the v0.9 flattening is performed by
 * `createSingleComponentSurface`.
 */
export interface InlineComponent {
  type: string;
  id?: string;
  properties: Record<string, unknown>;
}

let counter = 0;
function nextId(prefix: string): string {
  counter += 1;
  return `${prefix.toLowerCase()}-${counter}`;
}

/**
 * Build the list of v0.9 messages that create a surface and populate it with a
 * single, inline component tree. Inline `child` / `children` / `trigger` /
 * `content` / `tabs[].child` are flattened to top-level components and replaced
 * by their id, matching the v0.9 protocol's flat component-list shape.
 */
export function createSingleComponentSurface(
  surfaceId: string,
  type: string,
  properties: Record<string, unknown>,
  catalogId: string = 'default',
): A2uiMessage[] {
  const components: Array<Record<string, unknown>> = [];
  const flat = flattenProperties(properties, components);
  // The root component must have id `root` per v0.9 protocol.
  components.unshift({ id: 'root', component: type, ...flat });
  return [
    { version: 'v0.9', createSurface: { surfaceId, catalogId } },
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId,
        components: components as never,
      },
    },
  ];
}

/** Author-friendly factory for an inline component descriptor. */
export function createComponent(
  type: string,
  properties: Record<string, unknown>,
): InlineComponent {
  return { type, properties };
}

function flattenProperties(
  props: Record<string, unknown>,
  out: Array<Record<string, unknown>>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (key === 'children' && Array.isArray(value)) {
      result.children = value.map((c) => addInline(c as InlineComponent, out));
    } else if (
      (key === 'child' || key === 'trigger' || key === 'content') &&
      value &&
      typeof value === 'object'
    ) {
      result[key] = addInline(value as InlineComponent, out);
    } else if (key === 'tabs' && Array.isArray(value)) {
      result.tabs = value.map((tab) => {
        const t = tab as { title: unknown; child: InlineComponent };
        return { title: t.title, child: addInline(t.child, out) };
      });
    } else {
      result[key] = value;
    }
  }
  return result;
}

function addInline(
  inline: InlineComponent,
  out: Array<Record<string, unknown>>,
): string {
  const id = inline.id ?? nextId(inline.type);
  const flat = flattenProperties(inline.properties ?? {}, out);
  out.push({ id, component: inline.type, ...flat });
  return id;
}

/** Pretty-print a list of v0.9 messages for display in the gallery dialog. */
export function getJson(messages: A2uiMessage[]): string {
  return JSON.stringify(messages, null, 2);
}
