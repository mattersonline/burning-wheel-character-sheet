# Project Guidelines

## Architecture

This repository is a small full-stack app: React + TypeScript in `web/`, a Go HTTP API in `api/`. Keep shared character fields consistent between the frontend model and Go JSON struct. Detailed documentation lives in folders under .github/ that mirror the project structure; each folder has an index.md describing its subfolders. Start from the index below.

## Documentation index

| Folder | Contents |
| --- | --- |
| [api/](api/index.md) | The Go API: server wiring, HTTP transport, the character model and SQLite storage. |
| [web/](web/index.md) | The React app: API client, shared components (including the dice roller) and pages (including the character sheet tabs). |

The gents/ folder holds custom agent definitions.

## Build and Test

- After editing frontend files, run Biome on them (`npx biome check --write <paths>` from `web/`) before building.
- Frontend: run `npm run build`, `npm run lint` and `npm test` (Vitest) from `web/`.
- API: run `go test ./...` from `api/`.
- For local development, run the Go API on port 8081 and Vite from `web/`; Vite proxies `/api` and `/healthz`.

## Conventions

- Keep API startup and dependency wiring in `api/cmd/server/`, HTTP transport in `api/internal/httpapi/`, and character models and persistence in `api/internal/characters/`.
- Start the API with `go run ./cmd/server` and run API tests with `go test ./...` from `api/`.
- Prefer const arrow functions for React components. Extract them to separate files when practical.
- Each page has a folder in `web/src/pages/`. Single-use subcomponents live in files alongside the page component; a subcomponent that needs its own extra files gets its own folder (e.g. `pages/CharacterSheet/SkillsTab/`). Only components used in multiple locations go in `web/src/components/`. Keep page components thin.
- A component with any file of its own (e.g. its CSS module) lives in a folder named after it (`Roster/Roster.tsx`); components with no associated files stay plain `.tsx` files.
- Style with CSS Modules: each component has a `styles.module.css` in its own folder (imported as `styles`, camelCase classes). Only global resets/base styles go in `web/src/index.css`.
- Colors in CSS modules are never raw hex: use the `var(--c-<hex>)` variables defined in `web/src/theme.css`, which has a light value and a dark value (`:root[data-theme="dark"]`) for each. A new color needs both entries; `ThemeToggle/theme.test.ts` fails if a used variable is undefined or a raw hex slips in.
- Frontend API code lives in `web/src/api/`: shared axios client in `client.ts`, one subfolder per data object with its types, requests, and React Query hooks. Components use the hooks, not axios directly.
- When the user comments on code structure or conventions, record it in these instructions or in the index.md of the matching folder under .github/ so future work follows it. Add a new index.md when you add a documented folder, and list it in its parent's index.
- Add focused tests for behavior changes; do not rely on manual UI checks alone.
- Local JSON storage is development-only and is not suitable for public multi-user deployment.- Every deletion or removal of user data (characters, skills, any record) must ask for confirmation first. Use `ConfirmDialog` (`RemoveButton` already does); never delete directly or with `window.confirm`.
