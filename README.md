# Burning Wheel Character Archive

A browser-based character sheet for organizing characters from Burning Wheel campaigns. The frontend is React and TypeScript; the backend is a Go HTTP API.

## Requirements

- Node.js 20.19+ or 22.12+ and npm
- Go 1.22+

## Run locally

Start the backend in one terminal from the repository root:

```powershell
cd api
go run ./cmd/server
```

The API listens on `http://localhost:8081` by default.

In a second terminal, install frontend dependencies and start the Vite development server:

```powershell
cd web
npm install
npm run dev
```

Open the local URL printed by Vite. Its development server proxies `/api` and `/healthz` requests to the backend on port 8081, so both servers need to be running while using the app.

Character data is stored in `api/data/characters.db` (SQLite). On first startup, existing data in `api/data/characters.json` is imported automatically. SQLite is embedded in the Go application; no separate database server is needed. Set `CHARACTER_DATABASE_FILE` to change the database path, `CHARACTER_DATA_FILE` to change the legacy JSON import path, or `PORT` to change the API port (default `8081`).

## Tests and checks

Run frontend checks from `web/`:

```powershell
npm run build
npm run lint
npm test
```

Run backend tests from `api/`:

```powershell
go test ./...
```

## Project structure

- `web/` — React and TypeScript frontend
- `api/cmd/server/` — API configuration and startup
- `api/internal/httpapi/` — HTTP transport
- `api/internal/characters/` — character models and SQLite storage

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for the documentation index and project guidance.