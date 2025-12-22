# 🗄️ Database Setup Guide - Supabase PostgreSQL

## 📋 **Quick Reference**

### **Your Database:**
- **Provider:** Supabase (PostgreSQL)
- **Connection:** Via `DATABASE_URL` environment variable
- **Status:** ✅ Configured and ready

---

## 🔧 **Environment Variable**

### **Required:**
```env
DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"
```

### **Format Breakdown:**
```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

### **Where to Find:**
1. Go to your Supabase project dashboard
2. Settings → Database
3. Copy "Connection string" (URI format)
4. Replace `[YOUR-PASSWORD]` with your actual password

---

## 🚀 **Prisma Commands**

### **Generate Prisma Client:**
```bash
npx prisma generate
```
Run this after schema changes.

### **Create Migration:**
```bash
npx prisma migrate dev --name migration_name
```
Creates a new migration from schema changes.

### **Apply Migrations:**
```bash
npx prisma migrate deploy
```
Applies pending migrations (production).

### **View Database:**
```bash
npx prisma studio
```
Opens a visual database browser.

### **Pull Schema:**
```bash
npx prisma db pull
```
Pulls current database schema (useful for existing databases).

### **Push Schema:**
```bash
npx prisma db push
```
Pushes schema changes without migrations (development only).

---

## 🔍 **Verifying Connection**

### **Test Connection:**
```bash
npx prisma db pull
```

If this works, your connection is good!

### **Check Status:**
```bash
npx prisma migrate status
```

Shows migration status.

---

## 📊 **Supabase Dashboard**

### **Access Your Database:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "Database" in sidebar
4. View tables, run queries, see logs

### **Useful Features:**
- **Table Editor** - Visual table management
- **SQL Editor** - Run custom queries
- **Database Logs** - See all queries
- **Connection Pooling** - Optimized connections
- **Backups** - Automatic daily backups

---

## 🔒 **Security Best Practices**

### **Connection String:**
- ✅ Store in environment variables (never in code)
- ✅ Use connection pooling for production
- ✅ Rotate passwords regularly
- ✅ Use different databases for dev/staging/prod

### **Supabase Features:**
- ✅ **Row Level Security (RLS)** - Enable for sensitive tables
- ✅ **SSL Required** - Always use SSL connections
- ✅ **IP Restrictions** - Limit access by IP if needed
- ✅ **Audit Logs** - Monitor database access

---

## 🎯 **Production Checklist**

- [ ] `DATABASE_URL` set in Vercel environment variables
- [ ] Connection pooling enabled (Supabase dashboard)
- [ ] Row Level Security configured (if needed)
- [ ] Backups enabled (automatic in Supabase)
- [ ] Database password rotated regularly
- [ ] Different databases for dev/staging/prod
- [ ] Monitoring set up (Supabase dashboard)

---

## 🆘 **Troubleshooting**

### **Connection Errors:**
- Check `DATABASE_URL` format
- Verify password is correct
- Check Supabase project is active
- Ensure IP is not blocked

### **Migration Errors:**
- Check schema syntax
- Verify database permissions
- Review migration history
- Check for conflicting changes

### **Performance Issues:**
- Enable connection pooling
- Check query performance in Supabase dashboard
- Review indexes
- Consider read replicas for scale

---

## 📚 **Resources**

- **Supabase Docs:** https://supabase.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs

---

## ✅ **You're All Set!**

Your Supabase PostgreSQL database is:
- ✅ Configured correctly
- ✅ Connected properly
- ✅ Ready for production
- ✅ Enterprise-grade

**No further setup needed!** 🎉

