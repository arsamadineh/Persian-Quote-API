# L8 — Distribution (`dist/`, Docker, deploy docs) · class S · mode: normal or teamwork lane
Read `_COMMON.md`. Make adoption trivial for a university IT desk, including offline and restricted networks.
1. **Single-file server:** `bun build --compile` → `pq-server` for linux-x64, windows-x64, macos-arm64 embedding API + workbench + data pack. Flags: `--port`, `--data <file>` (replace the data pack without rebuilding), `--offline`, `--cors <origin>`. Print SHA-256 checksums. Note in the docs that unsigned Windows binaries may trigger SmartScreen/antivirus warnings and how to verify the checksum.
2. Keep `Dockerfile` (distroless multi-stage, healthcheck) and `docker-compose.yml` working; add nginx example.
3. **Static bundle** of the workbench: works from any web server, an intranet share, or a USB stick (relative paths, no absolute URLs).
4. **`docs/DEPLOY.fa.md`** (Persian, one page): requirements, ports, running offline, updating the data pack (replace one file), backup, how to verify checksums, troubleshooting.
5. **Mirror manifest:** `/.well-known/pq-endpoints.json` listing base URLs in priority order; the SDK failover already reads it.
6. Measure and record once: binary sizes, cold start to first `/v1/health`, one 20 s `oha` run (single line). Do not deploy anything.
**Done (T1):** each binary you can run starts, answers `/v1/health`, serves the workbench; platforms you cannot run are marked "not run".
