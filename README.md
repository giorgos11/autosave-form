# Autosave Form

A user profile form (personal details + an orderable skills list) that saves its changes to a server.

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
```

| Script            | Description                     |
| ----------------- | ------------------------------- |
| `npm run dev`     | Start the dev server            |
| `npm run build`   | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build      |
| `npm run lint`    | Lint the codebase               |

## Environment variables

Configured in `.env` (committed, shared by `dev` and `build`). Override locally in `.env.local`
(git-ignored), or per deployment through the hosting provider's environment settings.

| Variable                   | Default | Description                                        |
| -------------------------- | ------- | -------------------------------------------------- |
| `VITE_API_BASE_URL`        | `/api`  | Base URL for API requests                          |
| `VITE_ENABLE_MOCKS`        | `true`  | Serve API responses from MSW instead of a real API |
| `VITE_MOCK_ERROR_RATE`     | `0.2`   | Probability (0–1) that a mocked request fails      |
| `VITE_MOCK_LATENCY_MIN_MS` | `300`   | Minimum mocked response latency in ms              |
| `VITE_MOCK_LATENCY_MAX_MS` | `800`   | Maximum mocked response latency in ms              |

`VITE_*` variables are inlined into the client bundle at build time: they are public, so never
put secrets in them, and changing them requires a rebuild.

## Mock server

There is no real backend yet. API calls are answered by [MSW](https://mswjs.io), which intercepts
requests at the network level through a Service Worker. The app's real HTTP client runs unchanged
(serialization, status handling, errors); only the response comes from the mock.

| Endpoint                | Success | Failure                                           |
| ----------------------- | ------- | ------------------------------------------------- |
| `PUT /api/user-profile` | `204`   | `500`, `503` or a network error (picked randomly) |

Every response is delayed by a random latency between `VITE_MOCK_LATENCY_MIN_MS` and
`VITE_MOCK_LATENCY_MAX_MS` (300–800 ms by default). A request fails when:

- a random draw falls under `VITE_MOCK_ERROR_RATE` (20% by default), or
- the submitted email ends with `@fail.test` — a deterministic trigger for demos.

The behaviour can be changed **without rebuilding** through URL query parameters, which take
precedence over the env variables:

```
/?mockErrorRate=0          # never fail
/?mockErrorRate=1          # always fail
/?mockErrorRate=0.5&mockLatencyMinMs=1500&mockLatencyMaxMs=3000   # flaky and slow
```

Handlers and their config live in `src/features/user-profile/infrastructure/mocks/`. Mocking is
started in `src/main.tsx` before the app renders.

Mocks are currently **enabled in production builds too**, so the deployed site works without a
backend.

## Architecture

Feature-first, with clean-architecture layers inside each feature:

```
src/
├── app/                 # composition root: wiring, global styles, (later) providers and routing
├── features/
│   └── user-profile/
│       ├── domain/          # entities, business rules, ports — pure TypeScript
│       ├── application/     # use cases (orchestrate domain through ports)
│       ├── infrastructure/  # adapters implementing ports (HTTP, mocks)
│       └── presentation/    # React pages, components, hooks
└── shared/              # feature-agnostic code (HTTP client, config, utilities)
```

- Dependencies point inwards: `presentation`/`infrastructure` → `application` → `domain`.
- `app/composition-root.ts` is the only place that chooses concrete implementations
  (e.g. the HTTP repository) and wires them to use cases.
- Other code imports a feature only through its public API (`src/features/<feature>/index.ts`).
- Imports: relative for close neighbours (max two levels up), `@/…` otherwise.

## Decisions

### Mock server: MSW

Options considered: a small Node/Express server, a fake `fetch` wrapper, or MSW.

- **Chosen: MSW.** It intercepts at the network level, so the real HTTP client, status handling
  and error mapping run exactly as they would against a real API, and requests are visible in the
  browser's network panel. No extra process, port, proxy or CORS setup.
- The same handlers can be reused in tests (`msw/node`), so the error handling is tested against
  the same behaviour that is demoed.
- A fake `fetch` wrapper was rejected because it bypasses the layer whose behaviour we want to
  demonstrate. A Node server would work but adds setup without adding value for a mock.
- Latency and error rate are configurable (env + URL), so failures can be demoed on demand.

### Mock enabled in production builds (for now)

There is no real backend, so mocks ship with the build to keep the deployed demo functional.
Switching to a real API is a configuration change — see [Going to production](#going-to-production).

### Save protocol

> **Status:** designed, implementation in progress. The UI does not send requests yet.

**What is sent — a full snapshot.** `PUT /api/user-profile` with the whole profile.

- The payload is small (a handful of fields and a short list), so diffing buys little.
- A full-state `PUT` is **idempotent**: retrying it is always safe, which keeps error handling
  simple. Field-level `PATCH`es would need ordering guarantees, and reordering skills is awkward to
  express as a patch.
- Each request will carry a client-side, monotonically increasing `revision`, so responses can be
  matched to the state they confirm.

**How often — debounced.**

- Save ~800 ms after the user stops editing, instead of on every keystroke.
- Flush immediately on blur/submit and before the page unloads, so the last edit is not lost.
- Skip the request if nothing changed since the last confirmed save.

**Concurrency — one request in flight, latest wins.**

- With random 300–800 ms latency, responses can arrive out of order. To avoid an older response
  overwriting the status of a newer change, only one save runs at a time.
- Edits made while a save is in flight mark the form as dirty; when the save completes, the latest
  snapshot is sent once (intermediate states are coalesced).
- Responses for a revision older than the latest acknowledged one are ignored.

**Error handling.**

- `5xx` and network errors are treated as transient: retry with exponential backoff
  (e.g. 1 s → 2 s → 4 s), capped at a few attempts.
- `4xx` errors are not retried: the request itself is wrong and would fail again.
- Unsaved changes are never discarded on failure. The user sees the save status
  (`Saving…` / `Saved` / `Couldn't save — Retry`) and can retry manually after retries run out.

