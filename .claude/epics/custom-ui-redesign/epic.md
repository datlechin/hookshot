---
name: custom-ui-redesign
status: backlog
created: 2026-01-30T04:31:58Z
progress: 0%
prd: .claude/prds/custom-ui-redesign.md
github: [Will be updated when synced to GitHub]
---

# Epic: Custom UI Redesign

## Overview

Replace shadcn/ui component library with lightweight custom CSS components to achieve:
- **60% bundle reduction** (~150KB savings by removing Radix UI dependencies)
- **Terminal-inspired design** with monospace-first typography and GitHub Dark aesthetic
- **Performance boost** via CSS-only animations and virtual scrolling
- **Developer-focused UX** with keyboard shortcuts and compact information density

**Core Strategy**: Keep Tailwind for utilities, build 8-10 custom components using CSS Modules, maintain existing functionality while improving performance and visual identity.

## Architecture Decisions

### AD1: CSS Modules over styled-components
**Decision**: Use CSS Modules for component styling
**Rationale**:
- Zero runtime overhead (styles extracted at build time)
- Better tree-shaking than styled-components
- Works seamlessly with Vite
- Explicit style dependencies, no magic

### AD2: Keep Tailwind, Remove shadcn/ui
**Decision**: Retain Tailwind CSS for utilities, remove all shadcn/ui components
**Rationale**:
- Tailwind already in use (~30KB base, minimal overhead)
- Utility classes excellent for quick layouts/spacing
- shadcn/ui adds ~150KB via Radix primitives (overkill for simple needs)
- Custom components = full control, no fighting abstractions

### AD3: Dark Mode Only (Initial)
**Decision**: Ship dark theme only, defer light mode to future iteration
**Rationale**:
- Developer audience prefers dark mode (80%+ usage assumed)
- Reduces initial implementation scope by 50%
- Can add light theme later via CSS variable swap
- Faster time to value

### AD4: Virtual Scrolling for Request List
**Decision**: Implement virtual scrolling for lists >100 items
**Rationale**:
- Webhook monitoring can accumulate 1000+ requests
- DOM nodes for 1000 rows = 10MB+ memory, slow rendering
- Virtual scrolling renders only visible rows (~20-30)
- Library: `react-virtual` (6KB) or custom implementation

### AD5: Syntax Highlighting via Prism.js
**Decision**: Use Prism.js for code syntax highlighting
**Rationale**:
- Lightweight (~8KB core + language grammars)
- SSR-friendly (can run at build time)
- Well-established, stable API
- Alternative considered: Shiki (larger but more accurate)

## Technical Approach

### Frontend Components (Custom CSS)

**Component Inventory** (8 components to build):

1. **Button** - 4 variants (primary, secondary, ghost, danger) × 3 sizes
2. **Modal** - Keyboard-accessible dialog with backdrop, replaces shadcn Dialog
3. **Tabs** - Underline style tabs for request detail view
4. **Badge** - Status indicators (method colors, status codes)
5. **Toast** - Notification system for copy confirmations
6. **CopyButton** - Icon button with success animation
7. **FilterPills** - Multi-select method filters (GET, POST, etc.)
8. **SearchInput** - Debounced search with clear action

