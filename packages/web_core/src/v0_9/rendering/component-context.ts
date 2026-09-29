/*
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {DataContext} from './data-context.js';
import {ComponentModel} from '../state/component-model.js';
import type {SurfaceModel} from '../state/surface-model.js';
import type {SurfaceComponentsModel} from '../state/surface-components-model.js';
import {A2uiStateError} from '../errors.js';
import type {DynamicValue} from '../schema/common-types.js';

/**
 * Context provided to components during rendering.
 * It provides access to the component's model, the data context, and a way to dispatch actions.
 */
export class ComponentContext {
  /** The state model for this specific component, providing access to its properties and state. */
  readonly componentModel: ComponentModel;
  /**
   * The data context scoped to this component's position in the visual hierarchy.
   * Uses the `dataModelBasePath` to resolve relative data paths.
   */
  readonly dataContext: DataContext;
  /** The collection of all component models for the current surface, allowing lookups by ID. */
  readonly surfaceComponents: SurfaceComponentsModel;
  /** The theme configuration for the surface this component belongs to. */
  readonly theme: any;

  /**
   * Creates a new component context.
   *
   * @param surface The surface model the component belongs to.
   * @param componentId The ID of the component.
   * @param dataModelBasePath The base path for data model access (default: '/').
   */
  constructor(surface: SurfaceModel<any>, componentId: string, dataModelBasePath: string = '/') {
    const model = surface.componentsModel.get(componentId);
    if (!model) {
      throw new A2uiStateError(`Component not found: ${componentId}`);
    }
    this.componentModel = model;
    this.surfaceComponents = surface.componentsModel;
    this.theme = surface.theme;

    this.dataContext = new DataContext(surface, dataModelBasePath);
    this._actionDispatcher = action => surface.dispatchAction(action, this.componentModel.id);
  }

  private _actionDispatcher: (action: any) => Promise<void>;

  /**
   * Dispatches an action from the component.
   *
   * Per the v0.9 spec, an `Action` is `{ event: ... }` OR `{ functionCall: ... }`.
   * - `event` actions are forwarded to the surface (and from there to the server).
   * - `functionCall` actions are executed entirely on the renderer, locally, by
   *   looking up the named function in the surface catalog and invoking it. This
   *   mirrors the reference Android implementation where buttons can call local
   *   client-side functions such as `openUrl` / `redirect`.
   *
   * @param action The action to dispatch.
   */
  dispatchAction(action: any): Promise<void> {
    if (
      action &&
      typeof action === 'object' &&
      action.functionCall &&
      typeof action.functionCall === 'object' &&
      typeof action.functionCall.call === 'string'
    ) {
      return this.runLocalFunctionCall(action.functionCall);
    }
    return this._actionDispatcher(action);
  }

  /**
   * Locally executes a `functionCall` action (renderer-local side-effect).
   *
   * The `args` are resolved as `DynamicValue`s (literals, `{ path }` data
   * bindings and `{ call }` function expressions) against this component's
   * {@link DataContext}, then passed to the catalog function implementation.
   * The result is intentionally NOT emitted to the server: function calls in
   * the action position are executed entirely on the renderer.
   */
  private async runLocalFunctionCall(functionCall: {call: string; args?: any}): Promise<void> {
    const {call, args} = functionCall;
    const resolvedArgs: Record<string, any> = {};

    if (args && typeof args === 'object') {
      for (const [key, value] of Object.entries(args)) {
        // Args may be plain literal objects (e.g. ``{ rn: { launchParams } }``);
        // resolveDynamicValue passes non-binding objects through unchanged.
        resolvedArgs[key] = this.dataContext.resolveDynamicValue(value as DynamicValue);
      }
    }

    const invoker = this.dataContext.functionInvoker;
    const result = invoker(call, resolvedArgs, this.dataContext);
    // Allow both signal-backed and promise-based function implementations.
    if (result && typeof result.then === 'function') {
      await result;
    }
  }
}
