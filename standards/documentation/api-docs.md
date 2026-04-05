# API Documentation

## Auto-generation
- Derive from code annotations (OpenAPI/Swagger from FastAPI, JSDoc from Express)
- Keep examples in tests, not manually written docs
- Version the API schema alongside the code

## Required for Each Endpoint
- HTTP method and path
- Request body schema with types
- Response schema with status codes
- Authentication requirements
- Rate limit information

## Style
- Short descriptions, not paragraphs
- Real example values, not "string" or "example"
- Error responses documented alongside success responses
- Changelog for breaking changes
