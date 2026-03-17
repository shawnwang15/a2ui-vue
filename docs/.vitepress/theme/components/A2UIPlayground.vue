<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import type * as Types from '@a2ui/web_core/types/types'
import {
  A2UiRenderer,
  DEFAULT_CATALOG,
  provideA2UI,
} from 'a2ui-vue'
import { theme } from './theme.ts'

type RenderableNode = {
  type: string
  id: string
  properties: Record<string, unknown>
  weight?: string | number
}

type PreviewTone = 'support' | 'contact' | 'restaurant' | 'order' | 'booking' | 'analytics' | 'settings'

type Preset = {
  key: string
  label: string
  description: string
  scenario: string
  tone: PreviewTone
  value: RenderableNode
}

provideA2UI({
  catalog: DEFAULT_CATALOG,
  theme,
})

function textNode(id: string, value: string, usageHint = 'body'): RenderableNode {
  return {
    type: 'Text',
    id,
    properties: {
      text: { literal: value },
      usageHint,
    },
  }
}

function cardNode(id: string, children: RenderableNode[], weight?: string | number): RenderableNode {
  return {
    type: 'Card',
    id,
    weight,
    properties: { children },
  }
}

function columnNode(
  id: string,
  children: RenderableNode[],
  alignment = 'stretch',
  distribution = 'start',
  weight?: string | number,
): RenderableNode {
  return {
    type: 'Column',
    id,
    weight,
    properties: {
      alignment,
      distribution,
      children,
    },
  }
}

function rowNode(
  id: string,
  children: RenderableNode[],
  alignment = 'stretch',
  distribution = 'start',
  weight?: string | number,
): RenderableNode {
  return {
    type: 'Row',
    id,
    weight,
    properties: {
      alignment,
      distribution,
      children,
    },
  }
}

function listNode(id: string, children: RenderableNode[], direction = 'vertical'): RenderableNode {
  return {
    type: 'List',
    id,
    properties: {
      direction,
      children,
    },
  }
}

function dividerNode(id: string): RenderableNode {
  return {
    type: 'Divider',
    id,
    properties: {},
  }
}

function buttonNode(id: string, label: string): RenderableNode {
  return {
    type: 'Button',
    id,
    properties: {
      child: textNode(`${id}-label`, label),
    },
  }
}

function textFieldNode(id: string, label: string, value: string, textFieldType: 'text' | 'number' = 'text'): RenderableNode {
  return {
    type: 'TextField',
    id,
    properties: {
      label: { literal: label },
      text: { literal: value },
      textFieldType,
    },
  }
}

function checkboxNode(id: string, label: string, checked: boolean): RenderableNode {
  return {
    type: 'CheckBox',
    id,
    properties: {
      label: { literal: label },
      value: { literalBoolean: checked },
    },
  }
}

function sliderNode(id: string, value: number, minValue: number, maxValue: number): RenderableNode {
  return {
    type: 'Slider',
    id,
    properties: {
      value: { literalNumber: value },
      minValue,
      maxValue,
    },
  }
}

function multipleChoiceNode(
  id: string,
  options: Array<{ label: string; value: string }>,
  selected: string,
): RenderableNode {
  return {
    type: 'MultipleChoice',
    id,
    properties: {
      options: options.map((option) => ({
        label: { literal: option.label },
        value: option.value,
      })),
      selections: { literal: selected },
    },
  }
}

function dateTimeNode(
  id: string,
  value: string,
  enableDate = true,
  enableTime = true,
): RenderableNode {
  return {
    type: 'DateTimeInput',
    id,
    properties: {
      value: { literal: value },
      enableDate,
      enableTime,
    },
  }
}

function tabsNode(
  id: string,
  items: Array<{ title: string; child: RenderableNode }>,
): RenderableNode {
  return {
    type: 'Tabs',
    id,
    properties: {
      tabItems: items.map((item, index) => ({
        id: `${id}-tab-${index}`,
        title: { literal: item.title },
        child: item.child,
      })),
    },
  }
}

function metricCardNode(id: string, label: string, value: string, note: string): RenderableNode {
  return cardNode(id, [
    textNode(`${id}-label`, label, 'caption'),
    dividerNode(`${id}-divider`),
    textNode(`${id}-value`, value, 'h3'),
    textNode(`${id}-note`, note, 'caption'),
  ])
}

function detailCardNode(id: string, title: string, lines: string[], note?: string): RenderableNode {
  return cardNode(id, [
    textNode(`${id}-title`, title, 'h4'),
    dividerNode(`${id}-divider`),
    ...lines.map((line, index) => textNode(`${id}-line-${index + 1}`, line, 'body')),
    ...(note ? [dividerNode(`${id}-note-divider`), textNode(`${id}-note`, note, 'caption')] : []),
  ])
}

function checklistCardNode(id: string, title: string, items: string[], note?: string): RenderableNode {
  return cardNode(id, [
    textNode(`${id}-title`, title, 'h4'),
    dividerNode(`${id}-divider`),
    listNode(
      `${id}-list`,
      items.map((item, index) => textNode(`${id}-item-${index + 1}`, item, 'body')),
    ),
    ...(note ? [dividerNode(`${id}-note-divider`), textNode(`${id}-note`, note, 'caption')] : []),
  ])
}

