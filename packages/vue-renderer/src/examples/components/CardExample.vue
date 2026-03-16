

<script setup lang="ts">
import { A2UiRenderer } from '../../index';
import type * as Types from '@a2ui/web_core/types/types';

const cardExamples: Array<{ description: string; component: Types.AnyComponentNode }> = [
  {
    description: 'Simple Card',
    component: {
      type: 'Card',
      id: 'card-simple',
      properties: {
        children: [{
          type: 'Text',
          id: 'card-text-1',
          properties: { text: { literalString: 'This is a simple card with text content' }, usageHint: 'body' }
        }]
      }
    },
  },
  {
    description: 'Card with Multiple Children',
    component: {
      type: 'Card',
      id: 'card-multi',
      properties: {
        children: [
          {
            type: 'Text',
            id: 'card-heading',
            properties: { text: { literalString: 'Card Title' }, usageHint: 'h3' }
          },
          {
            type: 'Text',
            id: 'card-body',
            properties: { text: { literalString: 'This card contains multiple child components arranged vertically.' }, usageHint: 'body' }
          },
          {
            type: 'Text',
            id: 'card-caption',
            properties: { text: { literalString: 'Additional information' }, usageHint: 'caption' }
          }
        ]
      }
    },
  },
];
</script>

<template>
  <div class="example-section">
    <h2>Card Component</h2>
    <p class="example-description">
      Cards are container components that group related content together with consistent styling.
    </p>

    <div v-for="(example, index) in cardExamples" :key="index" class="example-demo">
      <h3>{{ example.description }}</h3>
      <A2UiRenderer
        surface-id="example"
        :component="example.component"
      />
    </div>
  </div>
</template>
