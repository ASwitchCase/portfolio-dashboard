# Portfolio Dashboard

An admin dashboard for viewing and editing the data behind the [Jacques Portfolio Service API](../portfolio/API.md) — Skills, Portfolio Projects, Work Experience, Education, and Contacts.

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your API, if not localhost:7148
npm run dev
```

Sign in with the API's single admin account (the one created via `POST /api/auth/register`). The session token is kept in memory only — refreshing the page or closing the tab signs you out; sessions also expire after 60 minutes, matching the API's token lifetime.

## Structure

- `src/api/client.js` — thin fetch wrapper for the API (auth, CRUD, error handling, 401 → auto sign-out).
- `src/resources/definitions.js` — one config object per resource (Skills, Portfolio Projects, Work Experience, Education, Contacts) describing its fields, table columns, and how to translate to/from the API's JSON shape. This drives the generic list/form pages below instead of duplicating a page per resource.
- `src/pages/ResourceListPage.jsx` / `ResourceFormPage.jsx` — generic table and create/edit form, parameterized by resource.
- `src/auth/` — login form, auth context, and a route guard.

Contacts have no `PUT` endpoint in the API, so the form renders read-only for that resource (create/list/delete still work).

## Notes

- No pagination/filtering/sorting — the API always returns full tables, and the dashboard lists everything as-is.
- Client-side `maxLength` on text fields mirrors the API's database column limits (see API.md) since the API only validates non-emptiness, not length.
