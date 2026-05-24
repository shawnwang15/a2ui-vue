


import {
  MessageProcessor as CoreMessageProcessor,
  Catalog as CoreCatalog,
  DataContext,
  type SurfaceModel,
  type A2uiMessage,
  type A2uiClientAction,
} from '@a2ui/web_core/v0_9';
import { inject,  ref, type InjectionKey, type Ref } from 'vue';
import type { VueComponentApi, VueComponentNode } from '../rendering/catalog';

/**
 * A bridged event used by sample apps to forward client actions back to the
 * agent. Mirrors the existing public API but now carries a v0.9
 * `A2uiClientMessage` envelope ({ version: 'v0.9', action: A2uiClientAction }).
 */
export interface DispatchedEvent {
  message: { version: 'v0.9'; action: A2uiClientAction };
  resolve: (messages: A2uiMessage[]) => void;
  reject: (error: Error) => void;
}

/**
 * Vue-renderer message processor.
 *
 * Internally wraps the v0.9 `@a2ui/web_core/v0_9.MessageProcessor` and its
 * `SurfaceGroupModel`, but preserves the synchronous, Vue-friendly API the
 * existing renderer/components rely on (no signal subscriptions in templates).
 *
 * - `setCatalogs(...)` is invoked by `provideA2UI` once the catalog is known.
 * - Internal `version` ref is bumped whenever surfaces / components / data
 *   change, allowing Vue computeds to re-evaluate without per-component
 *   signal wiring.
 */
export class MessageProcessor {
  private core: CoreMessageProcessor<VueComponentApi> | null = null;
  private catalogs: CoreCatalog<VueComponentApi>[] = [];
  private eventHandlers: Set<(event: DispatchedEvent) => void> = new Set();

  /** Bumped on every internal state change; templates may read `.value` to subscribe. */
  readonly version: Ref<number> = ref(0);

  /** Provide the catalog list to the underlying v0.9 processor. */
  setCatalogs(catalogs: CoreCatalog<VueComponentApi>[]): void {
    this.catalogs = catalogs;
    this.rebuildCore();
  }

  private rebuildCore(): void {
    if (this.core) {
      this.core.model.dispose();
    }
    const next = new CoreMessageProcessor<VueComponentApi>(this.catalogs);

    next.onSurfaceCreated((surface) => {
      // Subscribe to all child-model lifecycle events so Vue re-renders.
      surface.componentsModel.onCreated.subscribe((c) => {
        c.onUpdated.subscribe(() => this.bump());
        this.bump();
      });
      surface.componentsModel.onDeleted.subscribe(() => this.bump());
      surface.dataModel.subscribe('/', () => this.bump());
      this.bump();
    });
    next.onSurfaceDeleted(() => this.bump());

    this.core = next;
  }

  private bump(): void {
    this.version.value = this.version.value + 1;
  }

  /** Process a batch of v0.9 server-to-client messages. */
  processMessages(messages: A2uiMessage[]): void {
    if (!this.core) this.rebuildCore();
    this.core!.processMessages(messages);
  }

  /** Dispose all surfaces and rebuild a fresh processor instance. */
  clearSurfaces(): void {
    this.rebuildCore();
    this.bump();
  }

  /** All surface models keyed by id (read-only). */
  getSurfaces(): ReadonlyMap<string, SurfaceModel<VueComponentApi>> {
    // Touch version so Vue computeds calling this become reactive to
    // surface create / delete events without needing manual subscription.
    void this.version.value;
    return this.core?.model.surfacesMap ?? new Map();
  }

  /** Lookup a single surface by id. */
  getSurface(id: string): SurfaceModel<VueComponentApi> | undefined {
    void this.version.value;
    return this.core?.model.getSurface(id);
  }

  /**
   * Resolves a relative path against a base path, producing an absolute JSON
   * pointer. Mirrors v0.9 `MessageProcessor.resolvePath`.
   */
  resolvePath(path: string, basePath?: string): string {
    if (!path) return basePath ?? '/';
    if (path.startsWith('/')) return path;
    if (basePath) {
      const trimmed = basePath.endsWith('/') && basePath.length > 1
        ? basePath.slice(0, -1)
        : basePath === '/'
          ? ''
          : basePath;
      return `${trimmed}/${path}`;
    }
    return `/${path}`;
  }

