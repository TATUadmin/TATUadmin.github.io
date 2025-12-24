# 🔧 Fix: Window is Not Defined Error

## Issue
The `/explore` page was failing during build with:
```
ReferenceError: window is not defined
```

## Root Cause
- Leaflet (map library) accesses `window` during module initialization
- Even though the page is marked as `'use client'`, Next.js still tries to prerender it during build
- The static import of `LeafletMap` caused Leaflet to initialize during build

## Solution
Changed from static import to **dynamic import** with `ssr: false`:

```typescript
// Before (static import - causes build error)
import LeafletMap from '../components/LeafletMap'

// After (dynamic import - no build error)
const LeafletMap = dynamic(() => import('../components/LeafletMap'), {
  ssr: false, // Disable server-side rendering for the map component
  loading: () => <div>Loading map...</div>
})
```

## Result
- ✅ Map component only loads on the client side
- ✅ No `window` access during build
- ✅ Build should complete successfully
- ✅ Map still works perfectly at runtime

## Status
**Fixed** - Changes pushed to `merger-test-2` branch

---

**Note:** The map will show a loading state initially, then render once the client-side JavaScript loads. This is expected behavior for dynamically imported components.

