# Session-Based Privacy Feature Testing Guide

## Quick Test Checklist

### ✅ Test 1: New User Experience
1. Open DevTools Console
2. Run: `localStorage.removeItem('hookshot_my_endpoints')`
3. Refresh page
4. **Expected**: Empty state shows "Create a new endpoint or visit an endpoint URL to get started."

### ✅ Test 2: Create Endpoint
1. Click "New" or "Create Endpoint" button
2. **Expected**:
   - New endpoint appears in sidebar
   - URL changes to `/endpoint/{uuid}`
   - localStorage updated: `JSON.parse(localStorage.getItem('hookshot_my_endpoints'))`

### ✅ Test 3: Direct URL Access (Sharing)
1. Create an endpoint, copy its URL (e.g., `/endpoint/abc-123`)
2. Clear localStorage: `localStorage.removeItem('hookshot_my_endpoints')`
3. Refresh page (should see empty state)
4. Paste the URL you copied and navigate to it
5. **Expected**:
   - Endpoint automatically claimed and appears in sidebar
   - Endpoint is selected
   - localStorage contains the endpoint ID

### ✅ Test 4: Invalid URL
1. Visit `/endpoint/invalid-uuid-here`
2. **Expected**:
   - Yellow warning message: "Endpoint not found: invalid-uuid-here"
   - Automatically redirects to home (`/`)

### ✅ Test 5: Migration (Existing Users)
1. Create 3 endpoints
2. Note their IDs
3. Clear localStorage: `localStorage.removeItem('hookshot_my_endpoints')`
4. Refresh page
5. **Expected**:
   - All 3 endpoints automatically claimed and visible
   - Migration happens only once
   - localStorage contains all 3 endpoint IDs

### ✅ Test 6: Delete Endpoint
1. Create an endpoint
2. Check localStorage (should contain the ID)
3. Delete the endpoint
4. Check localStorage again
5. **Expected**:
   - Endpoint removed from sidebar
   - Endpoint ID removed from localStorage

### ✅ Test 7: URL Sync
1. Create multiple endpoints
2. Click different endpoints in the sidebar
3. Watch the browser address bar
4. **Expected**:
   - URL changes to `/endpoint/{selected-uuid}` for each selection
   - Selecting first endpoint → URL updates
   - Selecting second endpoint → URL updates again

### ✅ Test 8: Stale ID Cleanup
1. Manually add a fake UUID to localStorage:
   ```javascript
   const current = JSON.parse(localStorage.getItem('hookshot_my_endpoints') || '[]')
   current.push('fake-uuid-12345')
   localStorage.setItem('hookshot_my_endpoints', JSON.stringify(current))
   ```
2. Refresh page
3. Check localStorage again
4. **Expected**:
   - Fake UUID removed automatically
   - Only valid endpoint IDs remain

## DevTools Console Commands

```javascript
// View claimed endpoints
JSON.parse(localStorage.getItem('hookshot_my_endpoints'))

// Clear all claimed endpoints (test new user)
localStorage.removeItem('hookshot_my_endpoints')

// Add fake endpoint (test cleanup)
const ids = JSON.parse(localStorage.getItem('hookshot_my_endpoints') || '[]')
ids.push('fake-uuid-test')
localStorage.setItem('hookshot_my_endpoints', JSON.stringify(ids))

// Check if specific endpoint is claimed
JSON.parse(localStorage.getItem('hookshot_my_endpoints')).includes('your-uuid-here')
```

## Implementation Files

- ✅ `frontend/src/hooks/useMyEndpoints.ts` - New localStorage hook
- ✅ `frontend/src/hooks/useEndpoints.ts` - Enhanced with filtering
- ✅ `frontend/src/components/layout/Sidebar.tsx` - URL handling
- ✅ `frontend/src/hooks/index.ts` - Hook export

## Success Criteria

All tests pass ✅
- New users see empty state with updated message
- Created endpoints auto-claimed and URL syncs
- Direct URLs work for sharing
- Invalid URLs handled gracefully
- Migration works for existing users
- Deletion removes from localStorage
- Stale IDs cleaned up automatically

## Known Limitations (Acceptable for MVP)

- Browser back/forward buttons don't update selection (URL changes but not selection)
- No cross-tab sync (localStorage changes in one tab don't reflect in others)
- Can be enhanced later if needed

---

**Status**: ✅ Implementation complete and ready for testing!