  /** Read the surface data model at the absolute / relative path. */
  getData(node: VueComponentNode, path: string, surfaceId?: string | null): unknown {
    const sid = surfaceId ?? this.firstSurfaceId();
    if (!sid) return undefined;
    const surface = this.getSurface(sid);
    if (!surface) return undefined;
    const abs = this.resolvePath(path, node.dataContextPath);
    return surface.dataModel.get(abs);
  }

  /**
   * Resolve any v0.9 `DynamicValue` (literal / `{path}` / `{call, args}`) to a
   * concrete value. Goes through the surface catalog's `functionInvoker` so
   * that function calls like `formatString` / `formatDate` are evaluated.
   */
  resolveValue(node: VueComponentNode, value: unknown, surfaceId?: string | null): unknown {
    // Touch version so Vue computeds that call this become reactive.
    void this.version.value;
    if (value === null || value === undefined) return null;
    if (typeof value !== 'object') return value;
    const sid = surfaceId ?? this.firstSurfaceId();
    if (!sid) return null;
    const surface = this.getSurface(sid);
    if (!surface) return null;
    const functions = surface.catalog.functions;
    const functionInvoker = functions
      ? (name: string, args: Record<string, any>, ctx: DataContext, abortSignal?: AbortSignal) => {
          const fn = functions.get(name);
          if (!fn) throw new Error(`A2UI function not registered: ${name}`);
          return fn(args, ctx, abortSignal);
        }
      : undefined;
    const basePath = node.dataContextPath || '/';
    const dataContext = new DataContext(surface.dataModel, basePath, functionInvoker);
    try {
      const sig = dataContext.resolveSignal(value as any);
      return sig.value;
    } catch (err) {
      console.warn('[a2ui-vue] resolveValue failed', err);
      return null;
    }
  }

  /** Write the surface data model at the (possibly relative) path. */
  setData(
    node: VueComponentNode,
    relativePath: string,
    value: unknown,
    surfaceId?: string | null,
  ): void {
    const sid = surfaceId ?? this.firstSurfaceId();
    if (!sid) return;
    const surface = this.getSurface(sid);
    if (!surface) return;
    const abs = this.resolvePath(relativePath, node.dataContextPath);
    surface.dataModel.set(abs, value);
  }

  private firstSurfaceId(): string | undefined {
    const it = this.getSurfaces().keys().next();
    return it.done ? undefined : it.value;
  }

  /**
   * Dispatch a client action to subscribers (sample apps forward it to the
   * agent). The wrapped envelope is `{ version: 'v0.9', action }`.
   */
  dispatch(action: A2uiClientAction): Promise<A2uiMessage[]> {
    return new Promise((resolve, reject) => {
      const event: DispatchedEvent = {
        message: { version: 'v0.9', action },
        resolve,
        reject,
      };
      this.eventHandlers.forEach((h) => h(event));
    });
  }

