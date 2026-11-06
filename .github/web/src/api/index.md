# web/src/api/

Frontend API code: a shared axios client in `client.ts`, plus one subfolder per data object (for example `characters/`) holding its types, request functions and React Query hooks. Components use the hooks, not axios directly.

`characters/types.ts` is the TypeScript model. It must stay consistent with the Go structs in `api/internal/characters/` (see its [index](../../../api/internal/characters/index.md)), including the fixed stat and attribute slots.