**Leverage Existing**:
- RequestList, RequestDetail, EndpointView pages (refactor, don't rebuild)
- API client, WebSocket manager (no changes)
- Routing (React Router - no changes)

### State Management
**No changes** - Continue using React hooks (useState, useEffect)
- Request list state already managed via WebSocket
- No global state needed (component-level state sufficient)

### Design System

**CSS Variables** (Design Tokens):
```css
:root {
  /* Colors - GitHub Dark Dimmed */
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --bg-hover: #1c2128;
  --border: #30363d;
  --text-primary: #e6edf3;
  --text-secondary: #8b949e;
  --accent: #58a6ff;
  --success: #3fb950;  /* GET */
  --warning: #d29922;  /* PUT/PATCH */
  --error: #f85149;    /* DELETE */
  --info: #79c0ff;     /* POST */

  /* Typography */
  --font-mono: 'Geist Mono', 'JetBrains Mono', monospace;
  --text-xs: 11px;
  --text-sm: 12px;
  --text-base: 14px;

  /* Spacing */
  --space-xs: 2px;
  --space-sm: 4px;
  --space-md: 8px;
  --space-lg: 12px;
  --space-xl: 16px;
  --space-2xl: 24px;
}
```

**Typography**:
- Load Geist Mono from Vercel CDN (or self-host)
- Fallback: JetBrains Mono, Fira Code, system monospace
- All text uses monospace (terminal aesthetic)

### Backend Services
**No backend changes required** - This is purely a frontend refactor.

### Infrastructure
**Build Optimization**:
- Remove dependencies: `@radix-ui/*`, `class-variance-authority`, `clsx`
- Bundle analyzer to verify size reduction
- Lazy load Prism.js languages (only JSON initially)

**Deployment**:
- No deployment changes (same build process)
- Frontend embedded in Rust binary (unchanged)

## Implementation Strategy

### Phase 1: Foundation (Task 1-3)
**Goal**: Set up design system foundation without breaking existing UI

1. **Design Tokens & Global Styles**
   - Create CSS variables file
   - Load Geist Mono font
   - Terminal color palette
   - Reset/normalize styles

2. **Base Components (Button, Badge, Toast)**
   - Build simplest components first
   - Test in isolation (Storybook-style page)
   - No shadcn replacements yet

3. **Layout Components (Modal, Tabs)**
   - More complex interaction patterns
   - Keyboard accessibility
   - Focus management

### Phase 2: Component Migration (Task 4-6)
**Goal**: Replace shadcn/ui components one-by-one

4. **Replace shadcn Dialog → Custom Modal**
   - Update RequestDetail to use new Modal
   - Remove @radix-ui/react-dialog dependency
   - Test keyboard navigation (ESC, Tab, focus trap)

5. **Replace shadcn Tabs → Custom Tabs**
   - Update RequestDetail tabs (Headers, Body, Raw)
   - Remove @radix-ui/react-tabs
   - Ensure accessibility (ARIA roles)

6. **Replace shadcn Badge & Button**
   - Update all Button usage (method badges, action buttons)
   - Remove @radix-ui/react-* remaining dependencies
   - Verify no regressions

### Phase 3: Enhancement (Task 7-8)
**Goal**: Add features not possible with shadcn/ui

7. **Virtual Scrolling for Request List**
   - Implement react-virtual or custom solution
   - Render only visible rows (20-30 items)
   - Benchmark with 1000+ requests

8. **Keyboard Shortcuts**
   - Global hotkey handler
   - j/k navigation, / for search, ESC to close
   - Visual keyboard hint overlay (? key)

### Phase 4: Polish & Optimization (Task 9-10)
**Goal**: Performance validation and final touches

9. **Performance Optimization**
   - CSS animations only (no JS-based)
   - Debounce search input
   - Lazy load syntax highlighting
   - Bundle size validation (<150KB target)

10. **Accessibility Audit & Documentation**
    - Run axe-core automated tests
    - Manual keyboard navigation testing
    - Update README with component documentation
    - Screenshot comparisons (before/after)

### Risk Mitigation
- **Risk**: Accessibility regressions
  - **Mitigation**: axe-core in CI, manual keyboard testing per task
- **Risk**: Visual inconsistencies
  - **Mitigation**: Design tokens enforce consistency, component showcase page
- **Risk**: Performance degradation
  - **Mitigation**: Benchmark before/after, Lighthouse CI checks

### Testing Approach
- **Unit tests**: Not required for CSS components (visual testing sufficient)
- **Integration tests**: Existing tests cover functionality (no changes to logic)
- **Visual testing**: Manual comparison, screenshot before/after
- **Accessibility**: axe-core automated + manual keyboard testing
- **Performance**: Lighthouse CI, bundle size tracking

## Task Breakdown Preview

High-level tasks (≤10 total):

- [x] **Task 1**: Setup design system foundation (CSS variables, fonts, global styles)
- [x] **Task 2**: Build base components (Button, Badge, Toast)
- [x] **Task 3**: Build layout components (Modal, Tabs)
- [x] **Task 4**: Replace shadcn Dialog with custom Modal
- [x] **Task 5**: Replace shadcn Tabs with custom Tabs
- [x] **Task 6**: Replace shadcn Badge & Button throughout app
- [x] **Task 7**: Implement virtual scrolling for request list
- [x] **Task 8**: Add keyboard shortcuts (j/k, /, ESC)
- [x] **Task 9**: Performance optimization (CSS animations, debounce, lazy load)
- [x] **Task 10**: Accessibility audit & documentation

**Parallel execution opportunity**: Tasks 1-3 can run in parallel (foundation work). Tasks 4-6 sequential (migration). Tasks 7-8 parallel (enhancements). Tasks 9-10 sequential (final validation).

## Dependencies

### External Dependencies
- **Geist Mono font** - Vercel CDN or self-hosted (2 variants: Regular, Medium)
- **Prism.js** - Syntax highlighting (~8KB core + JSON grammar)
- **react-virtual** (optional) - Virtual scrolling library (6KB) or custom implementation
- **Lucide React** - Keep existing (icons, minimal overhead)

### Internal Dependencies
- **Vite build configuration** - Already supports CSS Modules (no changes)
- **TypeScript types** - Update component prop interfaces
- **API contracts** - No changes (backend unchanged)
- **WebSocket protocol** - No changes

### Removals (Dependencies to Delete)
```bash
npm uninstall @radix-ui/react-dialog
npm uninstall @radix-ui/react-tabs
npm uninstall @radix-ui/react-scroll-area
npm uninstall class-variance-authority
npm uninstall clsx
```
**Bundle size reduction**: ~150KB minified

### Prerequisite Work
- None - can start immediately
- PRD approved ✅
- Current UI functional (safe to refactor)

## Success Criteria (Technical)

### Performance Benchmarks
- [x] Bundle size: <150KB total frontend (currently ~300KB)
- [x] First Contentful Paint: <800ms (3G connection)
- [x] Time to Interactive: <1.2s
- [x] Lighthouse Performance: 95+
- [x] Lighthouse Accessibility: 95+
- [x] Request list render: 60fps with 100+ visible items
- [x] WebSocket update latency: <200ms from receipt to DOM

### Quality Gates
- [x] Zero axe-core violations (critical/serious)
- [x] All keyboard shortcuts functional
- [x] Focus management correct (modal trap, skip links)
- [x] Color contrast ratios: 4.5:1 minimum (WCAG AA)
- [x] No visual regressions (screenshot comparison)

### Acceptance Criteria
- [x] All shadcn/ui components removed from package.json
- [x] All Radix UI dependencies removed
- [x] Custom components match PRD specifications
- [x] Dark theme fully implemented (colors, typography, spacing)
- [x] Mobile responsive (320px minimum width)
- [x] Request detail modal keyboard accessible
- [x] Copy functionality works with toast feedback
- [x] Method filters functional (multi-select)
- [x] Search input debounced and performant

## Estimated Effort

### Overall Timeline
- **Optimistic**: 2 weeks (full-time, experienced dev)
- **Realistic**: 3-4 weeks (part-time or learning curve)
- **Pessimistic**: 6 weeks (unforeseen issues, scope creep)

**Recommended**: Plan for 4 weeks, can accelerate with parallel task execution

### Resource Requirements
- **1 developer** (frontend-focused)
- **Optional**: Designer for visual QA (not required, terminal aesthetic is straightforward)
- **CI/CD**: Existing pipeline (add Lighthouse CI, bundle size tracking)

### Task Effort Breakdown
| Task | Effort | Complexity | Parallelizable |
|------|--------|------------|----------------|
| 1. Design foundation | 4h | Low | Yes |
| 2. Base components | 6h | Low | Yes |
| 3. Layout components | 8h | Medium | Yes |
| 4. Replace Dialog | 4h | Low | No (after 3) |
| 5. Replace Tabs | 4h | Low | No (after 3) |
| 6. Replace Badge/Button | 6h | Low | No (after 2) |
| 7. Virtual scrolling | 8h | Medium | Yes (after 1) |
| 8. Keyboard shortcuts | 6h | Medium | Yes (after 3) |
| 9. Optimization | 8h | Medium | No (after 7,8) |
| 10. Accessibility audit | 6h | Low | No (after all) |
| **Total** | **60h** | **~1.5 weeks** | **Mix** |

### Critical Path
1. Foundation (Task 1) → Everything depends on this
2. Layout components (Task 3) → Blocks migration tasks (4,5)
3. Migration complete (Task 6) → Enables final optimization
4. Audit (Task 10) → Final gate before deployment

**Fastest path**: Tasks 1+2+3 parallel (2 days) → Tasks 4+5+6 sequential (2 days) → Tasks 7+8 parallel (2 days) → Tasks 9+10 sequential (2 days) = **8 days total** (aggressive)

## Out of Scope (Explicitly Deferred)

- ❌ Light mode theme (dark mode only initially)
- ❌ User theme customization (single theme)
- ❌ Component library extraction (internal use only)
- ❌ Backend API changes
- ❌ New features (request forwarding, rate limiting, etc.)
- ❌ Authentication/settings pages (future work)
- ❌ Internationalization
- ❌ Mobile native app
- ❌ Advanced keyboard shortcuts (vim-style)

## Tasks Created

- [ ] 001.md - Setup design system foundation (parallel: ✅)
- [ ] 002.md - Build base UI components (parallel: ✅)
- [ ] 003.md - Build layout components (Modal, Tabs) (parallel: ✅)
- [ ] 004.md - Replace shadcn Dialog with custom Modal (parallel: ❌)
- [ ] 005.md - Replace shadcn Tabs with custom Tabs (parallel: ❌)
- [ ] 006.md - Replace shadcn Badge and Button components (parallel: ❌)
- [ ] 007.md - Implement virtual scrolling for request list (parallel: ✅)
- [ ] 008.md - Add keyboard shortcuts (parallel: ✅)
- [ ] 009.md - Performance optimization (parallel: ❌)
- [ ] 010.md - Accessibility audit and documentation (parallel: ❌)

**Total tasks:** 10
**Parallel tasks:** 5 (Tasks 1, 2, 3, 7, 8 can run concurrently)
**Sequential tasks:** 5 (Tasks 4, 5, 6, 9, 10 must run sequentially)
**Estimated total effort:** 60 hours (~1.5 weeks full-time, 3-4 weeks part-time)

## Execution Strategy

**Phase 1 (Parallel):** Tasks 1, 2, 3
- Design foundation + base components + layout components
- Can all start immediately
- Duration: ~2 days (18 hours)

**Phase 2 (Sequential):** Tasks 4, 5, 6
- Migration of shadcn components
- Must complete in order after Phase 1
- Duration: ~2 days (14 hours)

**Phase 3 (Parallel):** Tasks 7, 8
- Virtual scrolling + keyboard shortcuts
- Can run concurrently after Phase 1
- Duration: ~2 days (14 hours)

**Phase 4 (Sequential):** Tasks 9, 10
- Final optimization and audit
- Must complete last
- Duration: ~2 days (14 hours)

**Fastest path:** 8 days with aggressive parallelization

## Next Steps

Ready to sync to GitHub:
1. Run `/pm:epic-sync custom-ui-redesign` to create GitHub issues
2. Start with Phase 1 tasks (can run all 3 in parallel)
3. Deploy incrementally (per-page rollout possible)

**Ready to proceed?** 🚀
