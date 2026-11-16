# Autosave Form

A user profile form (personal details + an orderable skills list) that debounces changes to a
server, recovers from failures, and keeps drafts across reloads.

**Live demo:** https://autosave-form-two.vercel.app/

## How to run

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # unit tests (Vitest)
npm run build     # type-check + production build
```

| Script                 | Description                     |
| ---------------------- | ------------------------------- |
| `npm run dev`          | Start the Vite dev server       |
| `npm test`             | Run unit tests once             |
| `npm run test:watch`   | Re-run tests on change          |
| `npm run build`        | Type-check and build to `dist/` |
| `npm run lint`         | Lint the codebase               |
| `npm run format`       | Format with Prettier            |
| `npm run format:check` | Check formatting (used in CI)   |

There is no real backend. [MSW](https://mswjs.io) intercepts `GET` / `PUT /api/user-profile` in the
browser (also enabled in production builds so the deployed demo works). Successful PUTs update an
in-memory server profile that GET returns — groundwork for conflict reload.

### Demo controls

| Trigger                                         | Effect                                                                                                                            |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Email ending in `@fail.test`                    | Deterministic transient failure (`500` / `503` / network)                                                                         |
| Email ending in `@conflict.test`                | One-shot concurrent race (`409` + revision bump); **Keep mine** / **Use theirs** then work. Change email away and back to re-arm. |
| `/?mockErrorRate=0`                             | Never fail randomly                                                                                                               |
| `/?mockErrorRate=1`                             | Always fail randomly                                                                                                              |
| `/?mockLatencyMinMs=1500&mockLatencyMaxMs=3000` | Slow responses                                                                                                                    |

Defaults (`VITE_*` in `.env`): ~20% random errors, 300–800 ms latency. Query params override
env without a rebuild.

## Architecture

Feature-first clean architecture inside `user-profile`:

```
domain/          entities, validation, ports, domain errors
application/     save use case + framework-agnostic autosave store
infrastructure/  HTTP repository, localStorage draft store, MSW
presentation/    page, hooks, FormField / SkillsList / SaveStatus
```

`app/composition-root.ts` wires concrete adapters into the feature. Autosave policy lives outside
React so it can be unit-tested with fake timers; `SaveStatus` subscribes with
`useSyncExternalStore` so status ticks do not re-render the whole form.

## Key design decisions

**Full-snapshot `PUT`, not PATCH.** The payload is small; a full replace is idempotent and makes
skill reordering trivial (array order is the order). The body is `{ revision, profile }`; the
server increments `revision` on success (starts at `0`). A mismatched revision returns `409`.

JSON Patch would help if the form grew large or saves became chatty: send only changed paths
(same resource, `PATCH` + revision — not a separate service). Skills are the awkward part —
`/skills/1` is index-based and breaks under reorder/concurrency, so a practical patch would
`replace` whole `/skills` when the list changes (or use id-aware ops). Kept as a next step.

**Local-first form + debounced autosave.** Field state updates immediately. Saves fire ~500 ms
after typing stops. Only one request runs at a time; edits during a save are coalesced and the
latest snapshot is sent when the in-flight request finishes (avoids out-of-order status).

**Invalid drafts still save.** Validation is progressive (show on blur, live while touched) and
does not block autosave — losing half-filled input is worse than storing an incomplete profile.
The backend must treat these as drafts.

**Skills order = array position.** Stable `id`s identify rows; `moveSkill` / drag-and-drop /
↑↓ buttons reorder the list. The ordered array is what the server receives.

**Errors classified at the HTTP edge.** The repository maps transport failures to
`SaveUserProfileError` with a `retryable` flag. Transient failures (`5xx`, `408`, `429`, network)
get exponential backoff (1s → 2s → 4s); then a manual **Retry**. Non-retryable rejects (e.g.
generic client errors) fail fast with Retry. **`409` is conflict**: autosave pauses and local
edits are kept. Resolve with **Keep mine** (GET revision, re-PUT local) or **Use theirs**
(GET document into the form).

**Drafts in `localStorage`.** Unsynced snapshots survive reload; after a successful save the
draft is kept as synced so hydrate still works without a GET. Trade-off: drafts can contain PII
in plain text on disk (acceptable for this demo; call out for production).

**Accessibility.** Labeled fields with `aria-invalid` / `aria-describedby` / `role="alert"`;
save line uses `role="status"`; skills support keyboard via move buttons and dnd-kit’s keyboard
sensor, with screen-reader drag announcements.

## Trade-offs

| Choice                                     | Trade-off                                                                                                                           |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| GET exists; form still hydrates from draft | `get` is wired for later conflict/load; UI still prefers `localStorage` on boot                                                     |
| Document `revision` + conflict resolve     | `409` pauses autosave; **Keep mine** rebases, **Use theirs** loads GET                                                              |
| `localStorage` vs `sessionStorage`         | Survives tab close; shared across tabs; stores PII locally                                                                          |
| Save invalid drafts                        | Better UX; requires a draft-friendly backend                                                                                        |
| MSW in production builds                   | Demo works offline; must be disabled for a real API                                                                                 |
| No flush-on-blur/unload yet                | Last keystrokes can still sit in the debounce window if the tab dies immediately                                                    |
| Meta + `robots.txt` / one-URL sitemap      | Share cards and crawl basics for a demo SPA; a sitemap does not create indexable content — real multi-route apps need SSR/prerender |

## With more time

1. **Flush lifecycle** — immediate save on blur, submit, `visibilitychange`, and unload
   (`keepalive` fetch).
2. **Skip no-op saves** — if the snapshot equals the last confirmed one, do not hit the network.
3. **JSON Patch** — when the document is large: diff against last confirmed snapshot, `PATCH` with
   revision; replace `/skills` as a unit (avoid fragile `/skills/n` indexes).
4. ~~**Versioned save protocol**~~ — done (`revision` + conflict Keep mine / Use theirs).
5. **Load profile from the API on boot** — then localStorage only for _unsynced_ drafts.
6. **Broader tests** — HTTP error mapping, skills domain rules; optional MSW integration tests.
7. **Production hardening** — auth headers, timeouts, clearer conflict copy, draft encryption or
   TTL if PII retention matters.
