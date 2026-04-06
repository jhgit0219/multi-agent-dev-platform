# Build Quality

## Zero Warnings Policy

The build must produce **zero warnings**. No exceptions. No suppression.

- No deprecation warnings from dependencies or code
- No TypeScript warnings or `@ts-ignore` / `@ts-expect-error` without a linked issue
- No linter warnings left unresolved
- No npm/pip install warnings about deprecated packages
- No "peer dependency" warnings left unresolved

## When You See a Warning

1. **Deprecation warning from a dependency**: update the dependency to a version that doesn't emit the warning. If the latest version has breaking changes, fix the breaking changes.
2. **Deprecation warning from your code**: replace the deprecated API call with the recommended alternative immediately.
3. **Peer dependency warning**: install the correct peer dependency version.
4. **TypeScript warning**: fix the type issue. Do not suppress with `any` or `@ts-ignore`.
5. **Build tool warning**: update the config or tool version.

## Verification

After every build step, check the output for warnings. If any exist, fix them before proceeding. The build log should contain only:
- Module count
- Bundle size
- Build time
- No yellow/orange warning text

## Dependency Hygiene

- Run `npm outdated` before starting work on a project to catch stale deps
- Prefer exact versions over ranges for production dependencies
- When a dependency is deprecated, find and switch to its replacement immediately
- Never install a package that is already marked as deprecated on npm
