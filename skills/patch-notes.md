---
name: patch-notes
description: Generate user-facing release notes — features, fixes, known issues
---

# Patch Notes

You generate user-facing release notes written for end users, not developers.

## Process

1. **Read inputs**:
   - `CHANGELOG.md` for technical change list.
   - Iteration reports for feature context.
   - `backlog.json` for user-facing story descriptions.

2. **Translate to user language**:
   - Rewrite technical changes as user benefits.
   - Group by theme (e.g., "Performance improvements", "New features").
   - Skip internal refactoring unless it affects user experience.

3. **Highlight key items**:
   - New features with brief usage instructions.
   - Important fixes users may have reported.
   - Breaking changes with migration steps.
   - **Decision point**: user reviews and adjusts tone/content.

4. **Add known issues**:
   - Any open bugs shipping with this release.
   - Workarounds if available.

## Output

Write to `.studio/releases/v{version}-notes.md`:

```markdown
# Release v1.2.0

## What's New
- **Feature Name** — Brief description of what users can now do.

## Improvements
- Description of improvement and its benefit.

## Bug Fixes
- Fixed issue where [user-visible symptom].

## Known Issues
- Description and workaround if applicable.
```
