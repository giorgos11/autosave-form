# Autosave Form

A user profile form (personal details + an orderable skills list) that debounces changes to a
server, recovers from failures, and keeps drafts across reloads.

## How to run

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # unit tests (Vitest)
npm run build     # type-check + production build
```

| Script               | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start the Vite dev server            |
| `npm test`           | Run unit tests once                  |
| `npm run test:watch` | Re-run tests on change               |
| `npm run build`      | Type-check and build to `dist/`      |
| `npm run lint`       | Lint the codebase                    |

There is no real backend. [MSW](https://mswjs.io) intercepts `PUT /api/user-profile` in the
browser (also enabled in production builds so the deployed demo works).

### Demo controls

| Trigger | Effect |
| ------- | ------ |
| Email ending in `@fail.test` | Deterministic transient failure (`500` / `503` / network) |
| Email ending in `@conflict.test` | Deterministic `409` (non-retryable) |
| `/?mockErrorRate=0` | Never fail randomly |
| `/?mockErrorRate=1` | Always fail randomly |
| `/?mockLatencyMinMs=1500&mockLatencyMaxMs=3000` | Slow responses |

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
skill reordering trivial (array order is the order). Diff patches would need ordering rules for
list moves.

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
`409`) fail fast with Retry — no blind loop of the same body.

**Drafts in `localStorage`.** Unsynced snapshots survive reload; after a successful save the
draft is kept as synced so hydrate still works without a GET. Trade-off: drafts can contain PII
in plain text on disk (acceptable for this demo; call out for production).

**Accessibility.** Labeled fields with `aria-invalid` / `aria-describedby` / `role="alert"`;
save line uses `role="status"`; skills support keyboard via move buttons and dnd-kit’s keyboard
sensor, with screen-reader drag announcements.

## Trade-offs

| Choice | Trade-off |
| ------ | --------- |
| No GET / server hydrate | Reload relies on `localStorage`, not the API |
| No wire `revision` yet | Client generation is enough with single-flight; true multi-writer conflicts need server versions |
| `localStorage` vs `sessionStorage` | Survives tab close; shared across tabs; stores PII locally |
| Save invalid drafts | Better UX; requires a draft-friendly backend |
| MSW in production builds | Demo works offline; must be disabled for a real API |
| No flush-on-blur/unload yet | Last keystrokes can still sit in the debounce window if the tab dies immediately |

## With more time

1. **Flush lifecycle** — immediate save on blur, submit, `visibilitychange`, and unload
   (`keepalive` fetch).
2. **Skip no-op PUTs** — if the snapshot equals the last confirmed one, do not hit the network.
3. **Versioned save protocol** — client `revision` + `savedAt` response; treat `409` as a first-class
   conflict with clearer UX (reload server state when a GET exists).
4. **Load profile from the API** — then localStorage only for *unsynced* drafts, not as the source
   of truth after a successful save.
5. **Broader tests** — HTTP error mapping, skills domain rules; optional MSW integration tests.
6. **Production hardening** — auth headers, timeouts, clearer conflict copy, draft encryption or
   TTL if PII retention matters.
