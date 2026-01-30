---
name: custom-ui-redesign
description: Replace shadcn/ui with custom CSS components for a lightweight, developer-focused webhook testing interface
status: backlog
created: 2026-01-30T04:28:47Z
---

# PRD: Custom UI Redesign

## Executive Summary

Replace the current shadcn/ui component library with a custom, lightweight CSS-based design system optimized for webhook testing. The new UI will be compact, performance-focused, and provide a superior developer experience with reduced bundle size and faster load times.

**Target**: 60% reduction in component-related bundle size, <100ms interaction response time, terminal-inspired aesthetic that feels native to developer workflows.

## Problem Statement

### Current Issues
1. **Bundle bloat**: shadcn/ui components add ~150KB to the bundle despite using only 5-6 components
2. **Over-engineering**: Complex component abstractions (Radix primitives) for simple UI needs
3. **Generic look**: Looks like every other shadcn/ui app, lacks unique identity
4. **Performance**: React component re-renders and unnecessary abstractions slow down real-time updates
5. **Customization friction**: Fighting the design system to achieve desired compact layout

### Why Now?
- Application is still early stage, easier to refactor now than after scale
- Real-time webhook monitoring requires maximum performance
- Developer users prefer functional density over polish
- Current UI already working, low risk to iterate

## User Stories

### Primary Persona: Backend Developer (Alex)
**Context**: Testing webhook integrations during development

**Story 1: Quick Request Inspection**
```
As Alex, I want to see incoming webhook requests immediately in a compact list
So that I can verify my integration is working without scrolling or clicking
```
**Acceptance Criteria**:
- New requests appear within 200ms of receipt
- Request list shows method, path, timestamp, status in single line
- No empty space or decoration, maximum information density
- Color coding for HTTP methods immediately recognizable

**Story 2: Copy Request Data**
```
As Alex, I need to copy headers, body, or curl commands with one click
So that I can quickly reproduce issues or share with teammates
```
**Acceptance Criteria**:
- Copy buttons visible on hover, keyboard accessible
- Toast notification confirms copy success
- Supports copying individual headers, full request, curl command

**Story 3: Filter and Search**
```
As Alex, I want to filter requests by method or search content
So that I can find specific requests in a long list
```
**Acceptance Criteria**:
- Method filter pills inline with request list
- Search highlights matches in real-time
- Filtering doesn't cause layout shift

### Secondary Persona: QA Engineer (Sam)
**Context**: Validating webhook payloads in staging environment

**Story 4: Compare Requests**
```
As Sam, I want to view multiple request details side-by-side
So that I can compare payloads and debug differences
```
**Acceptance Criteria**:
- Request detail modal doesn't block the list
- Can open multiple details in tabs or split view
- Raw JSON formatted and syntax highlighted

## Requirements

### Functional Requirements

**FR1: Core Components (Custom CSS)**
- Request list table (virtual scrolling for 1000+ items)
- Request detail viewer (tabs: headers, body, raw)
- Endpoint card (compact summary with actions)
- Copy button with visual feedback
- Toast notification system
- Filter pills (multi-select)
- Search input with clear action
- Modal/dialog (keyboard accessible)
- Loading states (skeleton, spinner)

**FR2: Design System Foundation**
- CSS custom properties for theming
- Monospace font primary (Geist Mono / JetBrains Mono fallback)
- Terminal-inspired color palette (low saturation, high contrast)
- 8px grid system for spacing
- Compact spacing scale (2/4/8/12/16/24px)

**FR3: Interaction Patterns**
- Keyboard shortcuts (j/k navigation, / for search, ESC to close)
- Hover states reveal actions (copy, delete, expand)
- Click to select/highlight request
- Double-click to open details
- Right-click context menu for advanced actions

**FR4: Real-time Updates**
- WebSocket messages insert at top of list
- Smooth slide-in animation (CSS transform)
- Badge indicator for new requests when scrolled down
- Auto-scroll toggle for live monitoring

