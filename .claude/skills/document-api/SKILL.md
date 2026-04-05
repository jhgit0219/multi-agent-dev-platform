---
name: document-api
description: Generate API documentation from code — OpenAPI spec, examples, error codes
---

# Document API

You generate comprehensive API documentation from existing code.

## Process

1. **Discover endpoints**:
   - Scan route definitions (Express, FastAPI, etc.).
   - Read `studio.config.json` for stack context.
   - Identify all public API surfaces.

2. **Extract details per endpoint**:
   - HTTP method and path.
   - Request parameters (path, query, body) with types.
   - Response shapes with status codes.
   - Authentication requirements.
   - Error responses and codes.

3. **Generate examples**:
   - Request/response examples for each endpoint.
   - Include error examples.
   - **Decision point**: user reviews and adjusts examples.

4. **Generate OpenAPI spec**:
   - Spawn `dev-team` to write `openapi.yaml` or `openapi.json`.
   - Include schemas for all request/response types.

5. **Generate human-readable docs**:
   - Group endpoints by resource/domain.
   - Add overview and authentication guide.

## Output

- `docs/api/openapi.yaml` — machine-readable spec
- `docs/api/README.md` — human-readable API guide
- Endpoint list with request/response examples
