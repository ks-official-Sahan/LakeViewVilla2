# Layered database fallback & backup strategy

Based on [Neon](https://neon.com/docs/guides/backup-restore) (primary + PITR/branching) and [Turso/libSQL](https://docs.turso.tech) (serverless-safe SQLite fallback).

## Recommended architecture

| Layer | Role | When to use |
|-------|------|-------------|
| **Neon Postgres** | Primary database + **official backup** (branching, point-in-time restore) | Always in production |
| **Turso / libSQL** | **Operational fallback cache** (remote or embedded replica) | Neon unreachable; works on **Vercel** |
| **Local SQLite file** | Second fallback tier (`better-sqlite3`) | Hostinger / local dev when Turso not configured |
| **JSON file** | Last-resort read/write + **sync queue** | Turso and local SQLite both unavailable |

### What each layer is for

- **Neon backup (disaster recovery):** Use Neon branches and restore-to-timestamp — not something the app emulates. Configure in Neon console / API.
- **Turso (runtime fallback):** A separate libSQL database holding a mirror of critical CMS models. Remote `libsql://` works on serverless; embedded replica (`file:` + `syncUrl`) adds local reads on long-running hosts.
- **Local SQLite:** Same schema as Turso cache, file on disk — good for Hostinger Node apps with persistent disk.
- **JSON:** Emergency snapshot + `fallback_sync_queue.json` for replay to Neon when it recovers.

## Runtime chain (app code)

```
Neon Postgres (DATABASE_URL)
    ↓ circuit breaker open / no DATABASE_URL
Turso/libSQL (TURSO_DATABASE_URL + TURSO_AUTH_TOKEN)
    ↓ unavailable
Local SQLite (data/fallback.db or FALLBACK_SQLITE_PATH)
    ↓ unavailable
JSON (data/fallback_db.json)
```

**Replay queue:** `data/fallback_sync_queue.json` — mutations while offline replay to Neon on recovery.

## Environment variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `DATABASE_URL` | Yes (prod) | dummy URL for offline dev | Neon Postgres |
| `DIRECT_DATABASE_URL` | Migrations | — | Neon direct connection |
| `TURSO_DATABASE_URL` | Fallback tier | — | libsql://… (alias: `LIBSQL_DATABASE_URL`) |
| `TURSO_AUTH_TOKEN` | With Turso URL | — | Turso auth (alias: `LIBSQL_AUTH_TOKEN`) |
| `FALLBACK_LIBSQL_MODE` | No | embedded replica | Set `remote` for remote-only (no local file) |
| `FALLBACK_LIBSQL_LOCAL_PATH` | No | `data/fallback.db` or `/tmp/lakeview-fallback.db` on Vercel | Embedded replica file |
| `FALLBACK_SQLITE_PATH` | No | `data/fallback.db` | Local better-sqlite3 when Turso not configured |

## Deployment guidance

### Vercel + Neon (recommended)

1. Keep `DATABASE_URL` → Neon (primary).
2. Create a **Turso database** for fallback cache only (not a full Prisma schema duplicate).
3. Set `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` in Vercel env.
4. On Vercel, embedded replica uses `/tmp/lakeview-fallback.db` or set `FALLBACK_LIBSQL_MODE=remote` for remote-only.
5. Use **Neon branching/PITR** for backups — not JSON files.

### Hostinger Node (persistent disk)

1. Neon primary + optional Turso for cross-region cache.
2. Without Turso: local `data/fallback.db` via `better-sqlite3` works well.
3. JSON remains last resort.

## Behavior

- Successful Postgres queries do **not** mirror every write to JSON.
- On startup / recovery, a one-time **warm cache** copies critical models from Postgres into Turso/SQLite.
- Circuit breaker opens after 3 consecutive Neon failures (or immediately if no real `DATABASE_URL`).
- When Neon recovers, queued mutations replay and warm cache runs again.

## Mirrored models

`user`, `setting`, `contentBlock`, `blogPost`, `mediaAsset`, `mediaLocation`, `auditLog`

Not mirrored: `session`, `account`, `verificationToken` (Postgres-only).

## Offline testing

1. Stop Neon or set `DATABASE_URL` to the dummy URL in `.env.local`.
2. Ensure Turso vars are set (or rely on local SQLite / JSON).
3. Restart dev server — circuit opens.
4. Confirm reads/writes work; check `fallback_sync_queue.json` after mutations.
5. Restore `DATABASE_URL` — queue drains to Neon.

## Turso setup (one-time)

```bash
# Install Turso CLI, then:
turso db create lakeview-fallback
turso db tokens create lakeview-fallback
# Add libsql:// URL and token to .env.local / Vercel
```

## Neon backup (platform — not app code)

- Branch restore: `neon branches restore …` or Neon API
- Point-in-time restore for disaster recovery
- See https://neon.com/docs/guides/backup-restore
