# Radix Component Architecture

## Principles
- Use Radix UI primitives for accessible, unstyled base components
- Wrap primitives in project-specific styled components
- Never override Radix's accessibility behavior

## Structure
```
components/
  ui/           # Radix wrappers (Button, Dialog, Select)
  features/     # Domain-specific composed components
  layouts/      # Page layouts and shells
```

## Rules
- Every interactive component must be keyboard navigable
- Use Radix's built-in ARIA attributes; don't add redundant ones
- Compose complex components from smaller Radix primitives
- Style via className prop or CSS modules; no inline styles
- Forward refs on all wrapper components
