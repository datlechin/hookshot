# Contributing to Hookshot

Thank you for your interest in contributing to Hookshot! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and collaborative. We're all here to build something great together.

## Getting Started

### Prerequisites

- Rust 1.70+ ([rustup.rs](https://rustup.rs))
- Node.js 18+ and npm
- Git

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/datlechin/hookshot.git
   cd hookshot
   ```

3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/hookshot.git
   ```

4. Install dependencies and run:
   ```bash
   # Backend
   cargo run

   # Frontend (in another terminal)
   cd frontend
   npm install
   npm run dev
   ```

## Development Workflow

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our code style guidelines

3. Test your changes:
   ```bash
   # Run backend tests
   cargo test

   # Run frontend tests (if applicable)
   cd frontend
   npm test
   ```

4. Commit your changes:
   ```bash
   git commit -m "Add feature: description of your feature"
   ```

### Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) format for automatic changelog generation.

**Format:** `<type>: <description>`

**Types:**
- `feat:` - New feature (appears in changelog under "🎉 New Features")
- `fix:` - Bug fix (appears in changelog under "🐛 Bug Fixes")
- `docs:` - Documentation changes (appears under "📚 Documentation")
- `perf:` - Performance improvements (appears under "⚡ Performance")
- `security:` - Security fixes (appears under "🔒 Security")
- `chore:` - Maintenance tasks (appears under "🔧 Maintenance")
- `refactor:` - Code refactoring (appears under "🔧 Maintenance")
- `test:` - Adding or updating tests
- `style:` - Code formatting (no functional changes)

**Examples:**
```bash
feat: Add WebSocket support for real-time updates
fix: Resolve memory leak in request handler
docs: Update installation instructions
perf: Optimize database queries for large datasets
security: Sanitize user input to prevent XSS
chore: Update dependencies to latest versions
```

**Tips:**
- Use present tense ("Add feature" not "Added feature")
- Keep first line under 72 characters
- Reference issues when applicable (`fix: #123 - Resolve connection timeout`)
- Add detailed description in commit body if needed

Your commit messages directly affect the automatically generated changelog!

### Submitting Changes

1. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a Pull Request on GitHub:
   - Use a clear, descriptive title
   - Describe what changes you made and why
   - Reference any related issues
   - Include screenshots for UI changes

3. Wait for review:
   - Address any feedback from maintainers
   - Make requested changes in new commits
   - Push updates to your PR branch

## Code Style

### Rust

- Follow [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- Run `cargo fmt` before committing
- Run `cargo clippy` and fix warnings
- Add documentation comments for public APIs
- Write tests for new functionality

### TypeScript/React

- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use TypeScript for type safety
- Use functional components with hooks
- Keep components small and focused
- Add JSDoc comments for complex functions

### General

- Keep lines under 100 characters when possible
- Use meaningful variable and function names
- Add comments for complex logic
- Remove unused imports and code
- Test your changes thoroughly

## Testing

### Backend Tests

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_name

# Run with output
cargo test -- --nocapture
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Manual Testing

1. Build and run the application
2. Test the specific feature you modified
3. Test related features to ensure nothing broke
4. Test on different browsers (Chrome, Firefox, Safari)
5. Test edge cases and error conditions

## Project Structure

```
hookshot/
├── src/                    # Rust backend source
│   ├── db/                 # Database layer
│   ├── handlers/           # HTTP handlers
│   ├── models/             # Data models
│   ├── services/           # Business logic
│   ├── websocket/          # WebSocket server
│   └── main.rs             # Application entry
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # API client, utilities
│   │   └── types/          # TypeScript types
│   └── package.json
├── migrations/             # Database migrations
├── tests/                  # Integration tests
└── build.rs                # Build script
```

## Documentation

### Code Documentation

- Add doc comments (`///`) for all public Rust functions and types
- Add JSDoc comments for complex TypeScript functions
- Update README.md if you add new features
- Update API documentation if you change endpoints

### Architecture Documentation

- Update `docs/ARCHITECTURE.md` for significant architectural changes
- Document design decisions and tradeoffs
- Add diagrams if helpful

## Pull Request Checklist

Before submitting your PR, make sure:

- [ ] Code follows project style guidelines
- [ ] All tests pass (`cargo test`)
- [ ] No `cargo clippy` warnings
- [ ] Code is formatted (`cargo fmt`)
- [ ] Documentation is updated
- [ ] Commit messages are clear and descriptive
- [ ] PR description explains what and why
- [ ] Screenshots included for UI changes

## Feature Requests and Bug Reports

### Reporting Bugs

Open an issue with:
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- System information (OS, Rust version, browser)
- Screenshots or error messages if applicable

### Requesting Features

Open an issue with:
- Clear description of the feature
- Use case and motivation
- Proposed implementation (if you have ideas)
- Willingness to contribute

## Questions?

- Open a GitHub issue with the `question` label
- Check existing issues and discussions first
- Be specific and provide context

## License

By contributing to Hookshot, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Hookshot! 🎯
