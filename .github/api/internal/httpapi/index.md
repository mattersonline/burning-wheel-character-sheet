# api/internal/httpapi/

HTTP transport only: routing, request decoding and response encoding. The browser reaches it through relative `/api` URLs, which Vite proxies to port 8081 in development. Keep behavior independent of Vite.

Planned: validate domain constraints in the API and add focused endpoint tests.
