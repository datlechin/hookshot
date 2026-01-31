# Testing Guide

Comprehensive testing checklist for Hookshot frontend across browsers and devices.

## Quick Test

For quick smoke testing:

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Basic flow:**
   - [ ] App loads without errors
   - [ ] Can create a new endpoint
   - [ ] Endpoint URL is displayed
   - [ ] Can send a test webhook (using curl or Postman)
   - [ ] Request appears in the list
   - [ ] Request details show correctly
   - [ ] WebSocket indicator shows "Connected"

## Full Cross-Browser Testing

### Setup

1. **Build for production:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Open in each browser:**
   - Chrome: http://localhost:4173
   - Firefox: http://localhost:4173
   - Safari: http://localhost:4173
   - Edge: http://localhost:4173

### Test Suite

#### 1. Initial Load & UI

| Test | Chrome | Firefox | Safari | Edge | Notes |
|------|--------|---------|--------|------|-------|
| Page loads without errors | ☐ | ☐ | ☐ | ☐ | Check console for errors |
| Dark mode is default | ☐ | ☐ | ☐ | ☐ | Should start in dark mode |
| Header displays correctly | ☐ | ☐ | ☐ | ☐ | Logo, theme toggle visible |
| Layout is responsive | ☐ | ☐ | ☐ | ☐ | Resize window to test |
| No FOUC (Flash of Unstyled Content) | ☐ | ☐ | ☐ | ☐ | Theme loads immediately |

#### 2. Endpoint Management

| Test | Chrome | Firefox | Safari | Edge | Notes |
|------|--------|---------|--------|------|-------|
| Create new endpoint | ☐ | ☐ | ☐ | ☐ | Click "New Endpoint" button |
| Endpoint URL displayed | ☐ | ☐ | ☐ | ☐ | UUID format correct |
| Copy endpoint URL | ☐ | ☐ | ☐ | ☐ | Clipboard API works |
| Endpoint list shows all endpoints | ☐ | ☐ | ☐ | ☐ | Multiple endpoints |
| Select different endpoint | ☐ | ☐ | ☐ | ☐ | Switch between endpoints |
| Delete endpoint | ☐ | ☐ | ☐ | ☐ | Confirmation modal works |
| Success toast on create | ☐ | ☐ | ☐ | ☐ | Toast appears and auto-dismisses |

#### 3. Request Capture & Display

| Test | Chrome | Firefox | Safari | Edge | Notes |
|------|--------|---------|--------|------|-------|
| Send webhook (GET) | ☐ | ☐ | ☐ | ☐ | Use curl or Postman |
| Request appears in list | ☐ | ☐ | ☐ | ☐ | Should appear immediately |
| Request method shown (GET) | ☐ | ☐ | ☐ | ☐ | Badge color correct |
| Request timestamp displayed | ☐ | ☐ | ☐ | ☐ | Relative time format |
| Send webhook (POST with body) | ☐ | ☐ | ☐ | ☐ | JSON body |
| Request body displayed | ☐ | ☐ | ☐ | ☐ | JSON formatted |
| Send webhook (with headers) | ☐ | ☐ | ☐ | ☐ | Custom headers |
| Headers displayed correctly | ☐ | ☐ | ☐ | ☐ | Key-value pairs |
| Empty state when no requests | ☐ | ☐ | ☐ | ☐ | Friendly message shown |

#### 4. Request Details Panel

| Test | Chrome | Firefox | Safari | Edge | Notes |
|------|--------|---------|--------|------|-------|
| Click request to view details | ☐ | ☐ | ☐ | ☐ | Panel opens smoothly |
| Tabs work (Headers, Body, etc.) | ☐ | ☐ | ☐ | ☐ | All tabs clickable |
| Syntax highlighting works | ☐ | ☐ | ☐ | ☐ | JSON/code colored |
| Copy request body | ☐ | ☐ | ☐ | ☐ | Copy button works |
| Copy headers | ☐ | ☐ | ☐ | ☐ | Copy button works |
| Copy as cURL | ☐ | ☐ | ☐ | ☐ | Full cURL command |
| Close detail panel | ☐ | ☐ | ☐ | ☐ | X button or click outside |

#### 5. Request Filtering & Search

