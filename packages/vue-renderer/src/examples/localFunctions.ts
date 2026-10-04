import { ref } from 'vue';
import { z } from 'zod';
import { createFunctionImplementation, type FunctionImplementation } from '../index';

/** Last renderer-local functionCall, for example pages (these do not go through onEvent). */
export const lastLocalCall = ref<string | null>(null);

const callFn = createFunctionImplementation(
  {
    name: 'call',
    returnType: 'void',
    schema: z.object({ number: z.string() }),
  },
  (args) => {
    lastLocalCall.value = `call(${JSON.stringify({ number: args.number })})`;
    if (typeof window !== 'undefined') {
      window.open(`tel:${args.number}`);
    }
  },
);

const openModalFn = createFunctionImplementation(
  {
    name: 'open_modal',
    returnType: 'void',
    schema: z.object({}),
  },
  () => {
    lastLocalCall.value = 'open_modal({})';
  },
);

export const EXAMPLE_FUNCTIONS: FunctionImplementation[] = [callFn, openModalFn];
