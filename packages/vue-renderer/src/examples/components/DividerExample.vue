

<script setup lang="ts">
import { A2UiRenderer } from '../../index';
import type * as Types from '@a2ui/web_core/types/types';

const dividerExamples: Array<{ description: string; component: Types.AnyComponentNode }> = [
  {
    description: 'Horizontal Divider',
    component: {
      type: 'Divider',
      id: 'divider-1',
      properties: {}
    },
  },
];
</script>

<template>
  <div class="example-section">
    <h2>Divider Component</h2>
    <p class="example-description">
      Visual separator to divide content sections.
    </p>

    <div v-for="(example, index) in dividerExamples" :key="index" class="example-demo">
      <h3>{{ example.description }}</h3>
      <div style="padding: 20px 0;">
        <p>Content above divider</p>
        <A2UiRenderer
          surface-id="example"
          :component="example.component"
        />
        <p>Content below divider</p>
      </div>
    </div>
  </div>
</template>