| Test | Chrome | Firefox | Safari | Edge | Notes |
|------|--------|---------|--------|------|-------|
| Filter by method (GET) | ☐ | ☐ | ☐ | ☐ | Only GETs shown |
| Filter by method (POST) | ☐ | ☐ | ☐ | ☐ | Only POSTs shown |
| Filter by method (All) | ☐ | ☐ | ☐ | ☐ | All methods shown |
| Search in request body | ☐ | ☐ | ☐ | ☐ | Debounced search |
| Search in headers | ☐ | ☐ | ☐ | ☐ | Case-insensitive |
| Clear search | ☐ | ☐ | ☐ | ☐ | X button clears |
| Filter persists on endpoint switch | ☐ | ☐ | ☐ | ☐ | State maintained |

#### 6. Real-time WebSocket Updates

| Test | Chrome | Firefox | Safari | Edge | Notes |
|------|--------|---------|--------|------|-------|
| WebSocket connects on load | ☐ | ☐ | ☐ | ☐ | Status shows "Connected" |
| New request appears instantly | ☐ | ☐ | ☐ | ☐ | No page refresh needed |
| Multiple requests stream in | ☐ | ☐ | ☐ | ☐ | Send 5+ quickly |
| WebSocket reconnects after disconnect | ☐ | ☐ | ☐ | ☐ | Turn off/on network |
| Reconnection toast shown | ☐ | ☐ | ☐ | ☐ | User informed |
| Status indicator updates | ☐ | ☐ | ☐ | ☐ | Connected/Connecting/Disconnected |

#### 7. Custom Response Configuration

| Test | Chrome | Firefox | Safari | Edge | Notes |
|------|--------|---------|--------|------|-------|
| Open config modal | ☐ | ☐ | ☐ | ☐ | Settings button |
| Toggle custom response | ☐ | ☐ | ☐ | ☐ | Enable/disable |
| Set status code (200) | ☐ | ☐ | ☐ | ☐ | Input validation |
| Set invalid status code (999) | ☐ | ☐ | ☐ | ☐ | Error shown |
| Add custom header | ☐ | ☐ | ☐ | ☐ | Key-value input |
| Remove custom header | ☐ | ☐ | ☐ | ☐ | Delete button |
| Set response body (JSON) | ☐ | ☐ | ☐ | ☐ | Textarea |
| Invalid JSON validation | ☐ | ☐ | ☐ | ☐ | Error shown |
| Save configuration | ☐ | ☐ | ☐ | ☐ | Success toast |
| Config persists | ☐ | ☐ | ☐ | ☐ | Reload and check |

#### 8. Theme Toggle

| Test | Chrome | Firefox | Safari | Edge | Notes |
|------|--------|---------|--------|------|-------|
| Toggle to light mode | ☐ | ☐ | ☐ | ☐ | Sun icon appears |
| Colors change correctly | ☐ | ☐ | ☐ | ☐ | No flash/flicker |
| Toggle back to dark mode | ☐ | ☐ | ☐ | ☐ | Moon icon appears |
| Preference persists | ☐ | ☐ | ☐ | ☐ | Reload page |
| System preference respected | ☐ | ☐ | ☐ | ☐ | First load only |

#### 9. Performance

| Test | Chrome | Firefox | Safari | Edge | Notes |
|------|--------|---------|--------|------|-------|
| Initial page load <2s | ☐ | ☐ | ☐ | ☐ | Network: Fast 3G |
| Large request list scrolls smoothly | ☐ | ☐ | ☐ | ☐ | 100+ requests |
| Virtual scrolling works | ☐ | ☐ | ☐ | ☐ | Only visible items rendered |
| Syntax highlighting loads fast | ☐ | ☐ | ☐ | ☐ | <500ms |
| No memory leaks | ☐ | ☐ | ☐ | ☐ | Check DevTools memory |
| Animations are smooth (60fps) | ☐ | ☐ | ☐ | ☐ | No janky transitions |

#### 10. Error Handling

| Test | Chrome | Firefox | Safari | Edge | Notes |
|------|--------|---------|--------|------|-------|
| Backend offline error | ☐ | ☐ | ☐ | ☐ | Stop backend, reload |
| Error toast shown | ☐ | ☐ | ☐ | ☐ | Friendly message |
| Retry connection works | ☐ | ☐ | ☐ | ☐ | Start backend |
| Network error handled | ☐ | ☐ | ☐ | ☐ | Simulate offline |
| Invalid response handled | ☐ | ☐ | ☐ | ☐ | Mock 500 error |
| Component error boundary | ☐ | ☐ | ☐ | ☐ | Force error in component |
| Error boundary shows fallback | ☐ | ☐ | ☐ | ☐ | "Reload Page" button |

