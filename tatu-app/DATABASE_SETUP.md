# Database Setup Guide

## Quick Setup with Supabase (Recommended - Free)

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project" → Sign up (free)
3. Create a new project:
   - Name: `tatu-dev` (or any name)
   - Database Password: **Save this password!** You'll need it
   - Region: Choose closest to you
   - Click "Create new project"

### Step 2: Get Your Connection String
1. In Supabase dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string** section
3. Under **Connection pooling**, copy the **URI** (not the Session mode)
   - It looks like: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`
4. Or use the **Direct connection** (for migrations):
   - Go to **Connection string** → **URI**
   - Copy the connection string

### Step 3: Update Your .env.local
Replace `DATABASE_URL` in `.env.local` with your Supabase connection string:

```env
DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Important:** Replace `[YOUR-PASSWORD]` with the database password you saved in Step 1.

### Step 4: Run Database Migrations
```bash
cd /Users/pedroperin/Documents/TATU/TATUadmin.github.io/tatu-app
npx prisma migrate deploy
```

Or for development:
```bash
npx prisma migrate dev
```

### Step 5: Generate Prisma Client
```bash
npx prisma generate
```

### Step 6: Restart Your Dev Server
```bash
# Stop current server (Ctrl+C), then:
cd /Users/pedroperin/Documents/TATU/TATUadmin.github.io/tatu-app && export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use default && npm run dev
```

## Alternative: Neon (Another Free Option)

1. Go to https://neon.tech
2. Sign up (free)
3. Create a project
4. Copy the connection string from the dashboard
5. Update `DATABASE_URL` in `.env.local`
6. Run migrations as above

## Verify It's Working

After setup, try signing up again. The "Internal server error" should be gone!

## Troubleshooting

- **Connection refused**: Check your connection string is correct
- **SSL required**: Add `?sslmode=require` to your connection string
- **Migration errors**: Make sure you're using the direct connection (not pooler) for migrations



