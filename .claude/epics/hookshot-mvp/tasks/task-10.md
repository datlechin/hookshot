---
name: task-10
title: Documentation, CI/CD, and cross-platform release builds
status: open
github_issue: 11
github_url: https://github.com/datlechin/hookshot/issues/11
priority: medium
estimated_hours: 4
depends_on: [task-9]
created: 2026-01-29T13:58:51Z
updated: 2026-01-30T02:15:13Z
---

# Documentation, CI/CD, and cross-platform release builds

Write comprehensive README with quick start guide, set up GitHub Actions for automated testing and cross-platform release builds (macOS, Linux x86_64/ARM64, Windows), and prepare for initial release.

## Acceptance Criteria

- [ ] README.md with: project description, features, quick start (download + run), usage guide, build from source instructions
- [ ] Architecture documentation (brief overview of tech stack)
- [ ] GitHub Actions workflow for: cargo test, cargo build, frontend build
- [ ] Cross-platform release builds: macOS x86_64/ARM64, Linux x86_64/ARM64, Windows x86_64
- [ ] Release artifacts uploaded to GitHub Releases on tag push
- [ ] Binary naming convention: `hookshot-{version}-{platform}-{arch}`
- [ ] LICENSE file (MIT or Apache-2.0)
- [ ] CHANGELOG.md started with v0.1.0 entry
- [ ] Basic usage examples in README (curl commands for webhook testing)
- [ ] Contributing guidelines (optional)

## Files to create

- `README.md`
- `LICENSE`
- `CHANGELOG.md`
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `docs/ARCHITECTURE.md` (optional)

## Technical Notes

- Use `cargo-zigbuild` or cross-compilation for multiple targets
- GitHub Actions matrix strategy for parallel builds
- Cache cargo dependencies to speed up CI
- Automated tests run on PR and main branch pushes
