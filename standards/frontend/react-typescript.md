# React TypeScript

## Component Architecture
- One component per file, named export matching filename
- Colocate styles, tests, and types with the component
- Props interface named `{ComponentName}Props`, exported
- Use composition over prop drilling; context for cross-cutting concerns only

## File Naming
- Components: PascalCase (`UserProfile.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`)
- Utils: camelCase (`formatDate.ts`)
- Types: camelCase (`types.ts`) colocated with usage

## Hooks
- Extract business logic into custom hooks
- Hooks must not call other hooks conditionally
- Cleanup side effects in useEffect return

## State
- Local state for UI-only concerns (open/close, form inputs)
- Shared state via context for auth, theme, feature flags
- Server state via data-fetching library (React Query, SWR), not manual useEffect
- Never store derived data in state; compute it

## TypeScript
- No `any`; use `unknown` if type is truly unknown
- Prefer interfaces for object shapes, types for unions
- Props are always typed; no implicit children
