# Mapbox Setup Instructions

## Getting a Free Mapbox Token

1. **Sign up for Mapbox**: Go to [https://account.mapbox.com/](https://account.mapbox.com/)
2. **Create an account**: Use your email to create a free account
3. **Get your token**: Navigate to [Access Tokens](https://account.mapbox.com/access-tokens/)
4. **Copy your default public token**: It will look like `pk.eyJ1...`

## Adding the Token to Your Project

1. **Create `.env.local` file** in your project root:
```bash
touch .env.local
```

2. **Add your token** to `.env.local`:
```
NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
```

3. **Restart your development server**:
```bash
npm run dev
```

## Free Tier Limits

- **50,000 map loads per month** (more than enough for development)
- **No credit card required**
- **Perfect for development and small production apps**

## Alternative: Use Demo Token

The component includes a demo token that works for basic testing, but has limited usage. For production, you'll need your own token.

## Features Included

- ✅ Real interactive map with zoom/pan
- ✅ Artist markers with custom colors
- ✅ Clickable markers with popups
- ✅ Location services integration
- ✅ Responsive design
- ✅ Dark theme optimized
