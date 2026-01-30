---
name: task-8
title: Custom response configuration UI with templates
status: completed
github_issue: 9
github_url: https://github.com/datlechin/hookshot/issues/9
priority: medium
estimated_hours: 4
depends_on: [task-6]
created: 2026-01-29T13:58:48Z
updated: 2026-01-30T02:15:13Z
---

# Custom response configuration UI with templates

Build UI for configuring custom webhook responses per endpoint. Allow users to set status code, headers, and body. Provide quick templates for common scenarios (200 OK, 400 Bad Request, 500 Internal Server Error).

## Acceptance Criteria

- [ ] Response configuration panel in Endpoint View page
- [ ] Toggle to enable/disable custom response
- [ ] Status code input with validation (100-599)
- [ ] Headers editor (key-value pairs, add/remove rows)
- [ ] Response body textarea (text or JSON)
- [ ] Template buttons: 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Server Error
- [ ] Clicking template populates status, headers, and body
- [ ] Templates are editable after application
- [ ] "Save" button persists configuration via API
- [ ] "Preview" shows what response will be returned
- [ ] Changes apply immediately to subsequent webhook requests
- [ ] Validation errors shown inline

## Files to create

- `frontend/src/components/ResponseConfig.tsx`
- `frontend/src/lib/response-templates.ts`

## Technical Notes

- Use shadcn/ui Input for status code
- Use shadcn/ui Table or custom component for headers editor
- Use shadcn/ui Textarea for body
- Use shadcn/ui Switch for enable/disable toggle
- Validate JSON if Content-Type is application/json
