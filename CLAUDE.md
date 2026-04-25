# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run serve` — Start dev server on port 3001 (proxies `/api` to `http://localhost:8080`)
- `npm run build` — Production build to `dist/`

## Tech Stack

- Vue 2.7 (Options API) + Vue Router 3 + Vuex 3
- Element UI 2.x component library
- Axios for HTTP, CodeMirror 5 for JSON editing
- No TypeScript, no test framework, no linter configured

## Project Architecture

```
src/
├── api/             # Axios request wrappers (auth.js, resume.js, request.js)
├── components/      # Reusable components (CodeMirrorEditor.vue)
├── layouts/         # Page layout components (MainLayout.vue with sidebar nav)
├── router/          # Vue Router with route guards (auth redirect logic)
├── store/           # Vuex modules: auth (login/logout/token), resume (CRUD)
├── utils/           # localStorage token helpers (storage.js)
├── views/           # Page components (Login, ResumeList, ResumeUpload)
├── App.vue          # Root component with <router-view>
└── main.js          # Entry point — loads ElementUI, router, store
```

### Auth Flow
- Login sends POST `/api/admin/login`, stores JWT in localStorage, loads into Vuex.
- `router/index.js` beforeEach guard: redirects to `/login` if no token, redirects to `/` if already logged in on login page.
- Axios interceptor in `api/request.js` attaches `Authorization: Bearer <token>` header and handles 401 by clearing token and redirecting.

### Routing
- `/login` — Login page (no auth required)
- `/` — Main layout with left sidebar, nested children:
  - `/` — ResumeList (table with edit drawer + CodeMirror)
  - `/upload` — ResumeUpload (form: name, age, workYears, PDF file)

### API Layer
- Base URL: `/api` (proxied in dev, expects reverse proxy in production)
- All resume CRUD endpoints under `/api/resumes`, login under `/api/admin/login`
- File upload uses `multipart/form-data` via POST `/api/resumes/upload`
- Response interceptor unwraps `response.data` automatically

### ResumeList Page
- Fetches list on mount via Vuex action `resume/fetchList`
- Edit button opens an `el-drawer` with CodeMirrorEditor for raw JSON editing
- Save parses editor content as JSON (falls back to wrapping as `{ content }` object)

### Key Conventions
- Vuex modules are namespaced and use `SET_*` mutation naming
- Components use `mapState` for store access
- API functions return unwrapped response data (interceptor handles `.data` extraction)
- Error handling in views uses try/catch with finally — errors shown via interceptor's `Message.error`
