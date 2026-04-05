# Unit Testing

## What to Test
- Public API of modules (exported functions/classes)
- Edge cases and error paths, not just happy path
- State transitions and side effects
- Do NOT test private methods or implementation details

## File Structure
- Test file next to source: `foo.ts` -> `__tests__/foo.test.ts`
- One describe block per module/class
- Descriptive test names: "returns empty array when no results found"

## Assertions
- One logical assertion per test (multiple expects ok if testing one concept)
- Use specific matchers (`toBe`, `toEqual`, `toContain`) not generic `toBeTruthy`
- Assert on structure and values, not string representations

## Mocking
- Mock external dependencies (APIs, databases, file system)
- Do NOT mock the module under test
- Prefer real implementations over mocks when fast and deterministic
- Reset mocks between tests

## Naming Convention
```
describe('ModuleName', () => {
  describe('methodName', () => {
    it('does X when Y', () => {});
    it('throws when Z', () => {});
  });
});
```
