# Vega Server

Node.js + Express + Prisma 7 + PostgreSQL + Redis

## Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your database and Redis credentials

# Generate Prisma Client
npx prisma generate

# Run migrations
npm run migrate:deploy

# Start server
npm run dev
```

## Commands

### Development
- `npm run dev` - Start with hot reload
- `npm run gen:module <name>` - Generate new module
- `npm run gen:model <name>` - Generate Prisma model
- `npm run gen:migration <name>` - Create and apply migration
- `npm run gen:docs` - Generate Postman collection

### Production
- `npm start` - Start server
- `npm run migrate:deploy` - Deploy migrations

## Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

See [DOCKER.md](DOCKER.md) for details.

## Project Structure

```
├── config/          # Database and Redis config
├── modules/         # Generated modules (routes, services)
├── prisma/          # Database schema and migrations
├── scripts/         # Generator scripts
├── helpers/         # Utilities (JWT, API response)
├── middleware/      # Auth middleware
└── server.js        # Entry point
```

## API

Base URL: `http://domainName/api/v1`

Modules auto-generate routes at `/api/v1/<module-name>`
