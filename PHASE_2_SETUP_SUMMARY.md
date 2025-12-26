# 🚀 Phase 2 Setup - Quick Start Guide

**Tasks:** Security Enhancement + Google OAuth  
**Total Time:** ~20 minutes  
**Difficulty:** Easy → Medium

---

## 📋 Overview

You're adding two features today:

1. **🔒 Security Enhancement** (1 min) - Stronger password hashing
2. **🔐 Google OAuth** (20 min) - "Sign in with Google" button

---

## ⚡ Quick Start: Part 1 - Security (1 minute)

### **Add HASH_SALT_ROUNDS**

1. Go to https://vercel.com/dashboard
2. Open **"tatu-app"** project
3. **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Add:
   ```
   Name: HASH_SALT_ROUNDS
   Value: 12
   Environments: ✅ All three
   ```
6. Click **"Save"**

✅ **Done!** That was easy!

**📄 Detailed Guide:** See `ADD_HASH_SALT_ROUNDS.md`

---

## 🔐 Part 2 - Google OAuth (20 minutes)

### **High-Level Steps:**

1. **Google Cloud Console** (5 min)
   - Create project
   - Enable Google+ API

2. **OAuth Consent Screen** (5 min)
   - Configure app details
   - Add scopes

3. **Create Credentials** (5 min)
   - Set up OAuth 2.0
   - Copy Client ID & Secret

4. **Add to Vercel** (2 min)
   - Add 3 environment variables

5. **Deploy & Test** (3 min)
   - Redeploy
   - Test login

**📄 Detailed Guide:** See `ADD_GOOGLE_OAUTH.md` (full step-by-step with screenshots)

---

## 📝 Checklist

### **Security Enhancement:**
- [ ] Add `HASH_SALT_ROUNDS = 12` to Vercel

### **Google OAuth:**
- [ ] Create Google Cloud project
- [ ] Enable Google+ API
- [ ] Configure OAuth consent screen
- [ ] Create OAuth 2.0 credentials
- [ ] Copy Client ID
- [ ] Copy Client Secret
- [ ] Add `GOOGLE_CLIENT_ID` to Vercel
- [ ] Add `GOOGLE_CLIENT_SECRET` to Vercel
- [ ] Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to Vercel
- [ ] Redeploy app
- [ ] Test "Sign in with Google" on live site

---

## 🎯 What You'll Need

### **Accounts:**
- ✅ Google account (you already have one)
- ✅ Vercel account (you're already logged in)

### **Information:**
- ✅ Your domain: `tatufortattoos.com`
- ✅ Your email address

### **Time:**
- 1 minute for security
- 20 minutes for Google OAuth
- **Total: ~21 minutes**

---

## 📚 Resources

- **Security Guide:** `ADD_HASH_SALT_ROUNDS.md`
- **Google OAuth Guide:** `ADD_GOOGLE_OAUTH.md`
- **Google Cloud Console:** https://console.cloud.google.com/
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## 🎉 After Completion

Once both are done, you'll have:

✅ **More secure password hashing**  
✅ **"Sign in with Google" button on your site**  
✅ **Better user experience**  
✅ **Professional authentication**

---

## 💡 Tips

1. **Do them in order** - Security first (it's quick!)
2. **Keep Google credentials safe** - Don't share the Client Secret
3. **Test in incognito mode** - To see the real user experience
4. **Add yourself as test user** - If you see "Access blocked" error

---

## 🆘 Need Help?

If you get stuck on any step:
1. Check the detailed guides
2. Look at the troubleshooting sections
3. Let me know which step you're on!

---

**Ready to start?** Begin with the security enhancement - it only takes 1 minute! 🚀

**Open:** `ADD_HASH_SALT_ROUNDS.md` to begin!