#### 11. Accessibility

| Test | Chrome | Firefox | Safari | Edge | Notes |
|------|--------|---------|--------|------|-------|
| Keyboard navigation works | ☐ | ☐ | ☐ | ☐ | Tab through all elements |
| Focus indicators visible | ☐ | ☐ | ☐ | ☐ | Blue outline on focus |
| ARIA labels present | ☐ | ☐ | ☐ | ☐ | Inspect with DevTools |
| Screen reader compatible | ☐ | ☐ | ☐ | ☐ | Test with VoiceOver/NVDA |
| Color contrast meets WCAG AA | ☐ | ☐ | ☐ | ☐ | Check with contrast checker |
| Form inputs have labels | ☐ | ☐ | ☐ | ☐ | All inputs accessible |

#### 12. Mobile Testing

| Test | Mobile Safari (iOS) | Chrome Mobile (Android) | Notes |
|------|---------------------|-------------------------|-------|
| Page loads correctly | ☐ | ☐ | Check console |
| Touch events work | ☐ | ☐ | Tap, scroll, swipe |
| Responsive layout adapts | ☐ | ☐ | Portrait/landscape |
| Copy to clipboard works | ☐ | ☐ | May require fallback |
| WebSocket connects | ☐ | ☐ | Real-time updates |
| Modals work on mobile | ☐ | ☐ | Config modal |
| Virtual keyboard doesn't break layout | ☐ | ☐ | Open input fields |
| Theme toggle works | ☐ | ☐ | Light/dark mode |

## Performance Testing

### Bundle Size Check

1. **Build and check sizes:**
   ```bash
   npm run build
   ```

2. **Expected results:**
   - Main bundle: <300 KB gzipped ✅
   - CSS: <10 KB gzipped ✅
   - No unexpected large chunks

3. **Run bundle analyzer:**
   ```bash
   npm run build:analyze
   ```

4. **Review dist/stats.html:**
   - Check for duplicate dependencies
   - Identify large modules
   - Verify code splitting is working

### Lighthouse Audit

1. **Build for production:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Open Chrome DevTools:**
   - Navigate to http://localhost:4173
   - Open DevTools → Lighthouse tab
   - Select "Desktop" or "Mobile"
   - Click "Analyze page load"

3. **Target Scores:**
   - Performance: >90 ✅
   - Accessibility: >90 ✅
   - Best Practices: >90 ✅
   - SEO: >80 ✅

4. **Review recommendations:**
   - Fix any critical issues
   - Note any warnings

### Network Throttling Test

1. **Chrome DevTools → Network:**
   - Throttle: "Fast 3G"
   - Disable cache
   - Reload page

2. **Check metrics:**
   - First Contentful Paint (FCP): <1.5s ✅
   - Time to Interactive (TTI): <3.5s ✅
   - Total load time: <5s ✅

## Automated Testing (Future)

Planned automated tests:

- **Unit tests:** Vitest + React Testing Library
- **E2E tests:** Playwright or Cypress
- **Visual regression:** Percy or Chromatic
- **Performance budgets:** Lighthouse CI

## Known Issues

### Current
- None

### Future Enhancements
- Service Worker for offline support
- PWA manifest for mobile app-like experience
- More granular error messages
- Request export (JSON, CSV, cURL)

## Reporting Issues

When reporting a bug, include:

1. **Browser and version:** e.g., "Chrome 120.0.6099.129"
2. **Operating system:** e.g., "macOS 14.2"
3. **Steps to reproduce:** Numbered list
4. **Expected behavior:** What should happen
5. **Actual behavior:** What actually happens
6. **Screenshots:** If applicable
7. **Console errors:** Copy from DevTools

Submit issues to: https://github.com/datlechin/hookshot/issues

## Testing Tips

- **Use different viewports:** Desktop, tablet, mobile
- **Test with real devices:** Not just browser DevTools
- **Clear cache between tests:** Avoid stale data
- **Test edge cases:** Empty states, large datasets, slow network
- **Monitor console:** Check for errors and warnings
- **Use browser DevTools:** Network tab, Performance tab, Memory tab

---

**Happy Testing!** 🚀