**Where it lives.** The autosave policy (debounce, coalescing, revisions, retries, status) is a
framework-agnostic service in `application/`, unit-testable with fake timers. A thin React hook in
`presentation/` connects it to the form.

### Open questions

- **Saving invalid drafts.** Autosave could persist drafts even when validation fails (common for
  long forms), or only valid snapshots. To be decided with product; the protocol supports both.
- **State management.** Local React state is enough today. A library (e.g. TanStack Query for
  server state) will be introduced only when there is a concrete need.

## Going to production

When a real backend is available:

1. **Point to the API.** Set `VITE_API_BASE_URL` to the backend URL (e.g. `https://api.example.com`)
   in the production environment. If it is on another origin, the backend must allow it via CORS.
2. **Disable mocks.** Set `VITE_ENABLE_MOCKS=false` for production builds — either in a
   `.env.production` file or in the hosting provider's build environment. With mocks disabled,
   MSW, the handlers and `mockServiceWorker.js` are excluded from the bundle entirely.
3. **Keep mocks where they are useful.** Leave them enabled for local development
   (`.env.development`) and reuse the same handlers in tests via `msw/node`.
4. **Clean up the Service Worker.** Browsers that visited the mocked site keep the worker
   registered. MSW only intercepts when the app activates it, so it becomes inert, but you can
   unregister it explicitly on startup if you want a clean state.
5. **Adapt the contract.** If the real API differs from the mock, change only
   `infrastructure/http/` (DTO, mapper, endpoints). Domain, use cases and UI stay untouched.
6. **Production concerns to add with the real API:** authentication (headers/interceptors in
   `shared/api/http-client.ts`), request timeouts, error reporting/monitoring, and retry policies
   tuned to the backend's semantics.
