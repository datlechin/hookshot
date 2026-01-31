# Release Guide

This document explains the automated release and deployment workflow for Hookshot.

## Overview

Hookshot uses automated workflows for:
1. **Installation Script** - One-line installer for end users
2. **Changelog Automation** - Auto-generated from commits and PRs
3. **Multi-platform Releases** - Automatic binary builds for all platforms
4. **GitHub Releases** - Automated release creation with artifacts

## Creating a Release

### 1. Prepare the Release

```bash
# Ensure all changes are committed
git status

# Update version in Cargo.toml if needed
# (optional - releases use git tags)
```

### 2. Create and Push Tag

```bash
# Create a version tag (semantic versioning)
git tag v0.1.0

# Push the tag to GitHub
git push origin v0.1.0
```

### 3. Automatic Workflow

Once the tag is pushed, GitHub Actions will automatically:

1. **Build binaries** for all platforms:
   - macOS Intel (x86_64)
   - macOS Apple Silicon (ARM64)
   - Linux x86_64
   - Linux ARM64
   - Windows x86_64

2. **Generate changelog** from commits since last release:
   - Groups changes by type (features, fixes, docs, etc.)
   - Extracts from conventional commit messages
   - Links to PRs and contributors

3. **Create GitHub Release**:
   - Formatted release notes with changelog
   - All platform binaries attached
   - SHA256 checksums for verification
   - Installation instructions included

4. **Update `latest` tag** for easy access to newest version

### 4. Verify Release

After the workflow completes:

1. Check [Releases page](https://github.com/datlechin/hookshot/releases)
2. Verify all 5 platform binaries are attached
3. Test installation script:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/datlechin/hookshot/main/install.sh | sh
   ```

## Commit Message Format

For proper changelog generation, use conventional commits:

### Commit Types

| Type | Changelog Section | Use When |
|------|------------------|----------|
| `feat:` | 🎉 New Features | Adding new functionality |
| `fix:` | 🐛 Bug Fixes | Fixing bugs |
| `docs:` | 📚 Documentation | Documentation only changes |
| `perf:` | ⚡ Performance | Performance improvements |
| `security:` | 🔒 Security | Security fixes |
| `chore:` | 🔧 Maintenance | Dependencies, tooling, etc. |
| `refactor:` | 🔧 Maintenance | Code refactoring |

### Examples

```bash
# Good commit messages (appear in changelog)
git commit -m "feat: Add request replay functionality"
git commit -m "fix: Resolve WebSocket connection timeout"
git commit -m "perf: Optimize database query performance"
git commit -m "docs: Update API documentation"

# These will be grouped under "Uncategorized"
git commit -m "Update README"
git commit -m "WIP: Testing new feature"
```

### Multi-line Commits

For detailed changes, add a body:

```bash
git commit -m "feat: Add request forwarding

This change adds the ability to forward incoming webhooks to
external URLs for testing.

- Configurable forward URL per endpoint
- Supports all HTTP methods
- Includes original headers and body
- Logs forwarding success/failure

Closes #42"
```

## Release Checklist

Before creating a release:

- [ ] All tests pass (`cargo test`)
- [ ] No clippy warnings (`cargo clippy`)
- [ ] Frontend builds successfully
- [ ] CI workflow is green on main branch
- [ ] CHANGELOG.md is up to date (auto-generated, but verify)
- [ ] README.md reflects new features
- [ ] Version number follows [semantic versioning](https://semver.org/)

## Hotfix Releases

For urgent fixes:

```bash
# Create hotfix branch from tag
git checkout -b hotfix/v0.1.1 v0.1.0

# Make fix
git commit -m "fix: Critical security vulnerability in webhook handler"

# Merge back to main
git checkout main
git merge hotfix/v0.1.1

# Tag and release
git tag v0.1.1
git push origin v0.1.1
git push origin main
```

## Pre-releases

For beta/RC versions:

```bash
# Use pre-release tag format
git tag v0.2.0-beta.1
git push origin v0.2.0-beta.1

# The release will be marked as "Pre-release" on GitHub
# (automatic based on tag format)
```

## Troubleshooting

### Build Fails on a Platform

1. Check the [Actions tab](https://github.com/datlechin/hookshot/actions)
2. Click on the failed workflow run
3. Expand the failed job to see error details
4. Common issues:
   - Frontend build failure → Check `build.rs` and `npm run build`
   - Cross-compilation failure → Check platform-specific setup steps
   - Missing dependencies → Update workflow dependencies

### Changelog is Empty

1. Verify commits use conventional format (`feat:`, `fix:`, etc.)
2. Check `.github/release-changelog-config.json`
3. Ensure commits are between the previous tag and current tag

### Installation Script Fails

1. Verify the release has completed successfully
2. Check that all binaries are attached to the release
3. Test manually downloading the binary for the platform
4. Check install script detects platform correctly

## Manual Release (Fallback)

If automated workflow fails:

```bash
# Build for your platform
cargo build --release

# Create release manually on GitHub
# Upload binary manually
```

## Post-Release Tasks

After a successful release:

1. Announce on social media / Discord / etc.
2. Update any deployment documentation
3. Monitor issue tracker for bug reports
4. Prepare changelog for next release

## Versioning Strategy

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (v1.0.0 → v2.0.0): Breaking API changes
- **MINOR** (v0.1.0 → v0.2.0): New features, backwards compatible
- **PATCH** (v0.1.0 → v0.1.1): Bug fixes, backwards compatible

### Pre-1.0.0 Releases

Before v1.0.0, we use:
- v0.x.0 for feature releases
- v0.x.y for bug fixes
- Breaking changes are allowed in minor versions

## Installation Script

The `install.sh` script:
- Auto-detects OS and architecture
- Downloads latest release binary
- Verifies SHA256 checksum
- Installs to `~/.local/bin` by default
- Works on macOS and Linux
- Provides clear error messages

### Custom Install Location

```bash
# Install to custom directory
INSTALL_DIR=/usr/local/bin curl -fsSL https://raw.githubusercontent.com/datlechin/hookshot/main/install.sh | sh
```

### Testing Install Script

Before releasing, test the install script:

```bash
# Test locally (will try to download from GitHub)
./install.sh

# Test from raw GitHub URL (after pushing to main)
curl -fsSL https://raw.githubusercontent.com/datlechin/hookshot/main/install.sh | sh
```

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- [GitHub Actions](https://docs.github.com/en/actions)
