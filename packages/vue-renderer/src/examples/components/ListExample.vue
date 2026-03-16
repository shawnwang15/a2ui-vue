

<script setup lang="ts">
import { A2UiRenderer } from '../../index';
import type * as Types from '@a2ui/web_core/types/types';

const listExamples: Array<{ description: string; component: Types.AnyComponentNode }> = [
  {
    description: 'Simple List',
    component: {
      type: 'List',
      id: 'list-1',
      properties: {
        children: [
          { type: 'Text', id: 'li-1', properties: { text: { literal: 'First item' }, usageHint: 'body' } },
          { type: 'Text', id: 'li-2', properties: { text: { literal: 'Second item' }, usageHint: 'body' } },
          { type: 'Text', id: 'li-3', properties: { text: { literal: 'Third item' }, usageHint: 'body' } },
          { type: 'Text', id: 'li-4', properties: { text: { literal: 'Fourth item' }, usageHint: 'body' } }
        ]
      }
    },
  },
  {
    description: 'List with Cards',
    component: {
      type: 'List',
      id: 'list-2',
      properties: {
        children: [
          {
            type: 'Card',
            id: 'list-card-1',
            properties: {
              child: { type: 'Text', id: 'lc-t1', properties: { text: { literal: 'Card Item 1' }, usageHint: 'body' } },
              children: []
            }
          },
          {
            type: 'Card',
            id: 'list-card-2',
            properties: {
              child: { type: 'Text', id: 'lc-t2', properties: { text: { literal: 'Card Item 2' }, usageHint: 'body' } },
              children: []
            }
          }
        ]
      }
    },
  },
];
</script>

<template>
  <div class="example-section">
    <h2>List Component</h2>
    <p class="example-description">
      Lists display a collection of items in a vertical list format.
    </p>

    <div v-for="(example, index) in listExamples" :key="index" class="example-demo">
      <h3>{{ example.description }}</h3>
      <A2UiRenderer
        surface-id="example"
        :component="example.component"
      />
    </div>
  </div>
</template>