### Non-Functional Requirements

**NFR1: Performance**
- Initial page load: <500ms (3G connection)
- Time to interactive: <1s
- Request list render: 60fps with 100+ items visible
- Virtual scrolling for >500 requests
- CSS animations only (no JS-based animations)

**NFR2: Bundle Size**
- Remove shadcn/ui dependencies: -150KB
- Custom CSS: <20KB gzipped
- Total frontend bundle: <200KB (excluding vendor chunks)

**NFR3: Accessibility**
- WCAG 2.1 AA compliant
- Full keyboard navigation
- Screen reader friendly (ARIA labels)
- Focus visible indicators
- Color contrast ratios >4.5:1

**NFR4: Browser Support**
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- Last 2 versions only
- No IE11 support
- CSS features: Grid, Custom Properties, Container Queries

**NFR5: Maintainability**
- Component styles colocated (CSS Modules or scoped styles)
- Design tokens in CSS variables
- Style guide documentation
- Storybook-like component showcase (optional)

## Design Specifications

### Visual Style: "Developer Terminal"

**Color Palette** (Dark mode primary):
```css
--background: #0d1117;      /* GitHub dark bg */
--surface: #161b22;         /* Card background */
--border: #30363d;          /* Subtle borders */
--text-primary: #e6edf3;    /* High contrast text */
--text-secondary: #8b949e;  /* Muted text */
--accent: #58a6ff;          /* Links, focus */
--success: #3fb950;         /* GET, 2xx */
--warning: #d29922;         /* PUT/PATCH, 3xx */
--error: #f85149;           /* DELETE, 4xx/5xx */
--info: #79c0ff;            /* POST, info */
```

**Typography**:
- Primary: `'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace`
- Sizes: 12px (small), 14px (body), 16px (heading), 20px (title)
- Line height: 1.4 (tight, information-dense)
- Weight: 400 (regular), 500 (medium), 600 (semibold)

**Spacing Scale**:
```
xs: 2px   - inline gaps
sm: 4px   - tight elements
md: 8px   - default gap
lg: 12px  - section spacing
xl: 16px  - component padding
2xl: 24px - page sections
```

**Layout**:
- Single column on mobile (<768px)
- Sidebar + main content on desktop (≥768px)
- Maximum content width: 1400px
- Gutter: 16px mobile, 24px desktop

### Component Specifications

**Request List Item**:
```
┌─────────────────────────────────────────────────────────┐
│ GET  /webhook/abc123?foo=bar          12:34:56.789 UTC │
│ ↳ 127.0.0.1 • Content-Type: application/json           │
└─────────────────────────────────────────────────────────┘
  ↑     ↑                                ↑
method  path (truncate with ellipsis)  timestamp
```
- Height: 44px (compact)
- Hover: Background highlight + show action buttons
- Selected: Left border accent color
- Badge: Unread indicator (colored dot)

**Request Detail Modal**:
```
┌─ Request #123 ─────────────────────────────[×]─┐
│ POST /webhook/xyz  •  2026-01-30T12:34:56Z    │
├───────────────────────────────────────────────┤
│ [Headers] [Body] [Raw]                        │
├───────────────────────────────────────────────┤
│                                               │
│ Content-Type: application/json       [Copy]  │
│ User-Agent: curl/8.0.1              [Copy]  │
│ X-Custom-Header: value              [Copy]  │
│                                               │
│                               [Copy All Headers]
└───────────────────────────────────────────────┘
```
- Width: 90vw max 800px
- Backdrop: rgba(0,0,0,0.6)
- Tabs: Underline style, not pill/button
- Code blocks: Syntax highlighting, line numbers

**Filter Pills**:
```
[All] [GET] [POST] [PUT] [DELETE]  🔍 Search...
  ↑     ↑
active  inactive
```
- Pills: Inline-flex, 6px padding, border radius 4px
- Active: Accent background, white text
- Inactive: Transparent, border, muted text
- Hover: Border color intensifies

