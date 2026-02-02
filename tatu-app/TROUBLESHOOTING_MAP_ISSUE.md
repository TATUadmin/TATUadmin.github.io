# Troubleshooting: Artist Not Appearing on Explore Map

## Issue
Artist profile (`ppcrzart@gmail.com`) is not appearing on the explore page map, even though it appears on the dashboard map.

## Root Causes

An artist must meet **ALL** of these conditions to appear on the explore map:

1. ✅ **Role**: Must be `ARTIST`
2. ✅ **completedRegistration**: Must be `true`
3. ✅ **Location**: Must have both `latitude` AND `longitude` set (not null)

## Debugging Steps

### 1. Check User Status via API

```bash
# Check user's current status
curl http://localhost:3000/api/debug/user-location?email=ppcrzart@gmail.com
```

This will show:
- Whether user exists
- Whether they have location data
- Whether `completedRegistration` is true
- Why they might not appear on the map

### 2. Run Diagnostic Script

```bash
cd tatu-app
npx ts-node scripts/diagnose-map-issue.ts
```

This will:
- Check all query conditions
- Verify if user matches the API query
- Identify what's preventing map display

### 3. Check Browser Console

When loading the explore page, check the browser console for:
- `✅ Found ppcrzart@gmail.com in results:` - User found in API response
- `❌ ppcrzart filtered out - missing location data:` - User filtered out client-side
- `Fetched artists from API: X total artists` - Total count

### 4. Check Server Logs

When the `/api/artists` endpoint is called, check server logs for:
- `✅ Found ppcrzart@gmail.com in results:` - User found in query
- `❌ ppcrzart@gmail.com NOT found in query results` - User doesn't match query
- `⚠️ User exists but not matching query:` - Shows what condition failed

## Common Issues & Fixes

### Issue 1: `completedRegistration` is false

**Symptom**: User has location but `completedRegistration` is false

**Fix**: Run the fix script:
```bash
cd tatu-app
npx ts-node scripts/fix-user-location.ts
```

Or manually update via API:
```bash
# First, get the user's profile
curl http://localhost:3000/api/profile

# Then update completedRegistration (if location exists)
# The API should auto-fix this, but you can also manually set it
```

### Issue 2: Missing latitude/longitude

**Symptom**: User has `location` text but no `latitude`/`longitude`

**Fix**: User needs to set their location in the dashboard. The location picker will automatically geocode and set lat/lng.

### Issue 3: User role is not ARTIST

**Symptom**: User exists but role is `CUSTOMER` or something else

**Fix**: User needs to complete artist registration or update their role.

### Issue 4: Query conditions not matching

**Symptom**: User has all data but still doesn't appear

**Fix**: Check the query logic in `/api/artists/route.ts`. The query requires:
```typescript
{
  role: 'ARTIST',
  artistProfile: {
    completedRegistration: true,
    latitude: { not: null },
    longitude: { not: null }
  }
}
```

## API Response Format

The `/api/artists` endpoint returns:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "...",
      "latitude": 40.7128,
      "longitude": -74.0060,
      ...
    }
  ],
  "meta": {
    "pagination": {...}
  }
}
```

The LeafletMap component correctly parses `responseData.data` to get the artists array.

## Client-Side Filtering

Even if an artist appears in the API response, they may be filtered out client-side if:
- `latitude` is null/undefined
- `longitude` is null/undefined
- `reviewCount < minReviews` (if minReviews filter is set)

Check the browser console for filtering messages.

## Verification Checklist

- [ ] User exists in database
- [ ] User role is `ARTIST`
- [ ] `completedRegistration` is `true`
- [ ] `latitude` is not null
- [ ] `longitude` is not null
- [ ] User appears in `/api/artists` query results
- [ ] User data includes `latitude` and `longitude` in API response
- [ ] User passes client-side filtering in LeafletMap

## Quick Fix Command

If user has location but `completedRegistration` is false:

```bash
cd tatu-app
npx ts-node scripts/fix-user-location.ts
```

This will automatically set `completedRegistration: true` if the user has location data.

## Still Not Working?

1. Check server logs for the debug messages we added
2. Check browser console for client-side filtering messages
3. Verify the API response includes the user: `curl http://localhost:3000/api/artists?limit=1000 | grep ppcrzart`
4. Check if caching is interfering (clear cache or wait 5 minutes)
5. Verify the database directly:
   ```sql
   SELECT u.email, u.role, ap."completedRegistration", ap.latitude, ap.longitude
   FROM "User" u
   JOIN "ArtistProfile" ap ON u.id = ap."userId"
   WHERE u.email = 'ppcrzart@gmail.com';
   ```

