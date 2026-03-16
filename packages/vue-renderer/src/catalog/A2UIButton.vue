

<script setup lang="ts">
import * as Types from '@a2ui/web_core/types/types';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import A2UIRenderer from '@/rendering/A2UIRenderer.vue';

const props = defineProps<{
  surfaceId: Types.SurfaceID | null;
  component: Types.ButtonNode;
  weight: string | number;
  action: Types.Action | null;
}>();

const { theme, sendAction } = useDynamicComponent(props);

function handleClick() {
  if (props.action) {
    sendAction(props.action);
  }
}
</script>

<template>
  <a2ui-button>
    <button
      :class="theme.components.Button"
      :style="theme.additionalStyles?.Button"
      @click="handleClick"
    >
      <A2UIRenderer
        :surface-id="surfaceId!"
        :component="component.properties.child"
      />
    </button>
  </a2ui-button>
</template>

<style scoped>
a2ui-button {
  display: block;
  flex: v-bind(weight);
  min-height: 0;
}
</style>
