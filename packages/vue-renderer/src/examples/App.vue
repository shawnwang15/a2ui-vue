

<script setup lang="ts">
import { ref } from 'vue';
import ButtonExample from './components/ButtonExample.vue';
import TextExample from './components/TextExample.vue';
import CardExample from './components/CardExample.vue';
import DividerExample from './components/DividerExample.vue';
import RowExample from './components/RowExample.vue';
import ColumnExample from './components/ColumnExample.vue';
import ListExample from './components/ListExample.vue';
import ContactCardExample from './components/ContactCardExample.vue';
import ComponentGalleryExample from './components/ComponentGalleryExample.vue';
import ThemeExample from './components/ThemeExample.vue';
import SurfaceThemeExample from './components/SurfaceThemeExample.vue';

const currentExample = ref('all');

const examples = [
  { name: 'all', label: 'All Examples', component: null },
  { name: 'text', label: 'Text', component: TextExample },
  { name: 'button', label: 'Button', component: ButtonExample },
  { name: 'card', label: 'Card', component: CardExample },
  { name: 'row', label: 'Row', component: RowExample },
  { name: 'column', label: 'Column', component: ColumnExample },
  { name: 'list', label: 'List', component: ListExample },
  { name: 'divider', label: 'Divider', component: DividerExample },
  { name: 'contact-card', label: 'Contact Card', component: ContactCardExample },
  { name: 'component-gallery', label: 'Component Gallery', component: ComponentGalleryExample },
  { name: 'theme', label: 'Custom Theme', component: ThemeExample },
  { name: 'surface-theme', label: 'Surface Theme', component: SurfaceThemeExample },
];

function setExample(name: string) {
  currentExample.value = name;
}
</script>

<template>
  <div class="examples-container">
    <div class="examples-header">
      <h1>A2UI Vue Components Examples</h1>
      <p>Interactive examples for all A2UI Vue components</p>
    </div>

    <nav class="examples-nav">
      <button
        v-for="example in examples"
        :key="example.name"
        :class="{ active: currentExample === example.name }"
        @click="setExample(example.name)"
      >
        {{ example.label }}
      </button>
    </nav>

    <div class="examples-content">
      <template v-if="currentExample === 'all'">
        <TextExample />
        <ButtonExample />
        <CardExample />
        <RowExample />
        <ColumnExample />
        <ListExample />
        <DividerExample />
        <ContactCardExample />
        <ComponentGalleryExample />
        <ThemeExample />
        <SurfaceThemeExample />
      </template>
      <component v-else :is="examples.find(e => e.name === currentExample)?.component" />
    </div>
  </div>
</template>

<style scoped>
.examples-container {
  min-height: 100vh;
}
</style>
