# web/

The React + TypeScript browser app, built with Vite.

| Folder | Contents |
| --- | --- |
| [src/](src/index.md) | Application source: API client, shared components and pages. |

## Working in the web app

- After editing frontend files, run Biome (`npx biome check --write <paths>`), then `npm run build`, `npm run lint` and `npm test` (Vitest, `*.test.ts` beside the code) from `web/`.
- Run Vite from `web/`; it proxies `/api` and `/healthz` to the Go API on port 8081.
- Target device: a standard iPad in landscape (about 1024×768 or 1180×820). Keep touch targets at least 44px and the sheet dense enough to show several ability cards without scrolling.
- Do not commit build output or dependency folders.
