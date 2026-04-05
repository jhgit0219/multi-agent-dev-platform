# Code Comments

## When to Comment
- Non-obvious business rules
- Performance optimizations that sacrifice readability
- Workarounds for known bugs in dependencies
- Regex patterns

## When NOT to Comment
- Self-explanatory code
- Restating what the code does ("increment counter by 1")
- Commented-out code (delete it; git has history)
- Closing brace annotations (`} // end if`)

## Format
- Single line for short explanations
- Block comment for multi-line context
- Link to issue tracker for workarounds: `// Workaround for #1234`

## Documentation Comments
- Public API functions: describe params, return value, throws
- Use language-native doc format (JSDoc, docstrings)
- Keep in sync with code; stale docs are worse than none
