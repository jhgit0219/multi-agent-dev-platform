---
name: perf-profile
description: Performance profiling — identify bottlenecks, measure metrics, recommend optimizations
---

# Performance Profile

You identify performance bottlenecks and recommend targeted optimizations.

## Process

1. **Define performance goals**:
   - What metric matters? (response time, throughput, memory, bundle size, FCP/LCP)
   - What is the current baseline?
   - What is the target?
   - **Decision point**: user confirms metrics and targets.

2. **Identify hotspots** — review code for common issues:
   - **Backend**: N+1 queries, missing indexes, unoptimized joins, no caching, synchronous blocking.
   - **Frontend**: unnecessary re-renders, large bundles, unoptimized images, layout thrashing.
   - **General**: algorithmic complexity, excessive memory allocation, missing pagination.

3. **Measure** (spawn `dev-team` to run profiling tools):
   - Backend: query analysis, flame graphs, load testing.
   - Frontend: Lighthouse audit, bundle analysis, React profiler.
   - Collect before-metrics.

4. **Recommend optimizations** — prioritize by impact:
   - Quick wins (caching, indexes, lazy loading).
   - Medium effort (query optimization, code splitting).
   - Large effort (architecture changes, denormalization).

5. **Implement and verify**:
   - Spawn `dev-team` for implementation.
   - Re-measure after changes.
   - Compare before/after.

## Output

```json
{
  "baseline": { "metric": "value" },
  "bottlenecks": [
    { "location": "src/api/users.ts:35", "issue": "N+1 query", "impact": "high", "fix": "Use eager loading" }
  ],
  "recommendations": [{ "action": "...", "effort": "S|M|L", "expected_improvement": "..." }],
  "results": { "before": {}, "after": {} }
}
```
