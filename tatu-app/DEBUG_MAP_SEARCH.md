# Map Search & Navigation Debug Guide

## 🔍 Debugging Steps

### 1. Test Universal Search
1. **Go to homepage** (http://localhost:3000)
2. **Enter any location** in search box (e.g., "Chicago", "Los Angeles", "Miami")
3. **Click magnifier icon** or press Enter
4. **Check console** for debug messages

### 2. Test Map Panning
1. **Go to explore page** (/explore)
2. **Look for debug text** below map: "Debug: Map location set to: [location]"
3. **Click test buttons** (Chicago, LA, Miami) to manually test map panning
4. **Check console** for geocoding messages

### 3. Test Profile Navigation
1. **Click on artist markers** on the map
2. **Click "View Full Profile"** in popup
3. **Check console** for: "Navigating to artist: [id]"
4. **Verify navigation** to artist profile page

## 🐛 Debug Console Messages

### Search Parsing (explore/page.tsx):
```
Parsing search query: chicago
Is location: true Is person name: false Is first name only: false
Setting location filter and map location to: chicago
Location detected - map should pan to: chicago
```

### Map Geocoding (LeafletMap.tsx):
```
LeafletMap received searchLocation: chicago
Map instance exists, processing location: chicago
Using geocoding API for: chicago
Geocoding response: [array of results]
Setting map view to: 41.8781, -87.6298
```

### Profile Navigation:
```
Navigating to artist: 1
```

## 🧪 Test Cases

### Universal Search Test:
- **"Chicago"** → Should pan to Chicago, IL
- **"Los Angeles"** → Should pan to LA, CA  
- **"Miami"** → Should pan to Miami, FL
- **"Times Square"** → Should pan to NYC
- **"Golden Gate Bridge"** → Should pan to San Francisco
- **"London"** → Should pan to London, UK
- **"Paris"** → Should pan to Paris, France

### Navigation Test:
- **Click artist marker** → Should show popup
- **Click "View Full Profile"** → Should navigate to `/artist/[id]`
- **Check artist profile loads** → Should show artist details

## 🔧 Troubleshooting

### If Map Doesn't Pan:
1. **Check console** for geocoding errors
2. **Verify network** - geocoding API might be blocked
3. **Try test buttons** to isolate the issue
4. **Check mapLocation state** in debug text

### If Navigation Doesn't Work:
1. **Check console** for navigation messages
2. **Verify artist profile page** exists at `/artist/[id]`
3. **Try direct URL** navigation to test route
4. **Check for JavaScript errors** in console

### If Search Parsing Fails:
1. **Check console** for parsing messages
2. **Verify location detection** logic
3. **Test with simple city names** first
4. **Check city list** in parseSearchQuery function

## 📊 Expected Behavior

### Homepage → Explore:
1. Enter location → Click search
2. Navigate to explore page
3. Map should pan to location
4. Debug text should show location
5. Console should show geocoding success

### Map → Profile:
1. Click artist marker
2. Click "View Full Profile"
3. Navigate to artist profile
4. Console should show navigation message
5. Profile page should load with artist data

## 🚨 Common Issues

1. **CORS errors** - Geocoding API blocked
2. **Map not initialized** - Timing issues
3. **Navigation blocked** - Popup security
4. **Search parsing** - Location detection logic
5. **Network issues** - API connectivity

## 📝 Debug Information

- **Map Location State**: Shown in debug text below map
- **Console Logs**: Detailed step-by-step debugging
- **Test Buttons**: Manual map panning tests
- **Network Tab**: Check geocoding API calls
- **Elements Tab**: Inspect popup HTML structure
