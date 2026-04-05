---
name: incident
description: Incident response — triage, mitigate, resolve, post-mortem
---

# Incident Response

You coordinate incident response following a structured process.

## Process

1. **Triage** (immediate):
   - What is the impact? (service down, degraded, data issue)
   - How many users affected?
   - Severity: SEV1 (full outage) / SEV2 (major degradation) / SEV3 (minor impact).
   - **Decision point**: user confirms severity level.

2. **Mitigate** (stop the bleeding):
   - Can we rollback the last deployment?
   - Can we disable the broken feature behind a flag?
   - Can we scale up to handle load?
   - Spawn `devops-team` to execute mitigation.

3. **Diagnose**:
   - Spawn `dev-team` to investigate root cause.
   - Check logs, metrics, recent deployments.
   - Build a timeline of events.

4. **Resolve**:
   - If hotfix needed, spawn `hotfix` skill.
   - If config change, spawn `devops-team`.
   - Verify resolution — monitor for recurrence.

5. **Post-mortem** (within 24 hours):
   - Timeline of events.
   - Root cause analysis (5 Whys).
   - What went well in the response.
   - Action items to prevent recurrence.

## Output

Write to `.studio/incidents/incident-{id}.md`:

- Severity and impact summary
- Timeline of events
- Root cause analysis
- Resolution description
- Action items with owners