const presets: Preset[] = [

  {
    key: 'restaurant-recommendation',
    label: '餐厅推荐列表',
    scenario: '餐厅推荐',
    tone: 'restaurant',
    description: '改成更完整的推荐工作台：既有推荐结果，也有预订偏好、行程信息和备选页签，右侧渲染层次更丰富。',
    value: columnNode('restaurant-root', [
      textNode('restaurant-title', '今晚适合 4 人商务聚餐的餐厅推荐', 'h2'),
      textNode('restaurant-copy', '已根据“浦东、预算 400 元内、适合商务沟通”的条件筛选，优先展示安静度、包间可用性和临时改签灵活性更高的候选。', 'body'),
      dividerNode('restaurant-header-divider'),
      rowNode('restaurant-filters', [
        metricCardNode('restaurant-filter-1', '区域', '浦东陆家嘴', '步行或短途打车可达'),
        metricCardNode('restaurant-filter-2', '预算', '人均 ¥120 - ¥180', '整体预算控制在 ¥400 内'),
        metricCardNode('restaurant-filter-3', '重点偏好', '安静 / 可预订 / 适合沟通', '优先考虑包间、停车和座位间距'),
      ]),
      dividerNode('restaurant-filters-divider'),
      rowNode('restaurant-feature', [
        cardNode('restaurant-featured-card', [
          textNode('restaurant-featured-title', '首选：云和会馆', 'h3'),
          textNode('restaurant-featured-meta', '评分 4.7 · 步行 8 分钟 · 人均 ¥168', 'body'),
          textNode('restaurant-featured-reason', '包间质量稳定，晚高峰噪音控制较好，服务节奏也更适合正式商务沟通；菜品风险低，适合第一次正式会面。', 'body'),
          textNode('restaurant-featured-note', '如果你更在意稳妥与安静，这家应排第一；如果临时需要投影设备，也更容易协调。', 'caption'),
        ], 1.35),
        cardNode('restaurant-booking', [
          textNode('restaurant-booking-title', '预订偏好', 'h4'),
          multipleChoiceNode('restaurant-booking-purpose', [
            { label: '正式商务沟通', value: 'business' },
            { label: '轻松聚餐', value: 'casual' },
            { label: '带演示材料沟通', value: 'presentation' },
          ], 'business'),
          dateTimeNode('restaurant-booking-time', '2026-03-17T19:00'),
          checkboxNode('restaurant-booking-room', '优先预订包间', true),
          checkboxNode('restaurant-booking-parking', '需要提供停车位信息', true),
          textNode('restaurant-booking-note', '尽量在 17:30 前锁位，避免晚高峰排队。', 'caption'),
        ]),
      ]),
      dividerNode('restaurant-divider'),
      rowNode('restaurant-plan-row', [
        cardNode('restaurant-route-card', [
          textNode('restaurant-route-title', '到店安排', 'h4'),
          textNode('restaurant-route-body', '18:40 从陆家嘴地铁站出发，步行约 8 分钟可达；如果带客户同行，建议 18:50 先到店确认包间。', 'body'),
          textNode('restaurant-route-note', '门口停车位较少，自驾建议提前联系餐厅登记车牌。', 'caption'),
        ], 1.15),
        cardNode('restaurant-budget-card', [
          textNode('restaurant-budget-title', '预算匹配度', 'h4'),
          textNode('restaurant-budget-copy', '当前推荐与预算的匹配程度', 'caption'),
          sliderNode('restaurant-budget-slider', 82, 0, 100),
          textNode('restaurant-budget-note', '在人均 168 元的情况下，四人用餐仍保留了加点空间。', 'caption'),
        ]),
      ]),
      dividerNode('restaurant-plan-divider'),
      tabsNode('restaurant-tabs', [
        {
          title: '备选名单',
          child: listNode('restaurant-shortlist', [
            detailCardNode('restaurant-option-1', '江南里', [
              '评分 4.6 · 人均 ¥145',
              '本帮菜口味稳，出菜速度快',
              '更适合重视性价比的商务晚餐',
            ]),
            detailCardNode('restaurant-option-2', '初见 Bistro', [
              '评分 4.5 · 人均 ¥158',
              '环境现代，适合带演示材料沟通',
              '临时改成更轻松的会面也不会突兀',
            ]),
          ]),
        },
        {
          title: '推荐理由',
          child: listNode('restaurant-reasons', [
            detailCardNode('restaurant-reason-1', '为什么首推云和会馆', [
              '安静度最稳定，包间体验明显优于同价位餐厅。',
              '服务响应快，适合正式会面中的节奏控制。',
            ]),
            detailCardNode('restaurant-reason-2', '何时切换备选', [
              '如果晚间临时约人，可换到江南里降低等待风险。',
              '如果希望氛围更轻松，可改成初见 Bistro。',
            ]),
          ]),
        },
      ]),
      dividerNode('restaurant-tabs-divider'),
      cardNode('restaurant-footer', [
        textNode('restaurant-footer-title', '推荐结论', 'h4'),
        textNode('restaurant-footer-copy', '优先预订云和会馆；如果更重视性价比，选择江南里会更合适；如果需要更现代的轻商务氛围，则选择初见 Bistro。', 'body'),
        rowNode('restaurant-footer-actions', [
          buttonNode('restaurant-footer-button', '复制推荐摘要'),
          buttonNode('restaurant-footer-book-button', '生成预订备注'),
        ], 'center'),
      ]),
    ]),
  },
  {
    key: 'form-workbench',
    label: '客户入驻申请表',
    scenario: '表单 / Rich Form',
    tone: 'booking',
    description: '新增一个更完整的表单模板，集中覆盖输入框、下拉、日期时间、复选项、滑块、Tabs 和提交动作。',
    value: columnNode('form-root', [
      textNode('form-title', '客户入驻申请', 'h2'),
      textNode('form-copy', '用于收集企业客户的入驻信息、上线计划、功能偏好和通知方式。适合在 playground 中测试复杂表单布局。', 'body'),
      dividerNode('form-header-divider'),
      rowNode('form-metrics', [
        metricCardNode('form-metric-1', '申请状态', '待提交', '提交后自动进入销售审核'),
        metricCardNode('form-metric-2', '预计上线', '2026 Q2', '默认预留 2 周交付缓冲'),
        metricCardNode('form-metric-3', '表单进度', '8 / 10 项', '还需补充预算与通知偏好'),
      ]),
      dividerNode('form-metrics-divider'),
      tabsNode('form-tabs', [
        {
          title: '基础资料',
          child: rowNode('form-basic-tab', [
            cardNode('form-basic-card', [
              textNode('form-basic-title', '企业信息', 'h4'),
              textFieldNode('form-company-name', '企业名称', '星海智能科技有限公司'),
              textFieldNode('form-contact-name', '联系人', '周清和'),
              textFieldNode('form-contact-phone', '联系电话', '13900112233'),
              textFieldNode('form-seat-count', '预计开通席位', '36', 'number'),
              multipleChoiceNode('form-industry', [
                { label: '零售消费', value: 'retail' },
                { label: '企业服务', value: 'b2b' },
                { label: '金融科技', value: 'fintech' },
                { label: '医疗健康', value: 'healthcare' },
              ], 'b2b'),
            ], 1.3),
            detailCardNode('form-basic-note', '填写建议', [
              '联系人尽量填写项目 owner 或决策链关键人。',
              '席位数建议按未来 3 个月峰值预估。',
              '行业字段会影响默认方案模板。',
            ], '这些信息会同步到后续售前方案页。'),
          ]),
        },
        {
          title: '上线计划',
          child: rowNode('form-plan-tab', [
            cardNode('form-plan-card', [
              textNode('form-plan-title', '时间与范围', 'h4'),
              dateTimeNode('form-launch-time', '2026-04-08T10:00'),
              multipleChoiceNode('form-rollout-mode', [
                { label: '试点上线', value: 'pilot' },
                { label: '分阶段上线', value: 'phase' },
                { label: '全量上线', value: 'full' },
              ], 'phase'),
              textNode('form-budget-label', '预算匹配度', 'caption'),
              sliderNode('form-budget-slider', 74, 0, 100),
              checkboxNode('form-training-needed', '需要安排上线培训', true),
              checkboxNode('form-migration-needed', '需要历史数据迁移支持', true),
            ], 1.2),
            checklistCardNode('form-plan-note', '审核关注点', [
              '预算匹配度低于 60 时，需要销售补充报价说明。',
              '如果选择全量上线，建议提前锁定培训与验收时间。',
              '涉及数据迁移时，需要同步技术支持评估风险。',
            ]),
          ]),
        },
      ]),
      dividerNode('form-tabs-divider'),
      rowNode('form-preference-row', [
        cardNode('form-feature-card', [
          textNode('form-feature-title', '功能偏好', 'h4'),
          checkboxNode('form-feature-dashboard', '开通运营分析面板', true),
          checkboxNode('form-feature-workflow', '启用审批流与工单联动', true),
          checkboxNode('form-feature-sso', '对接企业 SSO 登录', false),
          checkboxNode('form-feature-api', '开放 API 与 webhook', true),
        ], 1.2),
        cardNode('form-notification-card', [
          textNode('form-notification-title', '通知偏好', 'h4'),
          multipleChoiceNode('form-notification-channel', [
            { label: '邮件提醒', value: 'email' },
            { label: '企业微信提醒', value: 'wecom' },
            { label: '短信提醒', value: 'sms' },
          ], 'wecom'),
          checkboxNode('form-notification-weekly', '每周发送项目进展摘要', true),
          checkboxNode('form-notification-alert', '关键风险即时提醒', true),
          textFieldNode('form-budget-remark', '补充说明', '计划在首月完成 2 个业务团队接入。'),
        ]),
      ]),
      dividerNode('form-preferences-divider'),
      rowNode('form-footer-row', [
        cardNode('form-submit-note', [
          textNode('form-submit-note-title', '提交说明', 'h4'),
          textNode('form-submit-note-body', '提交后会自动生成客户档案、项目看板和销售跟进任务。建议先确认联系人与上线时间。', 'body'),
        ], 1.25),
        cardNode('form-submit-card', [
          textNode('form-submit-title', '下一步', 'h4'),
          textNode('form-submit-body', '确认所有字段后提交申请，系统会在 5 分钟内同步到 CRM。', 'body'),
          buttonNode('form-submit-button', '提交入驻申请'),
        ]),
      ]),
    ]),
  },
]

