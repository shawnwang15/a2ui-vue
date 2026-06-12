

<script setup lang="ts">
import { computed } from 'vue';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import type { VueComponentNode } from '@/rendering/catalog';
import A2UIRenderer from '@/rendering/A2UIRenderer.vue';

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
  action: unknown;
  variant?: string;
}>();

const { theme, bound } = useDynamicComponent(props);

// `child` is a ComponentId (STATIC) in the schema, so the binder returns it as
// a raw id rather than a renderable node. Use the pre-expanded child node that
// the processor attached to the component properties.
const child = computed<VueComponentNode | null>(
  () => ((props.component.properties as any).child as VueComponentNode) ?? null,
);

const isInvalid = computed(() => bound.value.isValid === false);
const validationErrors = computed<string[]>(() => bound.value.validationErrors ?? []);

function handleClick() {
  if (isInvalid.value) return;
  const action = bound.value.action;
  if (typeof action === 'function') {
    action();
  }
}
</script>

<template>
  <a2ui-button>
    <button
      :class="theme.components.Button"
      :style="theme.additionalStyles?.Button"
      :disabled="isInvalid"
      @click="handleClick"
    >
      <A2UIRenderer
        v-if="child"
        :surface-id="surfaceId!"
        :component="child"
      />
    </button>
    <p v-if="validationErrors.length" class="a2ui-button-errors">
      {{ validationErrors.join(', ') }}
    </p>
  </a2ui-button>
</template>

<style scoped>
a2ui-button {
  display: block;
  flex: v-bind(weight);
  min-height: 0;
}

.a2ui-button-errors {
  margin: 4px 0 0;
  color: #b3261e;
  font-size: 0.75rem;
}
</style>
