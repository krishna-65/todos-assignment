# Todos — Manage What To Do

A MERN-stack to-do app with a mobile-first UI based on the provided Figma design.
Create, edit, delete and search tasks, mark them completed or in progress, and track progress week by week (weeks run Monday → Sunday).

## Stack

| Layer    | Tech                                                |
| -------- | --------------------------------------------------- |
| Client   | React 18, Vite, Tailwind CSS v4, React Router, date-fns, lucide-react |
| Server   | Node.js, Express 5, Mongoose                        |
| Database | MongoDB (falls back to an in-memory MongoDB for local dev) |

## Getting started

```bash
npm run install:all   # installs root, server and client dependencies
npm run dev           # API on :5000, client on http://localhost:5173
```

You don't need to set up a database. If `MONGO_URI` is not set, the server starts an in-memory MongoDB and fills it with demo tasks around the current week. The data is lost when the server restarts.
The first in-memory run downloads a MongoDB binary of about 600 MB, which is cached afterwards. On a slow connection, use a free MongoDB Atlas cluster or a local `mongod` instead.

To use a real database, copy `server/.env.example` to `server/.env` and set:

```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/todos
```

### Production build

```bash
npm run build                       # builds client/dist
NODE_ENV=production npm start       # Express serves the API and the built client on :5000
```

## Features

- **Onboarding**: the "Manage What To Do" welcome screen, shown once.
- **Home**
  - Monday–Sunday week strip with previous/next week navigation and a dot on days that have tasks
  - "Task Complete" / "Task Pending" cards and a weekly progress bar for the selected week
  - Tasks for the selected day
  - **Weekly Overview**: one card per week with open and completed counts. Tap a card to expand it and see that week's tasks grouped by day. The current week starts expanded.
- **Create / Edit**: a bottom sheet (a centered dialog on desktop) with title\*, date\*, start time\*, optional end time, priority (Low / Medium / High) and description. It validates input on both client and server.
- **Status**: tick the checkbox, or use the detail sheet, to switch a task between *Completed* and *In Progress*. All counts update right away.
- **Delete**: swipe a task left and tap **Delete**, or use the trash icon. An **Undo** toast lets you restore it.
- **Search**: searches title and description as you type, with All / In Progress / Completed filters. You can view, edit or delete from the results. "View All" opens this list showing every task.
- **Responsive**: a phone-width layout on mobile that becomes a two-column dashboard at `lg` and up.

## API

Base URL: `/api/tasks`

| Method | Path        | Description |
| ------ | ----------- | ----------- |
| GET    | `/`         | List tasks. Query: `from`, `to` (ISO dates, `to` exclusive), `q` (keyword), `status` (`in-progress` \| `completed`) |
| GET    | `/weeks`    | Per-week summary `[{ weekStart, total, open, completed }]`. Query: `tz` (IANA timezone, e.g. `Asia/Kolkata`) |
| GET    | `/:id`      | Get one task |
| POST   | `/`         | Create a task |
| PATCH  | `/:id`      | Update any task fields |
| DELETE | `/:id`      | Delete a task |

Task shape:

```jsonc
{
  "title": "Doing Homework",          // required
  "description": "Math chapter 4",    // optional
  "startAt": "2026-11-03T10:30:00Z",  // required (date & time)
  "endAt": "2026-11-03T11:30:00Z",    // optional, must be after startAt
  "priority": "medium",               // optional: low | medium | high
  "status": "in-progress"             // in-progress (default) | completed
}
```

Validation errors return `400` with `{ message, errors: { field: message } }`.

## Project structure

```
server/src
  index.js          Express app and startup
  db.js             Mongo connection (in-memory fallback)
  models/Task.js    Mongoose schema
  routes/tasks.js   CRUD, search and weekly aggregation
  errors.js         Error handling
  seed.js           Demo data
client/src
  context/TaskContext.jsx   Shared mutations, sheets and toasts
  pages/                    Onboarding, Home, Search
  components/               TaskItem (swipeable), TaskForm, TaskDetail, WeekCard, WeekStrip, ...
  lib/                      API client, date helpers, hooks
```
