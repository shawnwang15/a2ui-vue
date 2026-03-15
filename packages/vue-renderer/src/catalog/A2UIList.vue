<!--
 Copyright 2025 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 -->

<script setup lang="ts">
import * as Types from '@a2ui/web_core/types/types';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import A2UiRenderer from '@/rendering/A2UIRenderer.vue';

const props = defineProps<{
  surfaceId: Types.SurfaceID | null;
  component: Types.ListNode;
  weight: string | number;
  direction?: 'vertical' | 'horizontal';
}>();

const { theme } = useDynamicComponent(props);
</script>

<template>
  <a2ui-list
    :data-direction="direction ?? 'vertical'"
  >
    <section :class="theme.components.List" :style="theme.additionalStyles?.List">
      <div class="a2ui-list-item" v-for="(child, index) in component.properties.children">
        <A2UiRenderer
            :key="child.id || index"
            :surface-id="surfaceId!"
            :component="child"
        />
      </div>
    </section>
  </a2ui-list>
</template>

<style scoped>
a2ui-list {
  display: block;
  flex: v-bind(props.weight);
  min-height: 0;
}

a2ui-list[data-direction='vertical'] section {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow-y: auto;
}

a2ui-list[data-direction='horizontal'] section {
  display: flex;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}

.a2ui-list-item {
  display: flex;
  cursor: pointer;
  box-sizing: border-box;
}
</style>
