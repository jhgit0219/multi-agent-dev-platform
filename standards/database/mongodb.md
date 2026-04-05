# MongoDB

## Schema Design
- Embed when data is read together and has 1:1 or 1:few relationship
- Reference when data is read independently or has 1:many relationship
- Avoid unbounded arrays in documents
- Use schema validation (JSON Schema) on collections

## Indexing
- Index every field used in queries
- Compound indexes follow ESR rule (Equality, Sort, Range)
- TTL indexes for expiring data
- Text indexes for search; consider Atlas Search for complex queries

## Operations
- Use bulk operations for batch writes
- Transactions for multi-document consistency (replica set required)
- Read concern "majority" for consistent reads
- Write concern "majority" for durability

## Performance
- Explain plans on slow queries
- Avoid large skip values; use range queries for pagination
- Project only needed fields
- Monitor with mongostat and mongotop