  /** Register a handler for dispatched client actions. Returns an unsubscribe fn. */
  onEvent(handler: (event: DispatchedEvent) => void): () => void {
    this.eventHandlers.add(handler);
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  /**
   * Build a `VueComponentNode` tree rooted at `componentId` for the given
   * surface, expanding child references (`children` / `child` / `trigger` /
   * `content` / `tabs[].child`) into nested `VueComponentNode`s.
   */
  buildVueNode(
    surfaceId: string,
    componentId: string,
    basePath: string = '/',
  ): VueComponentNode | null {
    const surface = this.getSurface(surfaceId);
    if (!surface) return null;
    return this.buildNodeInner(surface, componentId, basePath);
  }

  private buildNodeInner(
    surface: SurfaceModel<VueComponentApi>,
    componentId: string,
    basePath: string,
  ): VueComponentNode | null {
    const cm = surface.componentsModel.get(componentId);
    if (!cm) return null;
    const expanded = this.expandProperties(surface, cm.properties, basePath);
    return {
      id: cm.id,
      type: cm.type,
      properties: expanded,
      dataContextPath: basePath,
      weight: (cm.properties as Record<string, unknown>).weight as string | number | undefined,
    };
  }

  private expandProperties(
    surface: SurfaceModel<VueComponentApi>,
    props: Record<string, unknown>,
    basePath: string,
  ): Record<string, unknown> {
    const out: Record<string, unknown> = { ...props };

    if ('children' in out) {
      out.children = this.expandChildList(surface, out.children, basePath);
    }
    for (const key of ['child', 'trigger', 'content'] as const) {
      if (key in out) {
        out[key] = this.expandChildRef(surface, out[key], basePath);
      }
    }
    if (Array.isArray(out.tabs)) {
      out.tabs = (out.tabs as Array<Record<string, unknown>>).map((tab) => ({
        ...tab,
        child: this.expandChildRef(surface, tab.child, basePath),
      }));
    }
    return out;
  }

  private expandChildList(
    surface: SurfaceModel<VueComponentApi>,
    list: unknown,
    basePath: string,
  ): VueComponentNode[] {
    if (Array.isArray(list)) {
      return list
        .map((item) => this.expandChildRef(surface, item, basePath))
        .filter((n): n is VueComponentNode => !!n);
    }
    // Dynamic list template: { componentId, path }
    if (
      list &&
      typeof list === 'object' &&
      'componentId' in (list as Record<string, unknown>) &&
      'path' in (list as Record<string, unknown>)
    ) {
      const tmpl = list as { componentId: string; path: string };
      const dataPath = this.resolvePath(tmpl.path, basePath);
      const data = surface.dataModel.get(dataPath);
      if (!Array.isArray(data)) return [];
      const result: VueComponentNode[] = [];
      const cleanBase = dataPath.endsWith('/') && dataPath.length > 1 ? dataPath.slice(0, -1) : dataPath;
      const prefix = cleanBase === '/' ? '' : cleanBase;
      for (let i = 0; i < data.length; i++) {
        const itemBase = `${prefix}/${i}`;
        const node = this.buildNodeInner(surface, tmpl.componentId, itemBase);
        if (node) result.push(node);
      }
      return result;
    }
    return [];
  }

  private expandChildRef(
    surface: SurfaceModel<VueComponentApi>,
    ref: unknown,
    basePath: string,
  ): VueComponentNode | null {
    if (!ref) return null;
    if (typeof ref === 'string') {
      return this.buildNodeInner(surface, ref, basePath);
    }
    if (typeof ref === 'object') {
      const r = ref as Record<string, unknown>;
      // Already-expanded VueComponentNode — pass through.
      if ('properties' in r && 'type' in r && 'id' in r && 'dataContextPath' in r) {
        return r as unknown as VueComponentNode;
      }
      // v0.9 component-reference shapes: { componentId, path? } or { id, basePath? }
      if (typeof r.componentId === 'string') {
        const newBase = typeof r.path === 'string' ? this.resolvePath(r.path, basePath) : basePath;
        return this.buildNodeInner(surface, r.componentId, newBase);
      }
      if (typeof r.id === 'string' && !('component' in r)) {
        const newBase = typeof r.basePath === 'string' ? this.resolvePath(r.basePath, basePath) : basePath;
        return this.buildNodeInner(surface, r.id, newBase);
      }
      // Legacy / inline embedded component: { component, id?, properties?, ... }
      if (typeof r.component === 'string') {
        return {
          id: typeof r.id === 'string' ? r.id : '',
          type: r.component,
          properties: this.expandProperties(
            surface,
            (r.properties as Record<string, unknown>) ?? {},
            basePath,
          ),
          dataContextPath: basePath,
          weight: r.weight as string | number | undefined,
        };
      }
    }
    return null;
  }
}

export const MESSAGE_PROCESSOR_KEY: InjectionKey<MessageProcessor> = Symbol('message-processor');

export function useMessageProcessor(): MessageProcessor {
  let processor = inject(MESSAGE_PROCESSOR_KEY, null);
  if (!processor) {
    processor = new MessageProcessor();
    // provide(MESSAGE_PROCESSOR_KEY, processor);
  }
  return processor;
}
