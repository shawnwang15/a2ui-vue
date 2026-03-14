---

**`@shawnwang15/a2ui-vue`** is a community Vue 3 renderer for the **A2UI (Agent-to-UI) protocol**, enabling AI agents to render rich, interactive user interfaces directly within Vue applications.

Built on top of `@a2ui/web_core`, it provides a composable API (`useMessageProcessor`, `provideA2UI`) and a comprehensive set of Vue components that dynamically interpret A2UI protocol messages and render structured surfaces — all driven by agent output.

**Key highlights:**

- **Protocol-driven rendering** — Processes A2UI messages from any compliant agent and maps them to reactive Vue surfaces without manual UI coding.
- **Rich component library** — Ships with layout (`A2UIRow`, `A2UIColumn`, `A2UICard`, `A2UIList`), content (`A2UIText`, `A2UIImage`, `A2UIVideo`, `A2UIAudio`), input (`A2UIButton`, `A2UITextField`, `A2UICheckbox`, `A2UISlider`, `A2UIMultipleChoice`, `A2UIDateTimeInput`), and navigation (`A2UITabs`, `A2UIModal`) components out of the box.
- **Composable & themeable** — Configuration is injected via `provideA2UI`, supporting custom component catalogs and themes.
- **Dynamic component resolution** — The `A2UIRenderer` component leverages a catalog-based lookup to resolve and render any registered component at runtime.
- **Secure markup rendering** — Uses `DOMPurify` for safe HTML/Markdown output, and `markdown-it` for rich text support.
- **TypeScript-first** — Fully typed with `.d.ts` declarations and Vue 3 Composition API patterns throughout.

Current version: **0.8.x**, distributed as an ESM/CJS dual-format package (`@shawnwang15/a2ui-vue`).
