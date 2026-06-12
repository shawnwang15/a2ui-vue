import {
  ComponentContext,
  GenericBinder,
  A2uiStateError,
} from '@a2ui/web_core/v0_9';
import { onUnmounted, shallowRef, watch, type Ref } from 'vue';
import { useMessageProcessor } from '../data/processor';
import type { VueComponentNode } from './catalog';
import { SCHEMA_REGISTRY } from './schemas';

/**
 * Reference to a child component emitted by the binder for STRUCTURAL
 * (ChildList) properties: a component id plus the data-model base path that
 * scopes its relative bindings.
 */
export interface ChildRef {
  id: string;
  basePath: string;
}

export interface UseBinderResult {
  /**
   * Reactive snapshot of the component's resolved props, mirroring the Lit
   * `A2uiController.props`. Contains resolved DYNAMIC values, ACTION callbacks
   * (`() => void`), STRUCTURAL child refs (`{ id, basePath }[]`), generated
   * `setXxx` setters for dynamic props, plus `isValid` / `validationErrors`.
   */
  bound: Ref<Record<string, any>>;
  /**
   * Convert binder STRUCTURAL child refs into renderable `VueComponentNode`s
   * using the processor's node builder.
   */
  resolveChildren: (refs: ChildRef[] | undefined) => VueComponentNode[];
}

/**
 * Vue counterpart of the Lit `A2uiController`.
 *
 * Creates a {@link GenericBinder} from a {@link ComponentContext} and the
 * component's real Zod schema, then bridges the binder's subscription model
 * into a Vue `shallowRef` (`bound`). The binder is recreated whenever the
 * component identity changes and disposed on unmount.
 *
 * Components that have no registered schema or whose surface is not yet
 * available degrade gracefully to an empty (but reactive) `bound` object.
 */
export function useBinder(props: {
  surfaceId: string | null;
  component: VueComponentNode;
}): UseBinderResult {
  const processor = useMessageProcessor();
  const bound = shallowRef<Record<string, any>>({});

  let binder: GenericBinder<Record<string, any>> | null = null;
  let unsubscribe: (() => void) | null = null;

  function teardown() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    if (binder) {
      binder.dispose();
      binder = null;
    }
  }

  function setup() {
    teardown();

    const surfaceId = props.surfaceId;
    if (!surfaceId) {
      bound.value = {};
      return;
    }

    const surface = processor.getSurface(surfaceId);
    const schema = SCHEMA_REGISTRY[props.component.type];
    if (!surface || !schema) {
      bound.value = {};
      return;
    }

    let context: ComponentContext;
    try {
      context = new ComponentContext(
        surface,
        props.component.id,
        props.component.dataContextPath,
      );
    } catch (err) {
      // The component may not exist yet (e.g. mid-update); degrade gracefully.
      if (!(err instanceof A2uiStateError)) {
        console.warn('[a2ui-vue] useBinder: failed to create context', err);
      }
      bound.value = {};
      return;
    }

    binder = new GenericBinder<Record<string, any>>(context, schema);
    bound.value = { ...binder.snapshot };
    const sub = binder.subscribe((next) => {
      // New reference so Vue's shallowRef triggers dependents.
      bound.value = { ...next };
    });
    unsubscribe = () => sub.unsubscribe();
  }

  watch(
    () => [props.surfaceId, props.component.id, props.component.dataContextPath],
    () => setup(),
    { immediate: true },
  );

  onUnmounted(teardown);

  function resolveChildren(refs: ChildRef[] | undefined): VueComponentNode[] {
    if (!Array.isArray(refs) || !props.surfaceId) return [];
    const surfaceId = props.surfaceId;
    return refs
      .map((ref) => processor.buildVueNode(surfaceId, ref.id, ref.basePath))
      .filter((n): n is VueComponentNode => !!n);
  }

  return { bound, resolveChildren };
}
