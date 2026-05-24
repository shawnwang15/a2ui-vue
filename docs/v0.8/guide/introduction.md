---
description: A2UI v0.8 协议概述与 a2ui-vue v0.8 版本说明。
---

# 简介 (v0.8)

::: warning 版本提示
此文档对应 A2UI 协议 **v0.8** 版本。最新版本请参阅 [v0.9 文档](/v0.9/guide/introduction)。
:::

## 什么是 A2UI？

**A2UI（Agent-to-UI）** 是一个开放协议，定义了 AI Agent 与前端渲染层之间的通信规范。  
Agent 通过发送结构化的 JSON 消息来表达"我想展示什么样的 UI"，前端渲染器负责将这些意图翻译为真实的可视组件。

## v0.8 与 v0.9 的主要差异

| 特性 | v0.8 | v0.9 |
|------|------|------|
| 消息格式 | `surface_id` + `content` 数组 | `createSurface` + `updateComponents` |
| 组件引用 | 通过 `type` 字段 | 通过 `component` 字段 |
| 数据绑定 | 静态数据 | 支持动态模板与 JSON Pointer |

## 版本说明

v0.8 为 A2UI 协议的早期稳定版本，对应 npm 包 `a2ui-vue@0.8.x`。

> 如需最新功能，建议升级至 [v0.9](/v0.9/guide/introduction)。
