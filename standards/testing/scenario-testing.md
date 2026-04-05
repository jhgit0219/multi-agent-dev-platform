# Scenario Testing

## Purpose
- Validate complete user workflows end-to-end
- Verify that the system behaves correctly from the user's perspective
- Catch integration issues that unit and integration tests miss

## Structure
- One file per user story or workflow
- Steps mirror actual user actions (sign up, create resource, verify)
- Include setup, action, and verification phases

## Rules
- Test against a running application (staging or local)
- Use realistic data, not lorem ipsum
- Test happy path first, then error paths
- Include timing-sensitive scenarios (race conditions, timeouts)

## Naming
```
describe('User Registration Flow', () => {
  it('allows new user to register, verify email, and log in', () => {});
  it('rejects duplicate email with clear error message', () => {});
});
```

## Maintenance
- Scenario tests break most often; keep them focused
- Max 10 steps per scenario; split long workflows
- Use page objects or action helpers to reduce duplication
