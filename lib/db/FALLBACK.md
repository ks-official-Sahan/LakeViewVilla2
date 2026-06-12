# Layered database fallback

## Chain

1. **Primary** — Neon Postgres via Prisma (`DATABASE_URL`)
2. **First fallback** — SQLite file (`data/fallback.db`, override with `FALLBACK_SQLITE_PATH`)
3. **Second fallback** — JSON file (`data/fallback_db.json`)
4. **Replay queue** — `data/fallback_sync_queue.json` (mutations while offline)

## Behavior

- Successful Postgres queries do **not** mirror every write to JSON.
- On startup / recovery, a one-time **warm cache** copies critical models from Postgres into SQLite.
- When the circuit breaker opens (3 consecutive failures or no `DATABASE_URL`), reads and writes route to SQLite; JSON is used only if SQLite is unavailable.
- On first SQLite use, existing JSON data is hydrated into SQLite if the DB file is empty.
- When Postgres recovers, queued mutations replay to Neon and the warm cache runs again.

## Environment

| Variable | Required | Default |
|----------|----------|---------|
| `DATABASE_URL` | Yes (production) | dummy URL for offline dev |
| `FALLBACK_SQLITE_PATH` | No | `data/fallback.db` |

## Offline testing

1. Stop Postgres or set `DATABASE_URL` to the dummy URL in `.env.local`.
2. Restart the dev server — circuit opens immediately or after 3 failed queries.
3. Confirm `data/fallback.db` is created and admin/site reads still work.
4. Make a mutation — check `data/fallback_sync_queue.json` for queued ops.
5. Restore a valid `DATABASE_URL` and reload — queue should drain to Neon.

## Mirrored models

`user`, `setting`, `contentBlock`, `blogPost`, `mediaAsset`, `mediaLocation`, `auditLog`

Not mirrored: `session`, `account`, `verificationToken`, `sync_queue` (Postgres-only).