const officialLinks = [
  { label: 'Docs', href: 'https://a2ui-sdk.js.org/' },
  { label: 'API', href: 'https://a2ui-sdk.js.org/api/' },
  { label: 'Playground', href: 'https://a2ui-sdk.js.org/playground/' },
  { label: 'GitHub', href: 'https://github.com/easyops-cn/a2ui-sdk' },
]

const defaultText = serializePreset(presets[0].value)
const editorValue = ref(defaultText)
const selectedPresetKey = ref(presets[0].key)
const parseError = ref('')
const lastUpdatedAt = ref('')
const renderedComponent = shallowRef<Types.AnyComponentNode | null>(null)

watch(
  editorValue,
  (nextValue) => {
    try {
      const parsed = parseRenderableNode(nextValue)
      renderedComponent.value = parsed
      parseError.value = ''
      lastUpdatedAt.value = new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch (error) {
      parseError.value = getErrorMessage(error)
    }
  },
  { immediate: true },
)

const selectedPreset = computed(() => {
  return presets.find((preset) => preset.key === selectedPresetKey.value) ?? presets[0]
})

const selectedPresetNumber = computed(() => {
  const index = presets.findIndex((preset) => preset.key === selectedPresetKey.value)
  return String(index + 1).padStart(2, '0')
})

const currentRootType = computed(() => {
  return renderedComponent.value?.type ?? selectedPreset.value.value.type
})

const previewToneClass = computed(() => {
  return `tone-${selectedPreset.value.tone}`
})

const statusText = computed(() => {
  if (parseError.value) {
    return 'JSON 错误'
  }

  return lastUpdatedAt.value ? `已同步 ${lastUpdatedAt.value}` : '等待渲染'
})

const previewHint = computed(() => {
  if (parseError.value) {
    return '当前继续显示最近一次成功渲染的结果。'
  }

  return '编辑左侧 JSON 后，右侧会立即更新。'
})

const jsonLineCount = computed(() => editorValue.value.split('\n').length)

function applyPreset(preset: Preset) {
  selectedPresetKey.value = preset.key
  editorValue.value = serializePreset(preset.value)
}

function formatJson() {
  try {
    editorValue.value = JSON.stringify(JSON.parse(editorValue.value), null, 2)
  } catch (error) {
    parseError.value = getErrorMessage(error)
  }
}

function resetCurrentPreset() {
  applyPreset(selectedPreset.value)
}

function serializePreset(value: RenderableNode) {
  return JSON.stringify(value, null, 2)
}

function parseRenderableNode(source: string): Types.AnyComponentNode {
  const parsed = JSON.parse(source) as unknown
  assertRenderableNode(parsed)
  return parsed as Types.AnyComponentNode
}

function assertRenderableNode(node: unknown): asserts node is RenderableNode {
  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    throw new Error('根节点必须是一个组件对象。')
  }

  const candidate = node as Record<string, unknown>

  if (typeof candidate.type !== 'string' || candidate.type.length === 0) {
    throw new Error('根节点必须包含字符串类型的 type 字段。')
  }

  if (typeof candidate.id !== 'string' || candidate.id.length === 0) {
    throw new Error('根节点必须包含字符串类型的 id 字段。')
  }

  if (!candidate.properties || typeof candidate.properties !== 'object' || Array.isArray(candidate.properties)) {
    throw new Error('根节点必须包含对象类型的 properties 字段。')
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return '无法解析当前 JSON。'
}
</script>

<template>
  <div class="playground-shell">


    <div class="playground-workbench">
      <aside class="examples-sidebar">
        <div class="sidebar-header">
          <p class="sidebar-eyebrow">Examples</p>
          <h3>选择模板</h3>
          <p>先选一个场景，再在右侧查看渲染效果并继续调整 JSON。</p>
        </div>

        <div class="examples-list">
          <button
            v-for="(preset, index) in presets"
            :key="preset.key"
            class="example-card"
            :class="[
              `example-card--${preset.tone}`,
              { 'example-card--active': selectedPresetKey === preset.key },
            ]"
            type="button"
            @click="applyPreset(preset)"
          >
            <div class="example-card-top">
              <span class="example-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="example-scenario">{{ preset.scenario }}</span>
            </div>
            <strong>{{ preset.label }}</strong>
            <p>{{ preset.description }}</p>
          </button>
        </div>
      </aside>

      <section class="panel editor-panel">
        <div class="panel-header">
          <div>
            <p class="panel-title">JSON Editor</p>
            <p class="panel-caption">直接编辑根组件 JSON，保持和官方 playground 一样的核心工作流。</p>
          </div>

          <div class="panel-meta">
            <span class="panel-status accent">{{ selectedPreset.label }}</span>
            <span class="panel-status">{{ jsonLineCount }} lines</span>
            <span class="panel-status" :class="{ error: parseError }">{{ statusText }}</span>
          </div>
        </div>

        <div class="scenario-summary">
          <span class="scenario-tag">{{ selectedPreset.scenario }}</span>
          <p class="scenario-copy">{{ selectedPreset.description }}</p>
        </div>

        <textarea
          v-model="editorValue"
          class="playground-textarea"
          spellcheck="false"
        />
      </section>

      <section class="panel preview-panel" :class="previewToneClass">
        <div class="panel-header">
          <div>
            <p class="panel-title">Preview</p>
            <p class="panel-caption">{{ previewHint }}</p>
          </div>

          <div class="panel-meta">
            <span class="panel-status accent">{{ currentRootType }}</span>
            <span class="panel-status subtle">{{ selectedPreset.scenario }}</span>
          </div>
        </div>

        <div v-if="parseError" class="preview-alert">
          {{ parseError }}
        </div>

        <div class="preview-stage" :class="previewToneClass">
          <div class="preview-window" :class="previewToneClass">
            <div class="preview-window-bar">
              <div class="preview-window-dots" aria-hidden="true">
                <i class="win-dot dot-red"></i>
                <i class="win-dot dot-yellow"></i>
                <i class="win-dot dot-green"></i>
              </div>

              <div class="preview-window-heading">
                <p class="preview-window-label">{{ selectedPreset.label }}</p>
                <strong>{{ selectedPreset.scenario }}</strong>
              </div>

              <span class="preview-window-state">
                <span class="live-dot" aria-hidden="true"></span>
                Live
              </span>
            </div>

            <div class="preview-canvas" :class="previewToneClass">
              <div v-if="renderedComponent" class="preview-surface" :class="previewToneClass">
                <A2UiRenderer
                  surface-id="docs-playground"
                  :component="renderedComponent"
                />
              </div>

              <div v-else class="preview-empty">
                请输入合法的 A2UI 根组件 JSON。
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.playground-shell {
  display: flex;
  flex-direction: column;
  gap: 22px;
  margin-top: 24px;
}

