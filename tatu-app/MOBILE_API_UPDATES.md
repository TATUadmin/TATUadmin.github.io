# Mobile API Updates - Profile Separation

## Overview

The backend has been updated to separate user profiles into role-specific models:
- **ArtistProfile**: For artists and shop owners (includes bio, specialties, subscription info, etc.)
- **CustomerProfile**: For customers (includes preferences, location preferences, etc.)

All API endpoints have been updated to use these new models. Mobile apps using these APIs will automatically work with the new structure.

## API Response Changes

### User Profile Endpoints

#### `GET /api/auth/me`
Returns user data with both profile types:
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "ARTIST",
  "artistProfile": {
    "id": "profile-id",
    "bio": "...",
    "avatar": "...",
    "specialties": [...],
    "subscriptionTier": "PRO",
    ...
  },
  "customerProfile": null
}
```

#### `GET /api/profile`
Returns role-specific profile based on user's role:
- **ARTIST/SHOP_OWNER**: Returns `ArtistProfile` object
- **CUSTOMER**: Returns `CustomerProfile` object

#### `PUT /api/profile`
Updates role-specific profile:
- **ARTIST/SHOP_OWNER**: Updates `ArtistProfile` fields (bio, phone, instagram, website, location, specialties)
- **CUSTOMER**: Updates `CustomerProfile` fields (phone, preferredStyles, locationPreferences)

### Artist Endpoints

#### `GET /api/artists`
Returns artists with `artistProfile` instead of `profile`:
```json
{
  "artists": [
    {
      "id": "artist-id",
      "name": "Artist Name",
      "artistProfile": {
        "bio": "...",
        "avatar": "...",
        "location": "...",
        "specialties": [...]
      }
    }
  ]
}
```

#### `GET /api/artists/[id]`
Returns single artist with `artistProfile`:
```json
{
  "id": "artist-id",
  "name": "Artist Name",
  "bio": "...",
  "avatar": "...",
  "location": "...",
  "specialties": [...],
  "artistProfile": { ... }
}
```

### Search Endpoints

#### `GET /api/search`
All artist results now use `artistProfile`:
```json
{
  "artists": [
    {
      "id": "artist-id",
      "name": "Artist Name",
      "artistProfile": {
        "bio": "...",
        "avatar": "...",
        "location": "...",
        "specialties": [...]
      }
    }
  ],
  "portfolio": [
    {
      "id": "item-id",
      "artist": {
        "id": "artist-id",
        "name": "Artist Name",
        "avatar": "...",
        "location": "...",
        "specialties": [...]
      }
    }
  ]
}
```

### Comments & Reviews

#### `GET /api/portfolio/[id]/comments`
User avatars now come from either `artistProfile` or `customerProfile`:
```json
{
  "comments": [
    {
      "id": "comment-id",
      "user": {
        "id": "user-id",
        "name": "User Name",
        "artistProfile": {
          "avatar": "..."
        },
        "customerProfile": {
          "avatar": "..."
        }
      }
    }
  ]
}
```

**Note**: Check `artistProfile?.avatar` first, then fallback to `customerProfile?.avatar`.

## Migration Notes for Mobile Apps

### 1. Update Type Definitions

If your mobile app has TypeScript/type definitions, update them:

```typescript
// Old
interface User {
  profile?: {
    avatar?: string
    bio?: string
    // ...
  }
}

// New
interface User {
  artistProfile?: {
    avatar?: string
    bio?: string
    specialties?: string[]
    subscriptionTier?: string
    // ...
  }
  customerProfile?: {
    avatar?: string
    phone?: string
    preferredStyles?: string[]
    // ...
  }
}
```

### 2. Avatar Access Pattern

When displaying user avatars, use this pattern:

```typescript
const avatar = user.artistProfile?.avatar || user.customerProfile?.avatar || null
```

### 3. Profile Data Access

For artist-specific data:
```typescript
if (user.role === 'ARTIST' || user.role === 'SHOP_OWNER') {
  const profile = user.artistProfile
  // Access: profile.bio, profile.specialties, etc.
}
```

For customer-specific data:
```typescript
if (user.role === 'CUSTOMER') {
  const profile = user.customerProfile
  // Access: profile.preferredStyles, profile.locationPreferences, etc.
}
```

### 4. Signup Flow

The signup endpoint (`POST /api/auth/signup`) now automatically creates the appropriate profile based on the selected role:
- `ARTIST` or `SHOP_OWNER` → Creates `ArtistProfile`
- `CUSTOMER` → Creates `CustomerProfile`

No changes needed to the signup request format.

### 5. Profile Update

When updating profiles via `PUT /api/profile`, the endpoint automatically routes to the correct profile model based on the user's role. The request format remains the same, but only relevant fields for that role are accepted.

## Breaking Changes

⚠️ **None!** All API endpoints maintain backward compatibility in terms of request/response structure. The main change is that:
- `profile` field is now split into `artistProfile` and `customerProfile`
- Mobile apps should check both fields when accessing profile data

## Testing Checklist

- [ ] User authentication and profile fetching
- [ ] Artist search and listing
- [ ] Portfolio item display (with artist info)
- [ ] Comments display (with user avatars)
- [ ] Profile updates
- [ ] Signup flow for both roles
- [ ] Subscription features (artists only)

## Support

If you encounter any issues with the mobile app after these changes, check:
1. Avatar display logic (should check both profile types)
2. Profile data access (should use role-specific profile)
3. API response parsing (should handle both `artistProfile` and `customerProfile`)

All endpoints return consistent JSON structures, so mobile apps should continue to work with minimal or no changes.


