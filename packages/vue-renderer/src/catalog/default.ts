


/**
 * v0.9 Default Component Catalog
 *
 * Maps the v0.9 catalog component-type names to their Vue implementations.
 * The `props(node)` function extracts the rendered-side props from a
 * `VueComponentNode`'s `properties` bag (already child-expanded by the
 * processor in `MessageProcessor.buildVueNode`).
 *
 * Notable v0.9 names (vs v0.8):
 * - Row/Column: `distribution` → `justify`, `alignment` → `align`
 * - Text/Image: `usageHint` → `variant`
 * - MultipleChoice → `ChoicePicker`
 * - TextField: `textFieldType` → `variant`, `text` → `value`
 * - Slider: `minValue/maxValue` → `min/max`
 * - Tabs: `tabItems` → `tabs`
 * - Modal: `entryPointChild`/`contentChild` → `trigger`/`content`
 * - Button: `primary` flag → `variant`
 */

import type { Catalog } from '@/rendering/catalog';

import Row from './A2UIRow.vue';
import Column from './A2UIColumn.vue';
import Text from './A2UIText.vue';

export const DEFAULT_CATALOG: Catalog = {
  Row: {
    type: () => Row,
    props: (node) => ({
      align: (node.properties as any).align ?? 'stretch',
      justify: (node.properties as any).justify ?? 'start',
    }),
  },

  Column: {
    type: () => Column,
    props: (node) => ({
      align: (node.properties as any).align ?? 'stretch',
      justify: (node.properties as any).justify ?? 'start',
    }),
  },

  List: {
    type: () => import('./A2UIList.vue').then((m) => m.default),
    props: (node) => ({
      direction: (node.properties as any).direction ?? 'vertical',
      align: (node.properties as any).align ?? 'stretch',
      listStyle: (node.properties as any).listStyle,
    }),
  },

  Card: () => import('./A2UICard.vue').then((m) => m.default),

  Image: {
    type: () => import('./A2UIImage.vue').then((m) => m.default),
    props: (node) => ({
      url: (node.properties as any).url,
      altText: (node.properties as any).altText,
      variant: (node.properties as any).variant,
    }),
  },

  Icon: {
    type: () => import('./A2UIIcon.vue').then((m) => m.default),
    props: (node) => ({ name: (node.properties as any).name }),
  },

  Video: {
    type: () => import('./A2UIVideo.vue').then((m) => m.default),
    props: (node) => ({ url: (node.properties as any).url }),
  },

  AudioPlayer: {
    type: () => import('./A2UIAudio.vue').then((m) => m.default),
    props: (node) => ({ url: (node.properties as any).url }),
  },

  Text: {
    type: () => Text,
    props: (node) => ({
      text: (node.properties as any).text,
      variant: (node.properties as any).variant ?? null,
    }),
  },

  Button: {
    type: () => import('./A2UIButton.vue').then((m) => m.default),
    props: (node) => ({
      action: (node.properties as any).action,
      variant: (node.properties as any).variant,
    }),
  },

  Divider: () => import('./A2UIDivider.vue').then((m) => m.default),

  ChoicePicker: {
    type: () => import('./A2UIChoicePicker.vue').then((m) => m.default),
    props: (node) => ({
      options: (node.properties as any).options ?? [],
      value: (node.properties as any).value,
      label: (node.properties as any).label,
      variant: (node.properties as any).variant,
      displayStyle: (node.properties as any).displayStyle,
      filterable: (node.properties as any).filterable,
    }),
  },

  TextField: {
    type: () => import('./A2UITextField.vue').then((m) => m.default),
    props: (node) => ({
      value: (node.properties as any).value ?? null,
      label: (node.properties as any).label,
      variant: (node.properties as any).variant,
      validationRegexp: (node.properties as any).validationRegexp,
    }),
  },

  DateTimeInput: {
    type: () => import('./A2UIDateTimeInput.vue').then((m) => m.default),
    props: (node) => ({
      enableDate: (node.properties as any).enableDate,
      enableTime: (node.properties as any).enableTime,
      value: (node.properties as any).value,
      label: (node.properties as any).label,
      min: (node.properties as any).min,
      max: (node.properties as any).max,
    }),
  },

  CheckBox: {
    type: () => import('./A2UICheckbox.vue').then((m) => m.default),
    props: (node) => ({
      label: (node.properties as any).label,
      value: (node.properties as any).value,
    }),
  },

  Slider: {
    type: () => import('./A2UISlider.vue').then((m) => m.default),
    props: (node) => ({
      value: (node.properties as any).value,
      min: (node.properties as any).min,
      max: (node.properties as any).max,
      step: (node.properties as any).step,
      label: (node.properties as any).label,
    }),
  },

  Tabs: {
    type: () => import('./A2UITabs.vue').then((m) => m.default),
    props: (node) => ({ tabs: (node.properties as any).tabs ?? [] }),
  },

  Modal: {
    type: () => import('./A2UIModal.vue').then((m) => m.default),
    props: () => ({}),
  },
};
