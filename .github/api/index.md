# api/

The Go HTTP API. It is independent of Vite so another frontend or deployment can use it later.

| Folder | Contents |
| --- | --- |
| [cmd/](cmd/index.md) | Executables. `cmd/server/` is the API entry point and wiring. |
| [internal/](internal/index.md) | Packages private to the API: HTTP transport and the character model with persistence. |
| [data/](data/index.md) | Default location of the local SQLite database. |

## Working in the API

- Start the API with `go run ./cmd/server` from `api/`; it listens on port 8081.
- Run tests with `go test ./...` from `api/`. Add or update Go tests alongside the package whose behavior changes.
- Format with `gofmt -w .`.
