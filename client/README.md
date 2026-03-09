# Academix — Frontend

A dark, elegant React SPA for managing student records. Built with React Router v6, vanilla CSS (no component library), and a custom dark gold theme.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Vanilla CSS | Styling (no Tailwind / MUI) |
| Google Fonts | Playfair Display + DM Sans |

---

## Project Structure

```
src/
├── App.jsx                     # Root component — layout shell + routes
├── services/
│   └── studentService.js       # All API calls (fetch wrappers)
├── pages/
│   ├── StudentsPage.jsx        # /students — active registry
│   └── TrashPage.jsx           # /trash — deleted students
├── components/
│   ├── Table.jsx               # Reusable data table with pagination
│   └── Modal.jsx               # Create / Edit / View modal
└── styles/
    ├── app.css                 # Global theme, layout, shared utilities
    ├── table.css               # Table & pagination styles
    ├── modal.css               # Modal styles
    ├── students.css            # Students page overrides
    └── trash.css               # Trash page + confirm dialog styles
```

---

## Routes

| Path | Component | Description |
|---|---|---|
| `/` | — | Redirects to `/students` |
| `/students` | `StudentsPage` | Lists active students, search, create, edit, delete |
| `/trash` | `TrashPage` | Lists deleted students, restore or permanently purge |

---

## Pages & Components

### `StudentsPage`
- Fetches `GET /student` on mount and on every search/page change
- Search by name and/or email (query params)
- **Add Student** button opens `Modal` in `create` mode
- Each row has three action buttons: **View**, **Edit**, **Delete**
- Delete soft-deletes (moves to trash) via `DELETE /student/:id`
- Toast notifications for all success/error feedback

### `TrashPage`
- Fetches `GET /student/deleted`
- Each row has **Restore** and **Purge** buttons
- Both actions trigger a custom inline confirm dialog (not `window.confirm`) before the API call
- Restore calls `PATCH /student/:id/restore`
- Purge calls `DELETE /student/:id/purge` — permanent, cannot be undone

### `Table`
- Accepts `students`, `pagination`, `page`, and callback props
- Renders loading spinner, empty state, or the data table
- Pagination controls shown when `totalPages > 1`
- On mobile (≤ 640px) rows collapse into cards using `data-label` attributes

### `Modal`
- Three modes: `create`, `edit`, `view` — toggled via a header button
- In `create` mode: posts to `POST /student`
- In `edit` mode: pre-fills form from `GET /student/:id`, patches via `PATCH /student/:id`
- In `view` mode: read-only detail card with avatar, all fields, and the student UUID
- Client-side validation on name, email format, and age range (1–120)
- Conflict errors (duplicate email) surfaced as inline field errors

---

## API Integration

All API calls live in `src/services/studentService.js`. The base URL is hardcoded:

```js
const BASE_URL = "http://localhost:3000/api/v1/student";
```

Change this to match your environment. Every function returns the raw parsed JSON — response checking is done in the calling component by inspecting `responseCode === 1000`.

| Function | Method | Endpoint |
|---|---|---|
| `fetchStudents(params)` | GET | `/student` |
| `fetchStudentById(id)` | GET | `/student/:id` |
| `createStudent(data)` | POST | `/student` |
| `updateStudent(id, data)` | PATCH | `/student/:id` |
| `deleteStudent(id)` | DELETE | `/student/:id` |
| `purgeStudent(id)` | DELETE | `/student/:id/purge` |
| `restoreStudent(id)` | PATCH | `/student/:id/restore` |
| `fetchDeletedStudents(params)` | GET | `/student/deleted` |

---

## Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| > 1024px | Full sidebar with labels, standard table layout |
| ≤ 1024px | Sidebar collapses to 64px icon-only strip |
| ≤ 768px | Sidebar moves to bottom tab bar, page padding tightens, search stacks vertically |
| ≤ 640px | Tables switch to stacked card rows, modal slides up from bottom as a sheet |

---

## Theme

All design tokens are CSS custom properties defined in `app.css`:

```css
--bg-base: #0c0c0f;        /* page background */
--bg-surface: #111116;     /* sidebar, cards */
--bg-elevated: #18181f;    /* table rows, modal */
--accent: #c9a96e;         /* gold — primary action colour */
--text-primary: #f0f0f5;
--text-secondary: #9090a8;
--success: #4ade80;
--danger: #f87171;
```

To retheme the app, update only these variables in `:root` — everything else inherits from them.

---

## Getting Started

```bash
# Install dependencies
npm install react-router-dom

# Start dev server (assuming Vite or CRA)
npm run dev
```

Make sure your backend is running on `http://localhost:3000` before starting the frontend, or update `BASE_URL` in `studentService.js` accordingly.