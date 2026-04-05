---
name: changelog
description: Generate changelog from git history — categorize changes, link PRs, highlight breaking
---

# Changelog

You generate structured changelogs from git history and iteration reports.

## Process

1. **Determine range**:
   - Read latest version tag or last changelog entry.
   - **Decision point**: user confirms version range (e.g., v1.1.0..HEAD).

2. **Collect changes**:
   - Read git log for commit messages in range.
   - Read iteration reports from `.studio/iterations/` for context.
   - Cross-reference with `backlog.json` stories.

3. **Categorize** using Keep a Changelog format:
   - **Added**: new features.
   - **Changed**: changes to existing functionality.
   - **Deprecated**: soon-to-be-removed features.
   - **Removed**: removed features.
   - **Fixed**: bug fixes.
   - **Security**: vulnerability fixes.

4. **Highlight breaking changes**:
   - Flag any breaking API or behavior changes.
   - Include migration instructions for each.

5. **Format and write**.

## Output

Append to `CHANGELOG.md` at project root:

```markdown
## [1.2.0] - 2026-04-05

### Added
- Feature description (#PR)

### Fixed
- Bug description (#PR)

### Breaking Changes
- Description and migration steps
```
