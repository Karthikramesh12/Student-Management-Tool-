# Vega Server

Backend service for the Student Management System.

Built with **Node.js, Express, Prisma ORM, PostgreSQL, and Redis**.  
The server exposes REST APIs for managing students, including soft delete, restore, permanent deletion, pagination, and search.

---

# Tech Stack

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- Redis
- Node Cron
- Docker

---

# Base API URL

```
http://localhost:3000/api/v1
```

Student routes:

```
/api/v1/student
```

---

# Project Structure

```
server
│
├── config/              # Database and Redis configuration
├── modules/
│   └── student/
│       ├── routes/      # Express routes
│       └── services/    # Business logic
│
├── prisma/              # Prisma schema and migrations
├── helpers/             # API response format and pagination helpers
├── middleware/          # Authentication / middleware
├── cronJobs/            # Background scheduled jobs
├── scripts/             # Utility scripts
├── routes/              # API router entry
└── server.js            # Application entry point
```

---

# Setup

Install dependencies:

```
npm install
```

Copy environment variables:

```
cp .env.example .env
```

Generate Prisma client:

```
npx prisma generate
```

Run migrations:

```
npm run migrate:deploy
```

Start development server:

```
npm run dev
```

Start production server:

```
npm start
```

---

# API Response Format

All responses follow a consistent structure:

```
{
  "responseCode": 1000,
  "responseMessage": "Operation completed successfully.",
  "responseData": {}
}
```

Error responses follow the same structure with different codes.

---

# Student API

Base route:

```
/api/v1/student
```

---

# 1. Get All Students

Returns a paginated list of active students.

```
GET /api/v1/student
```

Query parameters:

| Parameter | Description |
|---|---|
| page | Page number |
| limit | Number of records per page |
| name | Search by name |
| email | Search by email |
| status | Filter by status |

Example:

```
GET /api/v1/student?page=1&limit=10
```

Example response:

```
{
  students: [],
  pageinate: {
    total: 100,
    page: 1,
    limit: 10,
    totalPages: 10,
    hasNext: true,
    hasPrev: false
  }
}
```

---

# 2. Get Student By ID

Returns a single student.

```
GET /api/v1/student/:id
```

Example:

```
GET /api/v1/student/123
```

Only **ACTIVE** students are returned.

---

# 3. Create Student

Creates a new student.

```
POST /api/v1/student
```

Request body:

```
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 21
}
```

Validation rules:

- name required
- email required
- age required
- email must be unique

---

# 4. Update Student

Updates student information.

```
PATCH /api/v1/student/:id
```

Example:

```
PATCH /api/v1/student/123
```

Body fields (optional):

```
{
  "name": "Updated Name",
  "email": "updated@email.com",
  "age": 22,
  "status": "ACTIVE"
}
```

Only **ACTIVE** students can be updated.

---

# 5. Soft Delete Student

Marks a student as deleted.

```
DELETE /api/v1/student/:id
```

This does **not remove the record** from the database.  
Instead it updates the status:

```
status = "DELETED"
```

This allows restoring the student later.

---

# 6. Get Deleted Students

Returns soft-deleted students.

```
GET /api/v1/student/deleted
```

Supports pagination and search:

```
GET /api/v1/student/deleted?page=1&limit=10
```

---

# 7. Restore Student

Restores a soft-deleted student.

```
PATCH /api/v1/student/:id/restore
```

Behavior:

```
status: DELETED → ACTIVE
```

---

# 8. Permanently Delete Student

Completely removes a student from the database.

```
DELETE /api/v1/student/:id/purge
```

This only works if the student is already marked as **DELETED**.

---

# Soft Delete Strategy

The system uses **soft deletion**.

Student statuses:

```
ACTIVE
DELETED
```

Behavior:

| Action | Result |
|------|------|
Delete | status → DELETED |
Restore | status → ACTIVE |
Purge | record removed permanently |

---

# Pagination

Pagination is handled using a helper.

Query parameters:

```
?page=1
&limit=10
```

Returned metadata:

```
{
  total,
  page,
  limit,
  totalPages,
  hasNext,
  hasPrev
}
```

---

# Background Jobs

The server runs scheduled cleanup jobs.

File:

```
cronJobs/deleteOldStudentsCron.js
```

Schedule:

```
Every day at 2 AM
```

Behavior:

Deletes students that:

```
status = DELETED
AND
updatedAt older than 30 days
```

This prevents deleted records from staying forever.

---

# Docker

Run the backend with Docker:

```
docker compose up --build
```

View logs:

```
docker compose logs -f server
```

Stop containers:

```
docker compose down
```

---

# Development Commands

```
npm run dev
```

Start server with hot reload.

```
npm run gen:module <name>
```

Generate a new module.

```
npm run gen:model <name>
```

Create a Prisma model.

```
npm run gen:migration <name>
```

Generate a migration.

```
npm run gen:docs
```

Generate Postman API collection.

---

# Notes

- Prisma manages database queries and migrations.
- All API responses use a standardized response format.
- Soft deletion ensures records can be restored before permanent removal.
- Background jobs clean up old deleted records automatically.