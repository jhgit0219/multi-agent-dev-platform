# State Management

## Decision Tree
1. UI-only state (toggle, form input) -> useState
2. Shared UI state (theme, sidebar) -> Context
3. Server data (API responses) -> React Query / SWR
4. Complex client state (multi-step forms) -> useReducer
5. Global app state (auth, permissions) -> Context + useReducer

## Rules
- Never duplicate server state in client state
- Optimistic updates for better UX on mutations
- Loading and error states for every async operation
- Invalidate queries after mutations; don't manually update cache

## Anti-patterns
- Prop drilling more than 2 levels deep
- useEffect to sync state between components
- Storing computed values in state
- Global state for things that only one component uses
