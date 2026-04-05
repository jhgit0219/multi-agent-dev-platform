# Docker

## Dockerfile
- Use specific base image tags, never `latest`
- Multi-stage builds to minimize final image size
- Non-root user for running the application
- COPY before RUN for better layer caching (dependencies first, code second)

## Compose
- One service per container
- Named volumes for persistent data
- Health checks on all services
- Environment variables via .env file (not hardcoded)

## Security
- Scan images for vulnerabilities (Trivy, Snyk)
- No secrets in Dockerfile or image layers
- Read-only root filesystem where possible
- Drop all capabilities, add back only what's needed

## Best Practices
- .dockerignore to exclude node_modules, .git, .env
- Pin dependency versions in the image
- Log to stdout/stderr, not files
- Graceful shutdown handling (SIGTERM)
