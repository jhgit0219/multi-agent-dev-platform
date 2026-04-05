# PostgreSQL

## Schema Design
- Use UUIDs for primary keys on public-facing tables
- Serial/BIGSERIAL for internal-only IDs
- created_at and updated_at on every table (with triggers for updated_at)
- Soft-delete column (deleted_at) where applicable

## Indexing
- Primary keys are indexed automatically
- Add indexes on foreign keys
- Composite indexes: most selective column first
- Partial indexes for filtered queries on large tables

## Migrations
- One migration per logical change
- Always test rollback before deploying
- Never modify a deployed migration; create a new one
- Use transactions for DDL changes

## Performance
- EXPLAIN ANALYZE on queries hitting >10k rows
- Connection pooling (PgBouncer or built-in)
- Avoid N+1: use JOINs or batch queries
- Vacuum and analyze on schedule for large tables
