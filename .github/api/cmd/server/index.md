# api/cmd/server/

The API executable. Keep startup, configuration and dependency wiring here, and nothing else. HTTP handling belongs in `internal/httpapi/` and persistence in `internal/characters/`.

Run it with `go run ./cmd/server` from `api/`.
