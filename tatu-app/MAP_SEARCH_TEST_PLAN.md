# Map-Based Search Functionality Test Plan

## Overview
The TATU application now features intelligent search functionality that automatically detects whether a search query is a location, person name, or style/keyword, and routes it appropriately.

## Search Intelligence Features

### 1. Location Detection
- **Triggers**: When search contains city names, state abbreviations, or common location terms
- **Action**: Sets location filter and pans map to the detected location
- **Examples**: 
  - "Chicago" → Pans map to Chicago, filters artists in Chicago
  - "Los Angeles" → Pans map to LA, shows LA artists
  - "NYC" → Pans map to New York City
  - "Sacramento" → Pans map to Sacramento, CA

### 2. Person Name Detection
- **Triggers**: When search follows "FirstName LastName" pattern and is not a location
- **Action**: Keeps search in main search box, searches artist names
- **Examples**:
  - "David Kim" → Searches for artists named David Kim
  - "Sarah Chen" → Searches for artists named Sarah Chen
  - "Alex Rivera" → Searches for artists named Alex Rivera

### 3. Style/Keyword Detection
- **Triggers**: When search contains tattoo styles or general keywords
- **Action**: Keeps search in main search box, searches across all fields
- **Examples**:
  - "Watercolor" → Searches for watercolor tattoo artists
  - "Traditional" → Searches for traditional tattoo artists
  - "Geometric" → Searches for geometric tattoo artists

## Test Scenarios

### Scenario 1: City Search
1. Go to homepage
2. Enter "Chicago" in search box
3. Click magnifier icon or press Enter
4. **Expected**: 
   - Navigate to explore page
   - Map pans to Chicago
   - Location filter shows "Chicago"
   - Search box shows "Chicago"
   - Results show only Chicago artists

### Scenario 2: Person Name Search
1. Go to homepage
2. Enter "David Kim" in search box
3. Click magnifier icon or press Enter
4. **Expected**:
   - Navigate to explore page
   - Search box shows "David Kim"
   - Location filter remains empty
   - Map stays at default location
   - Results show artists named David Kim

### Scenario 3: Style Search
1. Go to homepage
2. Enter "Watercolor" in search box
3. Click magnifier icon or press Enter
4. **Expected**:
   - Navigate to explore page
   - Search box shows "Watercolor"
   - Location filter remains empty
   - Map stays at default location
   - Results show watercolor tattoo artists

### Scenario 4: Combined Search
1. Go to homepage
2. Enter "David Chicago Geometric" in search box
3. Click magnifier icon or press Enter
4. **Expected**:
   - Navigate to explore page
   - Search box shows "David Chicago Geometric"
   - Location filter shows "Chicago"
   - Map pans to Chicago
   - Results show artists named David in Chicago who do Geometric work

### Scenario 5: State Abbreviation
1. Go to homepage
2. Enter "CA" in search box
3. Click magnifier icon or press Enter
4. **Expected**:
   - Navigate to explore page
   - Search box shows "CA"
   - Location filter shows "CA"
   - Map pans to California
   - Results show California artists

## Technical Implementation

### Homepage Search (page.tsx)
- Magnifier icon has click handler
- Enter key triggers search
- Both navigate to `/explore?search={query}`

### Explore Page Intelligence (explore/page.tsx)
- `parseSearchQuery()` function analyzes search terms
- Detects locations using comprehensive city/state list
- Detects person names using regex pattern
- Routes searches to appropriate fields

### Map Integration (LeafletMap.tsx)
- Receives `searchLocation` prop
- Uses geocoding API for unknown cities
- Pans map to detected locations
- Shows artist markers

## Debugging
- Console logs show search parsing decisions
- Check browser console for "Parsing search query" messages
- Verify location detection with "Is location" logs
- Confirm person name detection with "Is person name" logs

## Supported Cities
The system recognizes 100+ US cities including:
- Major cities: New York, Los Angeles, Chicago, Houston, Phoenix
- State capitals: Sacramento, Austin, Denver, Boston
- Popular destinations: Miami, Seattle, Portland, Las Vegas
- State abbreviations: NY, CA, IL, TX, AZ, FL, WA, OR, NV

## Error Handling
- Unknown cities use Nominatim geocoding API
- Fallback to default map view if geocoding fails
- Graceful degradation for network issues
- Console error logging for debugging
