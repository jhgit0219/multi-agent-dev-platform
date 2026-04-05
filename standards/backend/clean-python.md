# Clean Python

## Structure
- Functions do one thing
- Max function length: ~30 lines (guideline, not law)
- No nested functions unless closure is needed
- Type hints on all public function signatures

## Naming
- snake_case for functions and variables
- PascalCase for classes
- UPPER_SNAKE for constants
- Descriptive names; no single-letter variables except loop counters

## Error Handling
- Catch specific exceptions, never bare `except:`
- Raise early, catch late
- Custom exceptions for domain errors
- Always include context in error messages

## Dependencies
- Pin exact versions in requirements files
- Minimal dependencies; stdlib first
- No circular imports; enforce with layered architecture

## Testing
- pytest as test runner
- Fixtures for setup, not setUp methods
- parametrize for testing multiple inputs