.playground-hero,
.panel,
.examples-sidebar {
  border: 1px solid rgba(226, 232, 240, 0.96);
  border-radius: 28px;
  background: rgba(248, 250, 252, 0.94);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.06);
}

.playground-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.85fr);
  gap: 20px;
  padding: 30px;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.12), transparent 28%),
    radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.1), transparent 26%),
    linear-gradient(135deg, #f8fafc 0%, #eef4fb 58%, #f6f8fc 100%);
}

.hero-copy {
  min-width: 0;
}

.playground-eyebrow,
.panel-title,
.sidebar-eyebrow,
.scenario-tag,
.example-index,
.example-scenario {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.playground-eyebrow {
  margin: 0 0 10px;
  color: #0f766e;
  font-size: 12px;
  font-weight: 700;
}

.playground-hero h2 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(28px, 3.2vw, 42px);
  line-height: 1.08;
}

.playground-lead,
.panel-caption,
.scenario-copy,
.sidebar-header p,
.example-card p {
  color: #475569;
}

.playground-lead {
  margin: 14px 0 0;
  max-width: 760px;
  font-size: 15px;
  line-height: 1.75;
}

.hero-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.hero-link {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: #0f172a;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.hero-link:hover {
  transform: translateY(-1px);
  border-color: #7dd3fc;
  box-shadow: 0 8px 18px rgba(14, 165, 233, 0.12);
}

