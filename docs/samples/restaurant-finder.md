# 示例：餐厅查找

**Restaurant Finder** 是一个由 LLM 驱动的餐厅推荐 Agent。  
用户描述偏好（菜系、地区、人均消费等），Agent 从本地数据集中检索匹配的餐厅，并通过 A2UI 渲染精美的餐厅卡片。

## 视频演示

<div class="video-placeholder">
  <div class="video-placeholder-inner">
    <div class="video-placeholder-icon">🎬</div>
    <div class="video-placeholder-label">餐厅查找 · 视频演示</div>
    <div class="video-placeholder-sublabel">即将上线，敬请期待</div>
  </div>
</div>

## 功能特性

- 自然语言描述需求（如"推荐一家人均 100 元以内的川菜馆"）
- Agent 通过 Tool Calling 调用餐厅搜索工具
- 结果以 A2UI 卡片或列表形式展示，包含餐厅名称、评分、地址、图片等
- 支持多轮对话，逐步精确筛选条件

## 目录结构

```
samples/
├── agent/restaurant_finder/    # Agent 端（端口 10002）
│   ├── package.json
│   ├── .env.example
│   ├── restaurant_data.json    # 餐厅数据集
│   ├── src/
│   └── ...
└── client/restaurant/          # Vue 前端（端口 4000）
    ├── package.json
    ├── src/
    │   ├── App.vue
    │   ├── client.ts           # A2A 协议客户端
    │   ├── theme.ts            # A2UI 主题配置
    │   └── styles.css
    └── ...
```

## 启动方式

### 前置：配置 LLM API Key

```bash
cd samples/agent/restaurant_finder
cp .env.example .env
```

编辑 `.env`，填入你的 LLM 配置：

```dotenv
LLM_API_KEY=your_api_key_here
LLM_MODEL_SERIES=qwen          # 可选: gpt / qwen / gemini
```

### 方式一：分步启动

**第一步：启动 Agent**

```bash
cd samples/agent/restaurant_finder
npm install
npm start
# Agent Card: http://localhost:10002/.well-known/agent-card.json
```

**第二步：启动前端客户端**

```bash
cd samples/client/restaurant
npm install
npm run dev
# 访问 http://localhost:4000
```

### 方式二：一键启动（pnpm workspace）

```bash
# 在项目根目录
pnpm install
pnpm run build:lib
pnpm run dev:restaurant    # 并发启动 Agent + 前端
```

## Agent 配置参考

| 变量                | 默认值                                                      | 说明                               |
|-------------------|----------------------------------------------------------|----------------------------------|
| `LLM_API_KEY`     | _(必填)_                                                  | LLM 接口的 API Key                  |
| `LLM_API_BASE`    | `https://dashscope.aliyuncs.com/compatible-mode/v1`      | API Base URL（默认为阿里云兼容端点）         |
| `LLM_MODEL_SERIES`| `qwen`                                                   | 模型系列：`gpt` / `qwen` / `gemini`/ `minimax` |
| `MODEL_NAME`   | _(可选)_                                                  | 显式指定模型（覆盖系列默认值）                  |


## 架构说明

```
用户输入
   │
   ▼
Vue 前端 (src/client.ts)
   │  A2A 协议（SSE 流）
   ▼
Restaurant Finder Agent (Node.js / TypeScript)
   │  LLM Tool Calling
   ▼
餐厅数据集 (restaurant_data.json)
   │  A2UI JSON 消息
   ▼
a2ui-vue 渲染器
   │
   ▼
页面展示餐厅推荐卡片
```

## 主题定制

餐厅 Demo 展示了如何通过 `src/theme.ts` 自定义 A2UI 主题，匹配美食类应用的视觉风格：

```ts
// samples/client/restaurant/src/theme.ts
export const restaurantTheme = {
  primaryColor: '#f97316',   // 橙色系，传达食欲感
  backgroundColor: '#fafaf9',
  textColor: '#292524',
  borderRadius: '12px',
}
```

```ts
// App.vue
import { provideA2UI, DEFAULT_CATALOG } from 'a2ui-vue'
import { restaurantTheme } from './theme'

provideA2UI({ catalog: DEFAULT_CATALOG, theme: restaurantTheme })
```
