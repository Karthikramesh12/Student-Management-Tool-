# Student Management System

This project is a full-stack application for managing students.  
It consists of a backend API, a frontend client, and a PostgreSQL database.

The application supports storing and retrieving student data with pagination and status filtering. A seed script populates the database with sample students for testing.

---

## Tech Stack

### Backend
- Node.js
- Express
- Prisma ORM
- PostgreSQL

### Frontend
- React
- Vite

### Infrastructure
- Docker
- Docker Compose

---

## Project Structure

```
project-root
│
├─ client/          # React frontend
├─ server/          # Node.js backend
├─ docker-compose.yml
└─ README.md
```

---

## Features

- Create and store student records
- Pagination support for large datasets
- Status filtering (ACTIVE / DELETED)
- Seed script that inserts 5000 sample students
- Dockerized development environment

---

## Prerequisites

Install the following before running the project:

- Docker
- Docker Compose

Verify installation:

```
docker --version
docker compose version
```

---

## Running the Application

From the **project root** run:

```
docker compose up --build
```

This will start three services:

1. **PostgreSQL database**
2. **Backend server**
3. **Frontend client**

The backend container automatically:

1. Runs Prisma migrations
2. Seeds the database if it is empty
3. Starts the API server

---

## Accessing the Application

Frontend:

```
http://localhost:5173
```

Backend API:

```
http://localhost:3000
```

Example API endpoint:

```
GET /students
```

---

## Database Seeding

The backend includes a seed script that inserts **5000 students**.

The script only runs if the database is empty. If students already exist, the seed step is skipped.

Example log:

```
Database empty. Starting seed...
Inserted 1000 students
Inserted 2000 students
...
Seeding completed
```

On subsequent container restarts:

```
Seed skipped. Students already exist.
```

---

## Stopping the Application

To stop the containers:

```
docker compose down
```

To remove volumes (which deletes the database):

```
docker compose down -v
```

---

## Rebuilding Containers

If dependencies or Dockerfiles change:

```
docker compose up --build
```

---

## Development Notes

- The backend uses Prisma for database access.
- Prisma migrations are executed automatically when the backend container starts.
- The database runs in its own container and persists data using Docker volumes.

---

## License

This project is intended for educational purposes.