.hero-status-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px;
  border: 1px solid rgba(191, 219, 254, 0.8);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(10px);
}

.hero-status-title {
  margin: 0;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-status-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.hero-status-grid div {
  padding: 12px 14px;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 18px;
  background: #f8fafc;
}

.hero-status-grid span {
  display: block;
  margin-bottom: 4px;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.hero-status-grid strong {
  color: #0f172a;
  font-size: 16px;
  font-weight: 700;
}

.playground-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.ghost-button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  padding: 10px 16px;
  border-radius: 999px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.ghost-button:hover {
  transform: translateY(-2px);
  border-color: #7dd3fc;
  background: #f8fdff;
  box-shadow: 0 8px 18px rgba(14, 165, 233, 0.12);
}

.playground-workbench {
  display: grid;
  grid-template-columns: minmax(230px, 280px) minmax(0, 0.92fr) minmax(0, 1.08fr);
  gap: 20px;
  align-items: start;
}

.examples-sidebar,
.panel {
  padding: 20px;
}

.examples-sidebar {
  position: sticky;
  top: 84px;
}

.sidebar-header h3 {
  margin: 8px 0;
  color: #0f172a;
  font-size: 22px;
  line-height: 1.2;
}

.sidebar-header p {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
}

.sidebar-eyebrow {
  margin: 0;
  color: #0369a1;
  font-size: 11px;
  font-weight: 700;
}

.examples-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 18px;
}

.example-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #ffffff;
  color: #0f172a;
  text-align: left;
  cursor: pointer;
  font: inherit;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.example-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.example-card--active {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.1);
}

