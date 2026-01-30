---
name: task-7
title: Request detail view and filtering/search functionality
status: open
github_issue: 8
github_url: https://github.com/datlechin/hookshot/issues/8
priority: medium
estimated_hours: 5
depends_on: [task-6]
created: 2026-01-29T13:58:47Z
updated: 2026-01-30T02:15:13Z
---

# Request detail view and filtering/search functionality

Build detailed request viewer with tabbed interface (Headers | Body | Raw) and implement filtering by HTTP method and search within headers/body. Add syntax highlighting for JSON/XML bodies.

## Acceptance Criteria

- [ ] Request detail modal/panel with tabbed view (Headers, Body, Raw)
- [ ] Headers tab: key-value table, copy individual headers or all headers
- [ ] Body tab: syntax-highlighted JSON/XML, plain text fallback, copy body button
- [ ] Raw tab: complete HTTP request (method + path + headers + body)
- [ ] Filter bar with method buttons: ALL, GET, POST, PUT, DELETE, PATCH (multi-select)
- [ ] Search input: case-insensitive, searches headers (keys + values) and body
- [ ] Highlight matching text in search results
- [ ] Filters and search persist during session
- [ ] "No results" state when no matches
- [ ] Clear filters and search with one click

## Files to create

- `frontend/src/components/RequestDetail.tsx`
- `frontend/src/components/FilterBar.tsx`
- `frontend/src/lib/syntax-highlight.ts` (or use library like `react-syntax-highlighter`)

## Technical Notes

- Use shadcn/ui Tabs for tabbed interface
- Use shadcn/ui Dialog or Sheet for detail view
- Use shadcn/ui Badge for method filters
- Consider `react-syntax-highlighter` for JSON/XML
- Filter and search logic can be client-side or server-side (recommend server-side for large datasets)