**Copy Button**:
```
[📋 Copy]  →  [✓ Copied!]
   ↑            ↑
 default    2s feedback
```
- Icon + text on desktop
- Icon only on mobile
- Green checkmark animation on success
- Reverts after 2 seconds

## Success Criteria

### Quantitative Metrics
1. **Performance**
   - Bundle size reduction: >50% (from ~300KB to <150KB)
   - Lighthouse score: 95+ (Performance, Accessibility)
   - First Contentful Paint: <800ms
   - Time to Interactive: <1.2s

2. **User Engagement**
   - Session duration increase: 15%+ (easier to use, users stay longer)
   - Keyboard shortcut usage: >30% of power users
   - Mobile usage retention: 80%+ (currently poor mobile UX)

3. **Developer Satisfaction**
   - Code reduction: -40% component code (simpler maintenance)
   - Faster iteration: 2x faster to add new components
   - Zero accessibility violations (axe-core)

### Qualitative Success
- UI feels "fast and responsive" (user feedback)
- Developers recognize it as "built for developers"
- Unique visual identity (not generic component library look)
- Easier to customize and extend

## Technical Approach

### Phase 1: Foundation (Week 1)
1. **Setup CSS architecture**
   - CSS Modules or scoped styles decision
   - CSS custom properties for theming
   - Typography and color system
   - Reset/normalize styles

2. **Create base components**
   - Button (primary, secondary, ghost, danger)
   - Input (text, search)
   - Badge (status indicator)
   - Toast notification
   - Loading spinner

### Phase 2: Core Components (Week 2)
3. **Request list components**
   - RequestListItem (compact row)
   - VirtualScroll wrapper
   - Filter pills
   - Search bar

4. **Request detail components**
   - Modal/Dialog
   - Tabs component
   - Code block with syntax highlighting
   - Copy button with feedback

### Phase 3: Migration (Week 3)
5. **Replace shadcn components**
   - Remove Dialog → Custom Modal
   - Remove Tabs → Custom Tabs
   - Remove Badge → Custom Badge
   - Remove Button → Custom Button
   - Remove ScrollArea → Custom VirtualScroll

6. **Remove dependencies**
   ```bash
   npm uninstall @radix-ui/react-*
   npm uninstall class-variance-authority
   npm uninstall clsx
   ```

### Phase 4: Polish (Week 4)
7. **Keyboard shortcuts**
   - Global hotkey handler
   - Visual keyboard shortcut hints
   - Help modal with shortcuts

8. **Accessibility audit**
   - axe-core integration
   - Screen reader testing
   - Keyboard navigation testing
   - Focus management

9. **Performance optimization**
   - Virtual scrolling for large lists
   - CSS animations instead of JS
   - Debounced search
   - Lazy load detail views

## Implementation Guidelines

### CSS Architecture
**Option A: CSS Modules (Recommended)**
```tsx
// RequestItem.module.css
.item { ... }
.item:hover { ... }
.item--selected { ... }

// RequestItem.tsx
import styles from './RequestItem.module.css'
<div className={styles.item} />
```

**Option B: Scoped Styles**
```tsx
// RequestItem.tsx
const RequestItem = styled.div`
  padding: var(--spacing-md);
  &:hover { background: var(--surface-hover); }
`
```

**Recommendation**: CSS Modules
- Better tree-shaking
- Explicit dependencies
- No runtime overhead
- Works with Vite/build tools

### Design Tokens (CSS Variables)
```css
:root {
  /* Colors */
  --color-bg-primary: #0d1117;
  --color-bg-secondary: #161b22;
  --color-text-primary: #e6edf3;

  /* Spacing */
  --space-xs: 2px;
  --space-sm: 4px;
  --space-md: 8px;

  /* Typography */
  --font-mono: 'Geist Mono', monospace;
  --text-sm: 12px;
  --text-base: 14px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.2);
  --shadow-md: 0 4px 8px rgba(0,0,0,0.3);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
}

[data-theme="light"] {
  --color-bg-primary: #ffffff;
  --color-text-primary: #1f2328;
  /* ... */
}
```

