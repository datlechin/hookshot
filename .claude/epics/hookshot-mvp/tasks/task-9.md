---
name: task-9
title: Frontend embedding and single binary build
status: open
github_issue: 10
github_url: https://github.com/datlechin/hookshot/issues/10
priority: high
estimated_hours: 3
depends_on: [task-6]
created: 2026-01-29T13:58:49Z
updated: 2026-01-30T02:15:13Z
---

# Frontend embedding and single binary build

Configure Rust to embed the compiled frontend (Vite build output) into the binary and serve it via Axum. Set up production build process that creates a single executable with no external dependencies.

## Acceptance Criteria

- [ ] Frontend builds to `frontend/dist/` with production optimizations
- [ ] Rust code uses `include_dir!` macro to embed `frontend/dist/` at compile time
- [ ] Axum serves embedded static files at `/` (index.html, JS, CSS, assets)
- [ ] SPA routing: all non-API/webhook routes serve `index.html`
- [ ] `cargo build --release` produces single binary
- [ ] Binary runs with `./target/release/hookshot` and serves both API and frontend
- [ ] No external file dependencies (frontend fully embedded)
- [ ] Gzip compression for static assets (optional but recommended)
- [ ] Build script automates frontend build before cargo build

## Files to create/modify

- `build.rs` (build script to trigger frontend build)
- `src/main.rs` (serve embedded frontend)
- `src/static_files.rs` (embed and serve logic)
- `Cargo.toml` (add `include_dir` dependency)

## Technical Notes

- Use `include_dir` crate for embedding
- Use `tower_http::services::ServeDir` or custom handler
- Fallback to `index.html` for client-side routing
- Ensure MIME types set correctly
