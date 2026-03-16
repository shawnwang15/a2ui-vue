

<script setup lang="ts">
import { ref } from 'vue';
import { A2UiRenderer } from '../../index';
import type * as Types from '@a2ui/web_core/types/types';

const clickCount = ref(0);

const buttonExamples: Array<{ description: string; component: Types.AnyComponentNode }> = [
  {
    description: 'Primary Button',
    component: {
      type: 'Button',
      id: 'btn-primary',
      properties: {
        action: { type: 'submit', name: 'primary-action' },
        child: {
          type: 'Text',
          id: 'btn-text-1',
          properties: { text: { literal: 'Click Me' }, usageHint: 'body' }
        }
      }
    },
  },
  {
    description: 'Secondary Button',
    component: {
      type: 'Button',
      id: 'btn-secondary',
      properties: {
        action: { type: 'submit', name: 'secondary-action' },
        child: {
          type: 'Text',
          id: 'btn-text-2',
          properties: { text: { literal: 'Secondary Action' }, usageHint: 'body' }
        }
      }
    },
  },
  {
    description: 'Button with Icon',
    component: {
      type: 'Button',
      id: 'btn-icon',
      properties: {
        action: { type: 'submit', name: 'confirm-action' },
        child: {
          type: 'Text',
          id: 'btn-text-3',
          properties: { text: { literal: '✓ Confirm' }, usageHint: 'body' }
        }
      }
    },
  },
];
</script>

<template>
  <div class="example-section">
    <h2>Button Component</h2>
    <p class="example-description">
      Interactive buttons that trigger actions when clicked. Click count: {{ clickCount }}
    </p>

    <div v-for="(example, index) in buttonExamples" :key="index" class="example-demo">
      <h3>{{ example.description }}</h3>
      <A2UiRenderer
        surface-id="example"
        :component="example.component"
        @click="clickCount++"
      />
    </div>
  </div>
</template>
