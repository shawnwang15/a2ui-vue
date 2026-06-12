

<script setup lang="ts">
import { computed } from 'vue';
import DOMPurify from 'dompurify';
import * as Styles from '@a2ui/web_core/styles/index';
import { useDynamicComponent } from '@/rendering/useDynamicComponent';
import type { VueComponentNode } from '@/rendering/catalog';
import { useMarkdownRenderer } from '../data/markdown';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'body' | 'caption';

interface HintedStyles {
  h1: Record<string, string>;
  h2: Record<string, string>;
  h3: Record<string, string>;
  h4: Record<string, string>;
  h5: Record<string, string>;
  body: Record<string, string>;
  caption: Record<string, string>;
}

const props = defineProps<{
  surfaceId: string | null;
  component: VueComponentNode;
  weight: string | number;
  text: unknown;
  variant: TextVariant | null;
}>();

const { theme, bound } = useDynamicComponent(props);
const markdownRenderer = useMarkdownRenderer();

const resolvedText = computed(() => {
  const variant = (bound.value.variant ?? props.variant) as TextVariant | null;
  let value: unknown = bound.value.text ?? null;

  if (value == null) {
    value = '';
  }

  switch (variant) {
    case 'h1':
      value = `# ${value}`;
      break;
    case 'h2':
      value = `## ${value}`;
      break;
    case 'h3':
      value = `### ${value}`;
      break;
    case 'h4':
      value = `#### ${value}`;
      break;
    case 'h5':
      value = `##### ${value}`;
      break;
    case 'caption':
      value = `*${value}*`;
      break;
    default:
      value = String(value);
      break;
  }

  return DOMPurify.sanitize(markdownRenderer.render(
      String(value),
      Styles.appendToAll(theme.markdown ?? {}, ['ol', 'ul', 'li'], {}),
  ));
});

const classes = computed(() => {
  const variant = (bound.value.variant ?? props.variant) as TextVariant | null;

  return Styles.merge(
    theme.components.Text.all,
    variant ? (theme.components.Text as Record<string, any>)[variant] : {},
  );
});

const additionalStyles = computed(() => {
  const variant = (bound.value.variant ?? props.variant) as TextVariant | null;
  const styles = theme.additionalStyles?.Text;

  if (!styles) {
    return null;
  }

  let additionalStyles: Record<string, string> = {};

  if (areHintedStyles(styles)) {
    additionalStyles = styles[variant ?? 'body'];
  } else {
    additionalStyles = styles as Record<string, string>;
  }

  return additionalStyles;
});

function areHintedStyles(styles: unknown): styles is HintedStyles {
  if (typeof styles !== 'object' || !styles || Array.isArray(styles)) {
    return false;
  }

  const expected = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'caption', 'body'];
  return expected.every((v) => v in styles);
}
</script>

<template>
  <a2ui-text>
    <section
      :class="classes"
      :style="additionalStyles"
      v-html="resolvedText"
    >
    </section>
  </a2ui-text>
</template>

<style>
a2ui-text{
  display: block;
  flex: v-bind(props.weight);
}
a2ui-text h1,
a2ui-text h2,
a2ui-text h3,
a2ui-text h4,
a2ui-text h5 {
  line-height: inherit;
  font: inherit;
}
</style>
