

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { A2UISurface, useMessageProcessor } from 'a2ui-vue';
import type { A2uiMessage } from '@a2ui/web_core/v0_9';
import { createSingleComponentSurface, createComponent, getJson } from '@/utils/surface';

interface Block {
  name: string;
  tag: string;
  surfaceId: string;
  messages: A2uiMessage[];
}

const processor = useMessageProcessor();
const dialog = ref<HTMLDialogElement | null>(null);
const selectedBlock = ref<Block | null>(null);

function surface(name: string, type: string, props: Record<string, unknown>): Block {
  const surfaceId = 'lib-' + name;
  return {
    name,
    tag: '',
    surfaceId,
    messages: createSingleComponentSurface(surfaceId, type, props),
  };
}

const blocks = computed<Block[]>(() => [
  // Layout Components
  { ...surface('Card', 'Card', {
      child: createComponent('Text', { text: 'Content inside a card' }),
    }), tag: 'Layout' },
  { ...surface('Column', 'Column', {
      children: [
        createComponent('Text', { text: 'Item 1' }),
        createComponent('Text', { text: 'Item 2' }),
        createComponent('Text', { text: 'Item 3' }),
      ],
      align: 'center',
      justify: 'space-around',
    }), tag: 'Layout' },
  { ...surface('Divider', 'Column', {
      children: [
        createComponent('Text', { text: 'Above Divider' }),
        createComponent('Divider', {}),
        createComponent('Text', { text: 'Below Divider' }),
      ],
    }), tag: 'Layout' },
  { ...surface('List', 'List', {
      children: [
        createComponent('Text', { text: 'List Item 1' }),
        createComponent('Text', { text: 'List Item 2' }),
        createComponent('Text', { text: 'List Item 3' }),
      ],
      direction: 'vertical',
    }), tag: 'Layout' },
  { ...surface('Modal', 'Modal', {
      trigger: createComponent('Button', {
        action: { type: 'none' },
        child: createComponent('Text', { text: 'Open Modal' }),
      }),
      content: createComponent('Card', {
        child: createComponent('Text', { text: 'This is the modal content.' }),
      }),
    }), tag: 'Layout' },
  { ...surface('Row', 'Row', {
      children: [
        createComponent('Text', { text: 'Left' }),
        createComponent('Text', { text: 'Center' }),
        createComponent('Text', { text: 'Right' }),
      ],
      align: 'center',
      justify: 'space-between',
    }), tag: 'Layout' },
  { ...surface('Tabs', 'Tabs', {
      tabs: [
        { title: 'Tab 1', child: createComponent('Text', { text: 'Content for Tab 1' }) },
        { title: 'Tab 2', child: createComponent('Text', { text: 'Content for Tab 2' }) },
      ],
    }), tag: 'Layout' },
  { ...surface('Text', 'Column', {
      children: [
        createComponent('Heading', { text: 'Heading Text' }),
        createComponent('Text', { text: 'Standard body text.' }),
        createComponent('Text', { text: 'Caption text', variant: 'caption' }),
      ],
    }), tag: 'Layout' },

  // Media Components
  { ...surface('AudioPlayer', 'AudioPlayer', {
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    }), tag: 'Media' },
  { ...surface('Icon', 'Row', {
      children: [
        createComponent('Icon', { name: 'home' }),
        createComponent('Icon', { name: 'favorite' }),
        createComponent('Icon', { name: 'settings' }),
      ],
      justify: 'space-around',
    }), tag: 'Media' },
  { ...surface('Image', 'Image', {
      url: 'https://picsum.photos/id/10/300/200',
    }), tag: 'Media' },
  { ...surface('Video', 'Video', {
      url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    }), tag: 'Media' },

  // Input Components
  { ...surface('Button', 'Row', {
      children: [
        createComponent('Button', {
          label: 'Primary',
          action: { type: 'click' },
          child: createComponent('Text', { text: 'Primary' }),
        }),
        createComponent('Button', {
          label: 'Secondary',
          action: { type: 'click' },
          child: createComponent('Text', { text: 'Secondary' }),
        }),
      ],
      justify: 'space-around',
    }), tag: 'Inputs' },
  { ...surface('CheckBox', 'Column', {
      children: [
        createComponent('CheckBox', { label: 'Unchecked', value: false }),
        createComponent('CheckBox', { label: 'Checked', value: true }),
      ],
    }), tag: 'Inputs' },
  { ...surface('DateTimeInput', 'Column', {
      children: [
        createComponent('DateTimeInput', {
          enableDate: true, enableTime: false, value: '2025-12-09',
        }),
        createComponent('DateTimeInput', {
          enableDate: true, enableTime: true, value: '2025-12-09T12:00:00',
        }),
      ],
    }), tag: 'Inputs' },
  { ...surface('ChoicePicker', 'ChoicePicker', {
      options: [
        { value: 'opt1', label: 'Option 1' },
        { value: 'opt2', label: 'Option 2' },
        { value: 'opt3', label: 'Option 3' },
      ],
      selections: 'opt1',
    }), tag: 'Inputs' },
  { ...surface('Slider', 'Slider', { value: 50, min: 0, max: 100 }), tag: 'Inputs' },
  { ...surface('TextField', 'Column', {
      children: [
        createComponent('TextField', { label: 'Standard Input', value: 'Some text' }),
        createComponent('TextField', { label: 'Password', type: 'password', value: '' }),
      ],
    }), tag: 'Inputs' },
]);

