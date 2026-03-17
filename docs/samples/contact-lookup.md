# 示例：联系人查询

**Contact Lookup** 是一个由 LLM 驱动的智能联系人搜索 Agent。  
用户在前端输入人名或关键词，Agent 调用工具查询联系人信息，并通过 A2UI 卡片将结果渲染在页面上。

::: tip 提示
UI 生成速度受模型、网络影响，且因模型能力差异，生成的 UI 可能略有不同。
:::

## 视频演示

<div class="video-placeholder">
  <video controls autoplay src="./videos/contact.mp4"></video>
</div>

## 功能特性

- 自然语言搜索联系人（如"帮我找一下 Alice 的联系方式"）
- Agent 自主调用内部工具查询联系人数据库
- 结果以 A2UI Card 形式展示，包含头像、姓名、电话、邮箱等字段
- 响应式设计，支持 A2UI 主题定制

## 目录结构

```
samples/
├── agent/contact_lookup/    # Agent 端（端口 10003）
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   └── ...
└── client/contact/          # Vue 前端（端口 4000）
    ├── package.json
    ├── src/
    │   ├── App.vue
    │   ├── client.ts        # A2A 协议客户端
    │   └── ...
    └── ...
```

## 启动方式

### 前置：配置 LLM API Key

```bash
cd samples/agent/contact_lookup
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
cd samples/agent/contact_lookup
npm install
npm start
# Agent Card: http://localhost:10003/.well-known/agent-card.json
```

**第二步：启动前端客户端**

```bash
cd samples/client/contact
npm install
npm run dev
# 访问 http://localhost:4000
```

### 方式二：一键启动（pnpm workspace）

```bash
# 在项目根目录
pnpm install
pnpm run build:lib
pnpm run dev:contact    # 并发启动 Agent + 前端
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
Contact Lookup Agent (Node.js / TypeScript)
   │  LLM Tool Calling
   ▼
联系人数据库 (contact_data.json)
   │  A2UI JSON 消息
   ▼
a2ui-vue 渲染器
   │
   ▼
页面展示联系人卡片
```
