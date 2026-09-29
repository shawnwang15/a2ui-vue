/*
 * Copyright 2026 Google LLC
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

import assert from 'node:assert';
import {describe, it} from 'node:test';
import {z} from 'zod';
import {GenericBinder} from './generic-binder.js';
import {ComponentContext} from './component-context.js';
import {SurfaceModel} from '../state/surface-model.js';
import {Catalog} from '../catalog/types.js';
import {ComponentModel} from '../state/component-model.js';
import {CommonSchemas} from '../schema/common-types.js';

describe('GenericBinder Checkable Trait', () => {
  const mockCatalog = new Catalog('test', [], []);

  function setupSurfaceAndMocks() {
    const surface = new SurfaceModel('s1', mockCatalog);

    // Mock required and min_length functions
    (surface.catalog as any).functions = new Map([
      [
        'required',
        {
          execute: (args: any) => !!args.value,
          schema: z.object({value: z.any()}),
        },
      ],
      [
        'min_length',
        {
          execute: (args: any) => typeof args.value === 'string' && args.value.length >= args.min,
          schema: z.object({value: z.any(), min: z.number()}),
        },
      ],
    ]);
    (surface.catalog as any).invoker = (name: string, args: any) => {
      const fn = (surface.catalog as any).functions.get(name);
      return fn.execute(args);
    };

    const schema = z.object({
      value: CommonSchemas.DynamicString,
      checks: CommonSchemas.Checkable.shape.checks,
    });

    return {surface, schema};
  }

  it('should resolve checkable validation state reactively', async () => {
    const {surface, schema} = setupSurfaceAndMocks();
    surface.dataModel.set('/val', '');

    const compModel = new ComponentModel('c1', 'Test', {
      value: {path: '/val'},
      checks: [
        {
          condition: {
            call: 'required',
            args: {value: {path: '/val'}},
          },
          message: 'Value is required',
        },
      ],
    });
    surface.componentsModel.addComponent(compModel);

    const context = new ComponentContext(surface, 'c1');
    const binder = new GenericBinder<any>(context, schema);
    binder.subscribe(() => {});

    // Initial state: should be invalid
    assert.strictEqual(binder.snapshot.isValid, false);
    assert.deepStrictEqual(binder.snapshot.validationErrors, ['Value is required']);

    // Update data: should become valid
    surface.dataModel.set('/val', 'hello');
    await new Promise(resolve => setTimeout(resolve, 0));

    assert.strictEqual(binder.snapshot.isValid, true);
    assert.deepStrictEqual(binder.snapshot.validationErrors, []);
  });

  it('should aggregate multiple validation rules correctly', async () => {
    const {surface, schema} = setupSurfaceAndMocks();
    surface.dataModel.set('/val', '');

    const compModel = new ComponentModel('c2', 'Test', {
      value: {path: '/val'},
      checks: [
        {
          condition: {
            call: 'required',
            args: {value: {path: '/val'}},
          },
          message: 'Cannot be empty',
        },
        {
          condition: {
            call: 'min_length',
            args: {value: {path: '/val'}, min: 3},
          },
          message: 'Must be at least 3 characters',
        },
      ],
    });
    surface.componentsModel.addComponent(compModel);

    const context = new ComponentContext(surface, 'c2');
    const binder = new GenericBinder<any>(context, schema);
    binder.subscribe(() => {});

    // Both rules fail initially
    assert.strictEqual(binder.snapshot.isValid, false);
    assert.deepStrictEqual(binder.snapshot.validationErrors, [
      'Cannot be empty',
      'Must be at least 3 characters',
    ]);

    // Update data to satisfy first rule but fail second
    surface.dataModel.set('/val', 'hi');
    await new Promise(resolve => setTimeout(resolve, 0));

    assert.strictEqual(binder.snapshot.isValid, false);
    assert.deepStrictEqual(binder.snapshot.validationErrors, ['Must be at least 3 characters']);

    // Update data to satisfy all rules
    surface.dataModel.set('/val', 'hello');
    await new Promise(resolve => setTimeout(resolve, 0));

    assert.strictEqual(binder.snapshot.isValid, true);
    assert.deepStrictEqual(binder.snapshot.validationErrors, []);
  });

  it('should provide a default message if rule.message is missing', async () => {
    const {surface, schema} = setupSurfaceAndMocks();
    surface.dataModel.set('/val', '');

    const compModel = new ComponentModel('c3', 'Test', {
      value: {path: '/val'},
      checks: [
        {
          condition: {
            call: 'required',
            args: {value: {path: '/val'}},
          },
        },
      ] as any,
    });
    surface.componentsModel.addComponent(compModel);

    const context = new ComponentContext(surface, 'c3');
    const binder = new GenericBinder<any>(context, schema);

    assert.strictEqual(binder.snapshot.isValid, false);
    assert.deepStrictEqual(binder.snapshot.validationErrors, ['Validation failed']);
  });

  it('should default to valid if checks array is empty or undefined', async () => {
    const {surface, schema} = setupSurfaceAndMocks();

    const compModel = new ComponentModel('c4', 'Test', {
      value: 'static',
      checks: [], // Empty checks
    });
    surface.componentsModel.addComponent(compModel);

    const context = new ComponentContext(surface, 'c4');
    const binder = new GenericBinder<any>(context, schema);

    assert.strictEqual(binder.snapshot.isValid, true);
    assert.deepStrictEqual(binder.snapshot.validationErrors, []);
  });
});

describe('GenericBinder Action Trait (functionCall)', () => {
  const mockCatalog = new Catalog('test', [], []);

  function setupActionSurface() {
    const surface = new SurfaceModel('s-action', mockCatalog);

    const schema = z.object({
      action: CommonSchemas.Action,
    });

    return {surface, schema};
  }

  it('preserves functionCall payloads and invokes the bound action', async () => {
    const {surface, schema} = setupActionSurface();

    // Register a local redirect function the button can call.
    const opened: string[] = [];
    (surface.catalog as any).functions = new Map([
      [
        'redirect',
        {
          execute: (args: any) => opened.push(args.url),
          schema: z.object({url: z.any()}),
        },
      ],
    ]);
    (surface.catalog as any).invoker = (name: string, args: any) => {
      const fn = (surface.catalog as any).functions.get(name);
      if (!fn) throw new Error(`Function not found: ${name}`);
      return fn.execute(args);
    };

    const compModel = new ComponentModel('btn1', 'Button', {
      action: {
        functionCall: {
          call: 'redirect',
          args: {url: 'https://example.com', rn: {launchParams: {appId: 'A1'}}},
        },
      },
    });
    surface.componentsModel.addComponent(compModel);

    const context = new ComponentContext(surface, 'btn1');
    const binder = new GenericBinder<any>(context, schema);
    binder.subscribe(() => {});

    // The action should be bound to a callable closure.
    const action = binder.snapshot.action;
    assert.strictEqual(typeof action, 'function');

    // Invoking the closure must locally execute the registered function with
    // the functionCall args preserved (not swallowed as a dynamic expression).
    action();
    await new Promise(resolve => setTimeout(resolve, 0));

    assert.deepStrictEqual(opened, ['https://example.com']);
  });

  it('still resolves dynamic values inside functionCall args', async () => {
    const {surface, schema} = setupActionSurface();
    surface.dataModel.set('/url', 'https://example.com/from-data');

    const opened: string[] = [];
    (surface.catalog as any).functions = new Map([
      ['openUrl', {execute: (args: any) => opened.push(args.target), schema: z.object({target: z.any()})}],
    ]);
    (surface.catalog as any).invoker = (name: string, args: any) => {
      const fn = (surface.catalog as any).functions.get(name);
      if (!fn) throw new Error(`Function not found: ${name}`);
      return fn.execute(args);
    };

    const compModel = new ComponentModel('btn2', 'Button', {
      action: {
        functionCall: {
          call: 'openUrl',
          args: {target: {path: '/url'}},
        },
      },
    });
    surface.componentsModel.addComponent(compModel);

    const context = new ComponentContext(surface, 'btn2');
    const binder = new GenericBinder<any>(context, schema);
    binder.subscribe(() => {});

    const action = binder.snapshot.action;
    action();
    await new Promise(resolve => setTimeout(resolve, 0));

    assert.deepStrictEqual(opened, ['https://example.com/from-data']);
  });
});