onMounted(() => {
  for (const block of blocks.value) {
    processor.processMessages(block.messages);
  }
});

function openDialog(block: Block) {
  selectedBlock.value = block;
  dialog.value?.showModal();
}

function closeDialog() {
  dialog.value?.close();
}
</script>

<template>
  <section class="block-gallery">
    <article
      v-for="block in blocks"
      :key="block.name"
      class="block-card"
      @click="openDialog(block)"
    >
      <section class="block-header">
        <p class="block-title">{{ block.name }}</p>
      </section>
      <A2UISurface :surface-id="block.surfaceId" />
    </article>
  </section>

  <dialog ref="dialog">
    <article v-if="selectedBlock">
      <section class="block-header">
        <p class="block-title">{{ selectedBlock.name }}</p>
        <button @click="closeDialog">Close</button>
      </section>
      <div class="dialog-content-grid">
        <section class="block-surface">
          <A2UISurface :surface-id="selectedBlock.surfaceId" />
        </section>
        <section class="json-pane">
          <pre>{{ getJson(selectedBlock.messages) }}</pre>
        </section>
      </div>
    </article>
    <article v-else>
      <h3>Please select a component from the gallery</h3>
    </article>
  </dialog>
</template>

<style scoped>
dialog {
  min-width: 800px;
  min-height: 600px;
  padding: 1rem;
  border-radius: 8px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out;
  display: flex;
  flex-direction: column;
}

dialog[open] {
  opacity: 1;
  transform: translateY(0) scale(1);
  animation: slide-in 0.2s ease-out forwards;
}

dialog::backdrop {
  opacity: 0;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.2s ease-out;
}

dialog[open]::backdrop {
  opacity: 1;
  animation: fade-in 0.2s ease-out forwards;
}

dialog article {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.block-card {
  border: solid 1px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  break-inside: avoid;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  background: white;
  cursor: pointer;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.block-title {
  font-weight: bold;
  font-size: 1.3rem;
  margin-top: 2px;
}

.block-gallery {
  margin: 0 2rem 0 2rem;
  column-width: 320px;
  column-gap: 1rem;
}

dialog .dialog-content-grid {
  flex-grow: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  height: 100%;
  align-items: stretch;
}

dialog .dialog-content-grid > .block-surface {
  margin-right: 10px;
  height: 100%;
}

.json-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.json-pane pre {
  background-color: #272822;
  color: #f8f8f2;
  padding: 1em;
  border-radius: 4px;
  flex-grow: 1;
  overflow: auto;
  height: 100%;
  white-space: pre-wrap;
  word-break: break-word;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
