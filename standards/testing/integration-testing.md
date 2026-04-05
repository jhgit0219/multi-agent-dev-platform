# Integration Testing

## Scope
- Test interactions between modules (service + database, API + service)
- Use real dependencies when possible (test database, not mocks)
- Each test manages its own data; no shared test state

## Database Tests
- Run against a real test database (Docker or in-memory)
- Wrap each test in a transaction and roll back after
- Seed minimum data needed for the test
- Assert on database state, not just return values

## API Tests
- Use the framework's test client (TestClient, supertest)
- Test full request/response cycle including middleware
- Verify status codes, response shape, and side effects
- Test auth flows end-to-end

## Rules
- Slower than unit tests; run in CI but allow skipping locally
- Tag integration tests so they can run separately
- Clean up external resources (files, queues) in afterEach