### Component Example: Button
```tsx
// Button.tsx
import styles from './Button.module.css'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${styles[size]}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

```css
/* Button.module.css */
.btn {
  font-family: var(--font-mono);
  font-size: var(--text-base);
  padding: var(--space-md) var(--space-xl);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.btn:active {
  transform: translateY(0);
}

.primary {
  background: var(--color-accent);
  color: white;
  border-color: var(--color-accent);
}

.secondary {
  background: transparent;
  color: var(--color-text-primary);
}

.ghost {
  background: transparent;
  border-color: transparent;
}

.danger {
  background: var(--color-error);
  color: white;
  border-color: var(--color-error);
}

.sm { padding: var(--space-sm) var(--space-md); font-size: var(--text-sm); }
.md { padding: var(--space-md) var(--space-xl); font-size: var(--text-base); }
.lg { padding: var(--space-lg) var(--space-2xl); font-size: 16px; }
```

## Constraints & Assumptions

### Constraints
1. **Timeline**: 4 weeks ideal, can extend if needed (not blocking other features)
2. **Resources**: Solo developer (you), no dedicated designer
3. **Breaking changes**: Minor UX changes acceptable, maintain core workflows
4. **Browser support**: Modern browsers only, no legacy support needed
5. **Incremental rollout**: Can deploy per-page (start with request list, then details)

### Assumptions
1. Users are technical (developers/QA) - can handle compact, data-dense UI
2. Dark mode is primary theme (light mode secondary)
3. Desktop is primary viewport (mobile responsive but not primary)
4. Tailwind already in use, can keep for utilities (not removing it)
5. Real-time updates are critical (WebSocket must work flawlessly)
6. Copy/paste functionality is heavily used

### Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Accessibility regressions | High | Automated testing (axe-core), manual keyboard testing |
| Performance degradation | Medium | Benchmark before/after, virtual scrolling |
| Increased maintenance burden | Low | Simpler code than shadcn abstractions |
| Visual design inconsistency | Medium | Design tokens, style guide documentation |
| User adaptation time | Low | Familiar patterns, keyboard shortcuts help |

## Out of Scope

**Explicitly NOT included in this PRD:**
1. ❌ New features (request forwarding, rate limiting, etc.) - UI only
2. ❌ Backend changes - purely frontend refactor
3. ❌ WebSocket protocol changes
4. ❌ Authentication/authorization UI
5. ❌ Settings/configuration pages (future phase)
6. ❌ Dark/light mode toggle (dark mode only initially)
7. ❌ Internationalization (English only)
8. ❌ Mobile app (responsive web only)
9. ❌ Custom themes (single theme initially)
10. ❌ Component library publication (internal use only)

**Future Considerations** (post-MVP):
- Light mode theme
- User-customizable colors
- Component library extraction
- Advanced keyboard shortcuts (vim-style)
- Request comparison view
- Saved filters/searches

## Dependencies

### External Dependencies
- **Fonts**: Geist Mono (Vercel) or JetBrains Mono (Google Fonts)
- **Icons**: Lucide React (keeping, minimal overhead)
- **Syntax highlighting**: Prism.js or Shiki (for code blocks)

### Internal Dependencies
- Frontend build process (Vite)
- Current API contracts (no changes)
- WebSocket message format (no changes)
- TypeScript types (update component props)

### Removals
- @radix-ui/react-dialog
- @radix-ui/react-tabs
- @radix-ui/react-scroll-area
- class-variance-authority
- clsx (replace with simple utility)

## Success Metrics Dashboard

### Week 1 Checkpoint
- [ ] CSS architecture setup complete
- [ ] Design tokens defined
- [ ] 5 base components built (Button, Input, Badge, Toast, Spinner)
- [ ] Bundle size baseline measured

### Week 2 Checkpoint
- [ ] Request list component complete
- [ ] Virtual scrolling implemented
- [ ] Filter and search working
- [ ] Performance benchmark passed (60fps)

### Week 3 Checkpoint
- [ ] All shadcn components replaced
- [ ] Dependencies removed
- [ ] Bundle size target met (<150KB)
- [ ] No visual regressions

### Week 4 Checkpoint
- [ ] Keyboard shortcuts implemented
- [ ] Accessibility audit passed (axe-core)
- [ ] Performance optimization complete
- [ ] Documentation updated

### Launch Criteria
- ✅ All shadcn/ui components removed
- ✅ Bundle size <150KB total
- ✅ Lighthouse score 95+ (Performance & A11y)
- ✅ Zero axe-core violations
- ✅ Keyboard navigation fully functional
- ✅ WebSocket updates <200ms latency
- ✅ Mobile responsive (320px+)
- ✅ Dark mode fully themed

## Appendix

### Color Palette Reference
Based on GitHub Dark Dimmed + Terminal aesthetic

**Dark Theme** (Primary):
```
Background:     #0d1117  (Deep space black)
Surface:        #161b22  (Card/panel background)
Surface Hover:  #1c2128  (Hover state)
Border:         #30363d  (Subtle dividers)
Border Focus:   #58a6ff  (Focus/accent)

Text Primary:   #e6edf3  (High contrast white)
Text Secondary: #8b949e  (Muted gray)
Text Tertiary:  #6e7681  (Very muted)

Accent:         #58a6ff  (GitHub blue)
Success:        #3fb950  (Green - GET, success)
Warning:        #d29922  (Yellow - PUT/PATCH)
Error:          #f85149  (Red - DELETE, errors)
Info:           #79c0ff  (Light blue - POST)
```

**Light Theme** (Future):
```
Background:     #ffffff
Surface:        #f6f8fa
Border:         #d0d7de
Text Primary:   #1f2328
Text Secondary: #656d76
Accent:         #0969da
```

### Typography Scale
```
text-xs:   11px / 16px  - Timestamps, metadata
text-sm:   12px / 18px  - Dense tables, secondary text
text-base: 14px / 20px  - Body text, list items
text-lg:   16px / 24px  - Headings, emphasis
text-xl:   20px / 28px  - Page titles
```

### Component Inventory
**To Build** (15 components):
1. Button (4 variants × 3 sizes)
2. Input (text, search)
3. Badge (status, count)
4. Toast (success, error, info)
5. Spinner (inline, full-page)
6. Modal/Dialog
7. Tabs
8. RequestListItem
9. RequestDetail
10. FilterPills
11. CopyButton
12. CodeBlock
13. VirtualScrollContainer
14. SearchInput
15. KeyboardShortcutHint

**Replaced** (shadcn/ui):
- Dialog → Modal
- Tabs → Tabs
- Badge → Badge
- Button → Button
- ScrollArea → VirtualScrollContainer

### Keyboard Shortcuts Map
```
Global:
  /           - Focus search
  ESC         - Close modal/clear search
  ?           - Show keyboard shortcuts

Navigation:
  j / ↓       - Next request
  k / ↑       - Previous request
  Enter       - Open request details
  Space       - Toggle request selection

Actions:
  c           - Copy request
  d           - Delete request
  r           - Refresh list
  f           - Focus filter

Modifiers:
  Cmd/Ctrl+K  - Command palette (future)
  Cmd/Ctrl+F  - Search
```

---

## Next Steps

After PRD approval:
1. Run `/pm:prd-parse custom-ui-redesign` to create implementation epic
2. Break down into tasks with GitHub issues
3. Start with Phase 1 (Foundation) - Week 1
4. Iterate based on feedback

**Estimated Timeline**: 4 weeks full-time, 6-8 weeks part-time
**Risk Level**: Low (non-blocking, incremental rollout possible)
**Impact**: High (better UX, smaller bundle, unique identity)
