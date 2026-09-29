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

import {describe, it} from 'node:test';
import * as assert from 'node:assert';

import {z} from 'zod';
import {ComponentContext} from './component-context.js';
import {SurfaceModel} from '../state/surface-model.js';
import {ComponentModel} from '../state/component-model.js';
import {Catalog, createFunctionImplementation, type ComponentApi} from '../catalog/types.js';
import {DataContext} from './data-context.js';

describe('ComponentContext', () => {
  const mockSurface = new SurfaceModel('surface1', {} as any);
  const componentId = 'comp1';

  // Add a component to the surface model for testing
  const componentModel = new ComponentModel(componentId, 'TestComponent', {});
  mockSurface.componentsModel.addComponent(componentModel);

  it('initializes correctly', () => {
    const context = new ComponentContext(mockSurface, componentId);
    assert.strictEqual(context.componentModel, componentModel);
    assert.ok(context.dataContext);
    assert.strictEqual(context.surfaceComponents, mockSurface.componentsModel);
  });

  it('dispatches actions', async () => {
    const context = new ComponentContext(mockSurface, componentId);
    let actionDispatched: any = null;

    const subscription = mockSurface.onAction.subscribe((action: any) => {
      actionDispatched = action;
    });

    await context.dispatchAction({event: {name: 'test', context: {a: 1}}});

    assert.strictEqual(actionDispatched.name, 'test');
    assert.strictEqual(actionDispatched.sourceComponentId, componentId);
    assert.deepStrictEqual(actionDispatched.context, {a: 1});
    subscription.unsubscribe();
  });

  it('executes functionCall actions locally without emitting a client event', async () => {
    // Build a real catalog with a locally-registered ``redirect`` function, the
    // same shape Android registers via its A2UIRedirectFunction.
    const redirectFn = createFunctionImplementation(
      {
        name: 'redirect',
        returnType: 'void',
        schema: z.object({url: z.string()}),
      },
      (args: {url: string}, _ctx: DataContext) => {
        openedUrls.push(args.url);
      },
    );
    const openedUrls: string[] = [];
    const catalog = new Catalog<ComponentApi>('test', [], [redirectFn]);
    const surface = new SurfaceModel('s1', catalog as any);
    surface.componentsModel.addComponent(new ComponentModel('c1', 'Button', {}));
    const context = new ComponentContext(surface, 'c1');

    let serverActionEmitted: any = null;
    const sub = surface.onAction.subscribe((a: any) => {
      serverActionEmitted = a;
    });

    await context.dispatchAction({
      functionCall: {
        call: 'redirect',
        args: {url: 'https://example.com'},
      },
    });

    // The local function ran with resolved args.
    assert.deepStrictEqual(openedUrls, ['https://example.com']);
    // No event was emitted to the surface/server for a local functionCall.
    assert.strictEqual(serverActionEmitted, null);
    sub.unsubscribe();
  });

  it('resolves dynamic values inside functionCall args before invoking', async () => {
    const registeredFns = createFunctionImplementation(
      {
        name: 'openUrl',
        returnType: 'void',
        schema: z.object({target: z.string()}),
      },
      (args: {target: string}, _ctx: DataContext) => {
        receivedTarget = args.target;
      },
    );
    const catalog = new Catalog<ComponentApi>('test', [], [registeredFns]);
    const surface = new SurfaceModel('s2', catalog as any);
    surface.componentsModel.addComponent(new ComponentModel('c1', 'Button', {}));
    // Seed the data model so the { path } binding resolves.
    surface.dataModel.set('/target', 'https://example.com/from-data');
    const context = new ComponentContext(surface, 'c1');
    let receivedTarget = '';

    await context.dispatchAction({
      functionCall: {
        call: 'openUrl',
        args: {target: {path: '/target'}},
      },
    });

    assert.strictEqual(receivedTarget, 'https://example.com/from-data');
  });

  it('throws error if component not found', () => {
    assert.throws(() => {
      new ComponentContext(mockSurface, 'nonExistentId');
    }, /Component not found: nonExistentId/);
  });

  it('creates data context with correct base path', () => {
    const context = new ComponentContext(mockSurface, componentId, '/foo/bar');
    assert.strictEqual(context.dataContext.path, '/foo/bar');
  });

  it('exposes theme from surface', () => {
    const theme = {primaryColor: '#FF5733'};
    const themedSurface = new SurfaceModel('themed', {} as any, theme);
    const comp = new ComponentModel('c1', 'Text', {});
    themedSurface.componentsModel.addComponent(comp);

    const context = new ComponentContext(themedSurface, 'c1');
    assert.deepStrictEqual(context.theme, theme);
    assert.strictEqual(context.theme.primaryColor, '#FF5733');
  });

  it('exposes empty theme when none provided', () => {
    const context = new ComponentContext(mockSurface, componentId);
    assert.deepStrictEqual(context.theme, {});
  });
});
