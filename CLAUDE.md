# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run serve` — Start dev server on port 3001 (proxies `/api` to `http://localhost:8080`)
- `npm run build` — Production build to `dist/`

## Tech Stack

- Vue 2.7 (Options API) + Vue Router 3 + Vuex 3
- Element UI 2.x component library
- Axios for HTTP
- No TypeScript, no test framework, no linter configured

## Project Architecture

```
src/
├── api/             # Axios request wrappers (auth.js, resume.js, request.js)
├── components/      # Reusable components (PdfHtmlEditor.vue)
├── layouts/         # Page layout components (MainLayout.vue with sidebar nav)
├── router/          # Vue Router with route guards (auth redirect + JWT expiry check)
├── store/           # Vuex modules: auth (login/logout/token), resume (CRUD)
├── utils/           # localStorage token helpers (storage.js)
├── views/           # Page components (Login, ResumeList, ResumeUpload, ResumeDetail)
├── App.vue          # Root component with <router-view> + global styles
└── main.js          # Entry point — loads ElementUI, router, store
```

### Auth Flow
- Login sends POST `/api/admin/login`, stores JWT in localStorage, loads into Vuex.
- `router/index.js` beforeEach guard:
  - Checks token existence AND JWT `exp` expiration — expired tokens are cleared automatically.
  - Redirects to `/login` if no valid token on `requiresAuth` routes.
  - Redirects logged-in users away from `/login` to `/`.
- Axios interceptor in `api/request.js`: attaches `Authorization: Bearer <token>`, handles 401 by clearing token and `router.push('/login')` (SPA navigation, not full page reload).
- Token stored in localStorage (see security note in `utils/storage.js` — consider migrating to httpOnly cookies).

### Routing
- `/login` — Login page (no auth required)
- `/` — Main layout with left sidebar, nested children:
  - `/` — ResumeList (table with pagination, "编辑" button navigates to detail page)
  - `/upload` — ResumeUpload (form: name, gender, age, workYears, PDF file + preview)
  - `/resume/:id` — ResumeDetail (rich PDF HTML editor with save)

### API Layer
- Base URL: `/api` (proxied in dev, expects reverse proxy in production)
- All resume CRUD endpoints under `/api/resumes`, login under `/api/admin/login`
- File upload uses `multipart/form-data` via POST `/api/resumes/upload` — do NOT set Content-Type manually, Axios auto-generates the correct boundary with FormData
- Response interceptor unwraps `response.data` automatically
- Endpoints: `getResumeList`, `getResumeDetail`, `updateResume`, `uploadResume`, `getResumePdfContent`

### ResumeDetail Page
- Fetches resume metadata + PDF-converted HTML content on mount
- Uses PdfHtmlEditor component for in-place editing of HTML rendered from pdf2htmlEX
- Editor sanitizes incoming HTML (strips `<script>`/`<noscript>` tags and inline event handlers) before injecting into iframe srcdoc
- Save button detects unchanged content (compares against `originalContent`) and skips request if nothing changed
- Handles gender field as both number (1/2) and string (男/女) for backend compatibility

### PdfHtmlEditor Component
- Renders server-provided HTML inside a sandboxed iframe with `designMode = 'on'` for contentEditable
- Toolbar buttons for bold/italic/underline formatting using `document.execCommand` (deprecated but only practical API as of 2026)
- `getContent()` serializes the live DOM, temporarily removing injected editor styles
- Keyboard shortcuts: Ctrl+B/I/U
- Cleans up on `beforeDestroy` to avoid memory leaks

### Key Conventions
- Vuex modules are namespaced and use `SET_*` mutation naming
- Components use `mapState` for store access
- API functions return unwrapped response data (interceptor handles `.data` extraction)
- Error handling: interceptor shows `Message.error` as primary feedback; views add fallback messages in catch blocks as secondary safety net
- Shared `.page-header` styles live in `App.vue` global styles; view-scoped styles only add differentiating properties
- Use optional chaining (`?.`) and nullish coalescing (`??`) when accessing API response data
- Numeric display: prefer `value != null ? value : 'fallback'` over `value || 'fallback'` to correctly handle `0`