.example-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.example-index {
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
}

.example-scenario {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
}

.example-card strong {
  font-size: 14px;
  line-height: 1.4;
}

.example-card p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
}

.example-card--support .example-scenario,
.example-card--settings .example-scenario {
  background: #e2e8f0;
  color: #475569;
}

.example-card--support.example-card--active,
.example-card--settings.example-card--active {
  border-color: #94a3b8;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
}

.example-card--contact .example-scenario {
  background: #dbeafe;
  color: #1d4ed8;
}

.example-card--contact.example-card--active {
  border-color: #93c5fd;
  background: linear-gradient(135deg, #ffffff, #eff6ff);
}

.example-card--restaurant .example-scenario {
  background: #fef3c7;
  color: #b45309;
}

.example-card--restaurant.example-card--active {
  border-color: #fbbf24;
  background: linear-gradient(135deg, #ffffff, #fff7ed);
}

.example-card--order .example-scenario {
  background: #e0e7ff;
  color: #4338ca;
}

.example-card--order.example-card--active {
  border-color: #a5b4fc;
  background: linear-gradient(135deg, #ffffff, #eef2ff);
}

.example-card--booking .example-scenario {
  background: #d1fae5;
  color: #047857;
}

.example-card--booking.example-card--active {
  border-color: #6ee7b7;
  background: linear-gradient(135deg, #ffffff, #ecfdf5);
}

.example-card--analytics .example-scenario {
  background: #cbd5e1;
  color: #0f172a;
}

.example-card--analytics.example-card--active {
  border-color: #334155;
  background: linear-gradient(135deg, #1e293b, #0f172a);
}

.example-card--analytics.example-card--active strong,
.example-card--analytics.example-card--active p,
.example-card--analytics.example-card--active .example-index {
  color: #e2e8f0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.panel-title {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.panel-caption {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.65;
}

.panel-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.scenario-summary {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
}

.scenario-tag {
  flex: 0 0 auto;
  padding: 6px 10px;
  border-radius: 999px;
  background: #ecfeff;
  color: #0f766e;
  font-size: 10px;
  font-weight: 700;
}

.scenario-copy {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
}

.panel-status {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
}

.panel-status.accent {
  color: #0369a1;
}

.panel-status.subtle {
  color: #475569;
}

.panel-status.error {
  background: #fff1f2;
  color: #dc2626;
  border-color: rgba(248, 113, 113, 0.5);
}

.playground-textarea {
  width: 100%;
  min-height: 880px;
  padding: 18px 20px;
  border: 1px solid rgba(71, 85, 105, 0.5);
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(10, 15, 28, 0.98));
  color: #d9e4f3;
  resize: vertical;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.72;
  box-shadow: inset 0 2px 10px rgba(2, 6, 23, 0.48);
}

.playground-textarea:focus {
  outline: none;
  border-color: #38bdf8;
  box-shadow: inset 0 2px 10px rgba(2, 6, 23, 0.48), 0 0 0 3px rgba(56, 189, 248, 0.16);
}

.preview-alert {
  margin-bottom: 14px;
  padding: 12px 14px;
  border: 1px solid rgba(248, 113, 113, 0.4);
  border-radius: 16px;
  background: #fff1f2;
  color: #b91c1c;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
}

.preview-stage {
  position: relative;
  min-height: 880px;
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 22px;
  background: linear-gradient(180deg, #f4f7fb, #edf2f7);
  overflow: hidden;
}

.preview-window {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 20px 56px rgba(15, 23, 42, 0.1);
}

.preview-window-bar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  background: rgba(248, 250, 252, 0.92);
}

.preview-window-dots {
  display: flex;
  gap: 6px;
  align-items: center;
}

.win-dot {
  display: block;
  width: 11px;
  height: 11px;
  border-radius: 50%;
}

.dot-red { background: #ef4444; }
.dot-yellow { background: #f59e0b; }
.dot-green { background: #22c55e; }

.preview-window-heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.preview-window-label {
  margin: 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.preview-window-heading strong {
  color: #0f172a;
  font-size: 15px;
  font-weight: 700;
}

.preview-window-state {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 12px;
  font-weight: 700;
}

.live-dot {
  display: block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse-live 2.1s ease-in-out infinite;
}

@keyframes pulse-live {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(0.7); }
}

.preview-canvas {
  display: flex;
  flex: 1;
  min-height: 0;
  padding: 18px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.96), rgba(241, 245, 249, 0.96));
}

.preview-surface {
  display: flex;
  flex: 1;
  min-height: 100%;
  padding: 18px;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 18px;
  background: #ffffff;
  overflow: auto;
}

.preview-empty {
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 100%;
  color: #64748b;
  text-align: center;
}

.preview-panel.tone-support .preview-stage,
.preview-stage.tone-support {
  background: linear-gradient(160deg, #f0f4f8 0%, #e8eef5 100%);
}

.preview-window.tone-support .preview-window-state {
  background: #e2e8f0;
  color: #475569;
}

.preview-panel.tone-contact .preview-stage,
.preview-stage.tone-contact {
  background: linear-gradient(160deg, #eff6ff 0%, #dbeafe 100%);
}

.preview-window.tone-contact {
  border-color: rgba(59, 130, 246, 0.14);
}

.preview-window.tone-contact .preview-window-bar {
  background: #f0f7ff;
  border-bottom-color: #bfdbfe;
}

.preview-window.tone-contact .preview-window-state {
  background: #dbeafe;
  color: #1d4ed8;
}

.preview-panel.tone-restaurant .preview-stage,
.preview-stage.tone-restaurant {
  background: linear-gradient(160deg, #fffbf5 0%, #fef3e2 100%);
}

.preview-window.tone-restaurant {
  border-color: rgba(217, 119, 6, 0.16);
}

.preview-window.tone-restaurant .preview-window-bar {
  background: #fff9f0;
  border-bottom-color: #fde4bf;
}

.preview-window.tone-restaurant .preview-window-state {
  background: #fef3c7;
  color: #b45309;
}

.preview-panel.tone-order .preview-stage,
.preview-stage.tone-order {
  background: linear-gradient(160deg, #f6f7ff 0%, #eef2ff 100%);
}

.preview-window.tone-order {
  border-color: rgba(99, 102, 241, 0.14);
}

.preview-window.tone-order .preview-window-bar {
  background: #f4f5ff;
  border-bottom-color: #dfe4ff;
}

.preview-window.tone-order .preview-window-state {
  background: #e0e7ff;
  color: #4338ca;
}

.preview-panel.tone-booking .preview-stage,
.preview-stage.tone-booking {
  background: linear-gradient(160deg, #f0fdf4 0%, #dcfce7 100%);
}

.preview-window.tone-booking {
  border-color: rgba(16, 185, 129, 0.16);
}

.preview-window.tone-booking .preview-window-bar {
  background: #f2fff6;
  border-bottom-color: #c9f7db;
}

.preview-window.tone-booking .preview-window-state {
  background: #d1fae5;
  color: #047857;
}

.preview-panel.tone-analytics .preview-stage,
.preview-stage.tone-analytics {
  background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.16), transparent 34%), linear-gradient(180deg, #0b1220, #111827 62%, #121a2b);
}

.preview-window.tone-analytics {
  border-color: rgba(96, 165, 250, 0.16);
  background: rgba(10, 15, 28, 0.95);
  box-shadow: 0 22px 56px rgba(2, 8, 23, 0.42);
}

.preview-window.tone-analytics .preview-window-bar {
  background: rgba(15, 23, 42, 0.95);
  border-bottom-color: rgba(51, 65, 85, 0.92);
}

.preview-window.tone-analytics .preview-window-label,
.preview-window.tone-analytics .preview-window-heading strong {
  color: #e2e8f0;
}

.preview-window.tone-analytics .preview-window-state {
  background: rgba(59, 130, 246, 0.18);
  color: #93c5fd;
}

.preview-canvas.tone-analytics {
  background: linear-gradient(180deg, rgba(10, 16, 29, 0.92), rgba(14, 20, 35, 0.96));
}

.preview-surface.tone-analytics {
  border-color: rgba(30, 41, 59, 0.9);
  background: linear-gradient(180deg, #0f172a, #111827);
}

.preview-panel.tone-settings .preview-stage,
.preview-stage.tone-settings {
  background: linear-gradient(160deg, #f1f5f9 0%, #e8eef4 100%);
}

.preview-window.tone-settings .preview-window-state {
  background: #e2e8f0;
  color: #475569;
}

.preview-surface :deep(a2ui-row > section) {
  gap: 16px;
}

.preview-surface :deep(a2ui-column > section) {
  gap: 14px;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: flex-start;
}

.preview-surface :deep(a2ui-card) {
  min-width: 0;
}

.preview-surface :deep(a2ui-row > section > a2ui-card),
.preview-surface :deep(a2ui-row > section > a2ui-column),
.preview-surface :deep(a2ui-row > section > a2ui-list),
.preview-surface :deep(a2ui-row > section > a2ui-tabs) {
  flex: 1 1 240px;
  min-width: min(100%, 240px);
}

.preview-surface :deep(a2ui-card > section) {
  height: auto;
  border: 1px solid rgba(226, 232, 240, 0.98);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.06);
}

.preview-surface.tone-analytics :deep(a2ui-card > section) {
  border-color: rgba(51, 65, 85, 0.94);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(17, 24, 39, 0.98));
  box-shadow: 0 16px 36px rgba(2, 8, 23, 0.34);
}

.preview-surface :deep(a2ui-card > section > *) {
  height: auto !important;
  width: 100% !important;
}

.preview-surface :deep(a2ui-list section) {
  padding: 0;
  gap: 14px;
}

.preview-surface :deep(a2ui-divider) {
  display: block;
  width: 100%;
}

.preview-surface :deep(a2ui-divider hr) {
  margin: 10px 0;
  background: rgba(148, 163, 184, 0.26);
}

.preview-surface.tone-analytics :deep(a2ui-divider hr) {
  background: rgba(148, 163, 184, 0.18);
}

.preview-surface :deep(a2ui-text section) {
  gap: 6px;
}

.preview-surface :deep(a2ui-text h1),
.preview-surface :deep(a2ui-text h2),
.preview-surface :deep(a2ui-text h3),
.preview-surface :deep(a2ui-text h4),
.preview-surface :deep(a2ui-text h5) {
  color: #0f172a !important;
  background: none !important;
  -webkit-text-fill-color: currentColor !important;
}

.preview-surface.tone-analytics :deep(a2ui-text h1),
.preview-surface.tone-analytics :deep(a2ui-text h2),
.preview-surface.tone-analytics :deep(a2ui-text h3),
.preview-surface.tone-analytics :deep(a2ui-text h4),
.preview-surface.tone-analytics :deep(a2ui-text h5) {
  color: #f8fafc !important;
}

.preview-surface :deep(a2ui-text p),
.preview-surface :deep(a2ui-text li) {
  margin: 0;
  color: #334155;
}

.preview-surface.tone-analytics :deep(a2ui-text p),
.preview-surface.tone-analytics :deep(a2ui-text li) {
  color: #cbd5e1;
}

.preview-surface :deep(a2ui-text em) {
  color: #64748b;
  font-style: normal;
}

.preview-surface :deep(a2ui-button button) {
  width: fit-content;
  padding: 12px 16px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #0f766e, #0891b2) !important;
  box-shadow: 0 10px 20px rgba(8, 145, 178, 0.18) !important;
  color: #f8fafc;
  font-weight: 700;
  text-transform: none !important;
}

.preview-surface.tone-order :deep(a2ui-button button) {
  background: linear-gradient(135deg, #4f46e5, #2563eb) !important;
}

.preview-surface.tone-restaurant :deep(a2ui-button button) {
  background: linear-gradient(135deg, #ea580c, #d97706) !important;
}

.preview-surface.tone-booking :deep(a2ui-button button) {
  background: linear-gradient(135deg, #059669, #0f766e) !important;
}

.preview-surface :deep(a2ui-text-field section),
.preview-surface :deep(a2ui-multiple-choice section) {
  gap: 6px;
}

.preview-surface :deep(a2ui-text-field input),
.preview-surface :deep(a2ui-multiple-choice select) {
  min-height: 44px;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  background: #ffffff !important;
  box-shadow: none;
  color: #0f172a;
}

.preview-surface.tone-analytics :deep(a2ui-text-field input),
.preview-surface.tone-analytics :deep(a2ui-multiple-choice select) {
  border-color: #334155;
  background: #0f172a !important;
  color: #f8fafc;
}

.preview-surface :deep(a2ui-text-field label),
.preview-surface :deep(a2ui-multiple-choice label),
.preview-surface :deep(a2ui-checkbox label) {
  color: #334155;
  font-weight: 600;
}

.preview-surface.tone-analytics :deep(a2ui-text-field label),
.preview-surface.tone-analytics :deep(a2ui-multiple-choice label),
.preview-surface.tone-analytics :deep(a2ui-checkbox label) {
  color: #cbd5e1;
}

.preview-surface :deep(a2ui-checkbox section) {
  gap: 10px;
  align-items: center;
}

.preview-surface :deep(a2ui-checkbox input) {
  width: 18px;
  height: 18px;
  accent-color: #0f766e;
}

.preview-surface :deep(a2ui-tabs > section) {
  gap: 14px;
}

.preview-surface :deep(a2ui-tabs > section > div) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preview-surface :deep(a2ui-tabs button) {
  min-height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
}

.preview-surface :deep(a2ui-tabs button:disabled) {
  border-color: #7dd3fc;
  background: #ecfeff;
  color: #0f766e;
}

.preview-surface.tone-analytics :deep(a2ui-tabs button) {
  border-color: #334155;
  background: #0f172a;
  color: #cbd5e1;
}

.preview-surface.tone-analytics :deep(a2ui-tabs button:disabled) {
  border-color: #38bdf8;
  background: rgba(8, 145, 178, 0.14);
  color: #67e8f9;
}

@media (max-width: 1280px) {
  .playground-workbench {
    grid-template-columns: minmax(220px, 260px) minmax(0, 1fr);
  }

  .preview-panel {
    grid-column: 1 / -1;
  }
}

@media (max-width: 960px) {
  .playground-hero,
  .playground-workbench {
    grid-template-columns: 1fr;
  }

  .examples-sidebar {
    position: static;
  }

  .panel-header {
    flex-direction: column;
  }

  .panel-meta {
    justify-content: flex-start;
  }

  .playground-textarea,
  .preview-stage {
    min-height: 620px;
  }
}

@media (max-width: 640px) {
  .playground-hero,
  .examples-sidebar,
  .panel {
    padding: 16px;
    border-radius: 22px;
  }

  .hero-status-grid {
    grid-template-columns: 1fr 1fr;
  }

  .scenario-summary {
    flex-direction: column;
  }

  .preview-window-bar {
    grid-template-columns: 1fr;
    justify-items: flex-start;
  }
}
</style>
<style>
.preview-surface section{
    background: transparent !important;
}

</style>