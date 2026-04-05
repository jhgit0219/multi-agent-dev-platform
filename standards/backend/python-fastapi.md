# Python FastAPI

## Route Structure
- Group routes by domain in separate routers (`/users`, `/projects`)
- Route files contain only request/response handling
- Business logic lives in service modules, not routes
- One router per file, prefixed with the resource name

## Service Layer
- Services are plain classes or functions, no framework dependency
- Services take repositories/clients as constructor args (dependency injection)
- Services raise domain exceptions, not HTTP exceptions
- Routes catch domain exceptions and map to HTTP status codes

## Error Handling
- Use custom exception classes inheriting from a base `AppError`
- Global exception handler maps `AppError` subtypes to HTTP responses
- Log unexpected exceptions with full traceback
- Return consistent error response shape: `{"error": {"code": str, "message": str}}`

## Module Organization
```
app/
  main.py          # FastAPI app creation, middleware
  routes/          # Route handlers only
  services/        # Business logic
  models/          # SQLAlchemy/Pydantic models
  schemas/         # Request/response Pydantic schemas
  repositories/    # Database access
  core/            # Config, security, dependencies
```

## Validation
- Use Pydantic models for all request/response schemas
- Validate at the boundary; trust internal data
- Enum fields for constrained values
