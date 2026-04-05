# Query Safety

## Deletes
- Every DELETE must have a WHERE clause scoped to specific records
- No cascading deletes without explicit confirmation in the migration
- Bulk deletes (>100 rows) require a backup step before execution
- Soft-delete by default; hard-delete only when legally required

## Migrations
- All migrations must be reversible (include down/rollback)
- Never drop columns in the same release that stops writing to them
- Add columns as nullable first, backfill, then add constraints

## Bulk Operations
- Batch large updates (1000 rows at a time)
- Run bulk ops in transactions with savepoints
- Log before/after counts for verification

## Queries
- Always use parameterized queries; never string interpolation
- Add indexes for any column used in WHERE, JOIN, or ORDER BY on tables >10k rows
- Avoid SELECT *; list columns explicitly
- Set query timeouts on all database connections
