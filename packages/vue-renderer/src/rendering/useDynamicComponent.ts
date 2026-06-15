


import type { A2uiClientAction, A2uiMessage } from '@a2ui/web_core/v0_9';
import { useA2UIConfig } from '../config';
import { useMessageProcessor } from '../data/processor';
import type { VueComponentNode } from './catalog';
import { useBinder } from './useBinder';

let idCounter = 0;

/**
 * Composable used inside every catalog component. Provides convenience helpers
 * for resolving v0.9 dynamic values, dispatching client actions, and writing
 * back to the data model.
 *
 * Notes on v0.9 vs v0.8 differences:
 * - `Action` is `{ event: { name, context } }` or `{ functionCall: ... }`.
 * - The wire-level client message is `{ version: 'v0.9', action: A2uiClientAction }`.
 * - `DynamicValue` is either a literal primitive, `{ path }` (data binding),
 *   or `{ call, args, returnType }` (function call). The renderer keeps a
 *   small backward-compatibility shim for the legacy `literal*` wrappers so
 *   that existing samples continue to work during migration.
 */
export function useDynamicComponent<T extends VueComponentNode = VueComponentNode>(props: {
  surfaceId: string | null;
  component: T;
  weight: string | number;
}) {
  const { theme } = useA2UIConfig();
  const processor = useMessageProcessor();

  // GenericBinder-backed reactive props (mirrors the Lit `A2uiController`).
  // Additive: existing helpers below remain fully functional.
  const { bound, resolveChildren } = useBinder(props);

  /**
   * Build a v0.9 `A2uiClientAction` from a component-side action descriptor
   * and forward it through the processor to any registered listener.
   */
  function sendAction(action: any): Promise<A2uiMessage[]> {
    const component = props.component;
    const surfaceId = props.surfaceId ?? '';
    const context: Record<string, unknown> = {};
    const a = action as Record<string, any>;

    // v0.9 shape: action.event.context is a Record<string, DynamicValue>
    if (a.event?.context) {
      for (const [key, value] of Object.entries(a.event.context)) {
        context[key] = resolveDynamicValue(value);
      }
    }

    // v0.9 shape: action.functionCall is { call, args } where each arg is a
    // DynamicValue. Resolve the args (data bindings / literals) into context.
    if (a.functionCall) {
      const args = a.functionCall.args as Record<string, unknown> | undefined;
      if (args) {
        for (const [key, value] of Object.entries(args)) {
          context[key] = resolveDynamicValue(value);
        }
      }
    }

    // v0.8 backward-compat: action.context is an array of { key, value } pairs
    if (Array.isArray(a.context)) {
      for (const item of a.context) {
        context[item.key] = resolveDynamicValue(item.value);
      }
    }

    // const name: string = a.event?.name ?? a.functionCall?.call ?? a.name ?? '';
    const name: string = a.event?.name ?? a.name ?? '';
    const clientAction: A2uiClientAction = {
      name,
      sourceComponentId: component.id,
      surfaceId,
      timestamp: new Date().toISOString(),
      context,
    };

    return processor.dispatch(clientAction);
  }

  /**
   * Resolve a `DynamicValue`-shaped argument to its concrete runtime value.
   * Used both inside `sendAction` and by `resolvePrimitive`. Synchronous —
   * does not subscribe to data-model changes.
   */
  function resolveDynamicValue(value: unknown): unknown {
    if (value === null || value === undefined) return null;
    if (typeof value !== 'object') return value;

    const obj = value as Record<string, unknown>;

    if (typeof obj.path === 'string') {
      return processor.getData(props.component, obj.path, props.surfaceId ?? undefined);
    }

    // v0.9 function call: { call, args, returnType }
    if (typeof obj.call === 'string') {
      return processor.resolveValue(props.component, value, props.surfaceId ?? undefined);
    }

    // v0.8 compat literal wrappers
    if ('literal' in obj) return obj.literal;
    if ('literalString' in obj) return obj.literalString ?? null;
    if ('literalNumber' in obj) return obj.literalNumber ?? null;
    if ('literalBoolean' in obj) return obj.literalBoolean ?? null;

    return null;
  }

  /**
   * Resolves a `DynamicString | DynamicNumber | DynamicBoolean` into a Vue
   * primitive. Returns `null` when the value is missing.
   */
  function resolvePrimitive(value: unknown): string | number | boolean | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      if (typeof obj.path === 'string') {
        return processor.getData(props.component, obj.path, props.surfaceId ?? undefined) as
          | string
          | number
          | boolean
          | null;
      }
      // v0.9 function call: { call, args, returnType }
      if (typeof obj.call === 'string') {
        const resolved = processor.resolveValue(
          props.component,
          value,
          props.surfaceId ?? undefined,
        );
        if (resolved === null || resolved === undefined) return null;
        if (
          typeof resolved === 'string' ||
          typeof resolved === 'number' ||
          typeof resolved === 'boolean'
        ) {
          return resolved;
        }
        // Fallback: stringify non-primitive results so the UI shows something.
        return String(resolved);
      }
      if ('literal' in obj) return obj.literal as string | number | boolean | null;
      if ('literalString' in obj) return (obj.literalString as string) ?? null;
      if ('literalNumber' in obj) return (obj.literalNumber as number) ?? null;
      if ('literalBoolean' in obj) return (obj.literalBoolean as boolean) ?? null;
    }
    return null;
  }

  function getUniqueId(prefix: string): string {
    return `${prefix}-${idCounter++}`;
  }

  function setData(
    node: VueComponentNode,
    relativePath: string,
    value: unknown,
    surfaceId?: string | null,
  ) {
    processor.setData(node, relativePath, value, surfaceId);
  }

  /**
   * Extracts the data-binding path from a `{ path }` value, used by input
   * components to write back changes to the same source.
   */
  function getBindingPath(value: unknown): string | undefined {
    if (typeof value === 'object' && value !== null && typeof (value as any).path === 'string') {
      return (value as any).path as string;
    }
    return undefined;
  }

  return {
    theme,
    processor,
    bound,
    resolveChildren,
    // @deprecated v1.0
    sendAction,
    // @deprecated v1.0
    resolveDynamicValue,
    // @deprecated v1.0
    resolvePrimitive,
    getUniqueId,
    setData,
    getBindingPath,
  };
}
