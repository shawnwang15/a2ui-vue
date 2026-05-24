---
description: A2UI v0.8 protocol overview and a2ui-vue v0.8 version notes.
---

# Introduction (v0.8)

::: warning Version Notice
This documentation is for A2UI protocol **v0.8**. For the latest version, see [v0.9 docs](/en/v0.9/guide/introduction).
:::

## What is A2UI?

**A2UI (Agent-to-UI)** is an open protocol defining the communication specification between AI Agents and front-end rendering layers.  
Agents express UI intent by sending structured JSON messages, and the renderer translates these into actual visual components.

## Key Differences: v0.8 vs v0.9

| Feature | v0.8 | v0.9 |
|---------|------|------|
| Message Format | `surface_id` + `content` array | `createSurface` + `updateComponents` |
| Component Reference | Via `type` field | Via `component` field |
| Data Binding | Static data | Dynamic templates with JSON Pointer |

## Version Notes

v0.8 is an earlier stable version of the A2UI protocol, corresponding to npm package `a2ui-vue@0.8.x`.

> For the latest features, upgrade to [v0.9](/en/v0.9/guide/introduction).
