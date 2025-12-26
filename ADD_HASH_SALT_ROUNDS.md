# 🔒 Add HASH_SALT_ROUNDS - Security Enhancement

**Priority:** High 🔥  
**Time Required:** 1 minute  
**Difficulty:** Easy

---

## 📋 What This Does

`HASH_SALT_ROUNDS` controls how many times passwords are hashed for security:
- **Higher = More Secure** (but slower)
- **Lower = Faster** (but less secure)
- **Recommended:** `12` (good balance)

---

## ✅ Step-by-Step Instructions

### **Step 1: Go to Vercel Dashboard**

1. Open https://vercel.com/dashboard
2. Find and click on your **"tatu-app"** project

### **Step 2: Navigate to Environment Variables**

1. Click **Settings** (in the top menu)
2. Click **Environment Variables** (in the left sidebar)

### **Step 3: Add the Variable**

1. Click **"Add New"** button
2. Fill in the form:

```
Name: HASH_SALT_ROUNDS
Value: 12
Environments: ✅ Production  ✅ Preview  ✅ Development
```

3. Click **"Save"**

### **Step 4: Done!**

✅ That's it! The variable is now configured.

---

## 📊 Verification

You should see in your Environment Variables list:

```
HASH_SALT_ROUNDS = 12
```

With checkmarks for all three environments (Production, Preview, Development).

---

## ⚠️ Important Notes

- **Don't set it too high** (above 14) - it will slow down login/registration
- **Don't set it too low** (below 10) - it won't be secure enough
- **12 is the sweet spot** for most applications

---

## 🔄 Does This Require a Redeploy?

**No!** Environment variables are available immediately. However, if you want to be sure:

1. You can trigger a redeploy by pushing a small change, OR
2. Just leave it - it will be used on the next deployment automatically

---

## ✅ Status

- [x] Variable name: `HASH_SALT_ROUNDS`
- [x] Value: `12`
- [x] All environments selected
- [x] Saved

**✅ Security enhancement complete!** 🎉

---

**Next:** Set up Google OAuth (see `ADD_GOOGLE_OAUTH.md`)

