# Docker Setup Guide

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- **External PostgreSQL database** (running locally or remotely)
- **External Redis instance** (running locally or remotely)

## Important Note

This Docker setup **only containerizes the Node.js application**. You need to have:
- PostgreSQL database running externally
- Redis instance running externally

The app will connect to these external services using the connection strings in your `.env` file.

## Quick Start

1. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update:
   - `DATABASE_URL` - Point to your PostgreSQL database
   - `REDIS_HOST` - Point to your Redis instance
   - `JWT_SECRET` - Set a secure secret
   - Other environment variables as needed

2. **Run migrations on your database** (first time or after schema changes)
   ```bash
   npm run migrate:deploy
   ```

3. **Build and start the app**
   ```bash
   docker-compose up -d
   ```

4. **Check logs**
   ```bash
   docker-compose logs -f app
   ```

5. **Stop the app**
   ```bash
   docker-compose down
   ```

## Scripts

### Development Scripts (Run locally, not in Docker)
- `npm run dev` - Start with nodemon (hot reload)
- `npm run gen:migration <name>` - Create and apply new migration in development
- `npm run gen:module <name>` - Generate new module
- `npm run gen:model <name>` - Generate new Prisma model

### Production Scripts
- `npm start` - Start the server (used by Docker)
- `npm run migrate:deploy` - Deploy/sync migrations to production database

## Common Commands

### View running container
```bash
docker-compose ps
```

### View application logs
```bash
docker-compose logs -f app
```

### Execute commands in app container
```bash
docker-compose exec app sh
```

### Deploy migrations (production)
```bash
# Outside Docker (recommended before deploying)
npm run migrate:deploy

# Or inside Docker container
docker-compose exec app npm run migrate:deploy
```

### Rebuild container after code changes
```bash
docker-compose up -d --build
```

## Workflow

### Development (Local)
1. Run PostgreSQL and Redis locally
2. Run app: `npm run dev`
3. Make schema changes in `prisma/schema.prisma`
4. Create migration: `npm run gen:migration add_new_field`
5. Migration is automatically applied to your local DB

### Production Deployment
1. Push code changes to repository
2. Pull changes on production server
3. Run migrations: `npm run migrate:deploy`
4. Build and deploy: `docker-compose up -d --build`

## Troubleshooting

### App fails to start
1. Verify DATABASE_URL and REDIS_HOST in `.env`
2. Check logs: `docker-compose logs app`
3. Verify environment variables: `docker-compose exec app env`

### Database connection refused
- If PostgreSQL is on your host machine, use `host.docker.internal` instead of `localhost`:
  ```bash
  DATABASE_URL=postgresql://user:pass@host.docker.internal:5432/db
  ```

### Redis connection issues
- If Redis is on your host machine, use `host.docker.internal`:
  ```bash
  REDIS_HOST=host.docker.internal
  ```

### For Linux users
If using `host.docker.internal` doesn't work, add to `docker-compose.yml`:
```yaml
services:
  app:
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

**Security Note**: Never commit `.env` file with credentials to version control!
