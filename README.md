
# a2ui-vue
is a community Vue 3 renderer for the **A2UI (Agent-to-UI) protocol**, enabling AI agents to render rich, interactive user interfaces directly within Vue applications
Monorepo root package for the A2UI Vue renderer workspace.

## Package Info

- Name: `a2ui-vue`
- Version: `0.8.0`
- License: `MIT`

## Scripts

- `pnpm run build:lib`
	- Runs `build:lib` in all workspace packages that define it.
- `pnpm run dev:restaurant`
	- Starts all workspace `dev:restaurant` scripts in parallel.
- `pnpm run dev:contact`
	- Starts all workspace `dev:contact` scripts in parallel.
- `pnpm test`
	- Placeholder test script (currently exits with error by design).

## Notes

- This root package is mainly an orchestrator for workspace scripts.
- Actual renderer and sample app implementation lives under sub-packages in this monorepo.
Current version: **0.8.x**, distributed as an ESM/CJS dual-format package (`a2ui-vue`).
