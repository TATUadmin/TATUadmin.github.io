# 🌐 Domain Setup Guide - tatufortattoos.com

## Current Status

- **Project:** tatu-app (Vercel)
- **Branch:** merger-test-2
- **Desired Domain:** tatufortattoos.com
- **Build Status:** Should be working now (all fixes applied)

---

## Step 1: Add Domain in Vercel

### Via Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select project: **tatu-app**

2. **Navigate to Domains**
   - Click "Settings" tab
   - Click "Domains" in the sidebar

3. **Add Your Domain**
   - Click "Add Domain" button
   - Enter: `tatufortattoos.com`
   - Click "Add"

4. **Add WWW Subdomain**
   - Click "Add Domain" again
   - Enter: `www.tatufortattoos.com`
   - Click "Add"

5. **Choose Redirect Behavior**
   - Recommended: Redirect `www.tatufortattoos.com` → `tatufortattoos.com`
   - Or vice versa (your preference)

---

## Step 2: Configure DNS

Vercel will show you DNS records to add. You'll need to add these in your domain registrar.

### Option A: Using Vercel Nameservers (Recommended)

**Easiest Setup:**
1. Vercel provides nameservers (e.g., `ns1.vercel-dns.com`)
2. Go to your domain registrar (GoDaddy, Namecheap, etc.)
3. Replace the nameservers with Vercel's nameservers
4. Wait 24-48 hours for propagation

**Advantages:**
- Automatic SSL certificate management
- Fastest DNS resolution
- Automatic subdomain handling
- Zero configuration needed

### Option B: Using A Records (Manual)

**If you want to keep your current nameservers:**

Add these records in your domain registrar's DNS settings:

```
Type    Name    Value                       TTL
A       @       76.76.21.21                 3600
CNAME   www     cname.vercel-dns.com        3600
```

**Note:** The IP address (`76.76.21.21`) is an example. Use the actual IP that Vercel provides in your dashboard.

---

## Step 3: Verify Domain Setup

### In Vercel Dashboard

1. Go to: tatu-app → Settings → Domains
2. You should see both domains listed:
   - `tatufortattoos.com` 
   - `www.tatufortattoos.com`

3. Status indicators:
   - ⏳ **Pending:** DNS not configured yet
   - ✅ **Valid:** DNS configured correctly and SSL active
   - ❌ **Error:** DNS misconfigured

### Check DNS Propagation

Use these tools to verify DNS is working:
- https://dnschecker.org
- https://www.whatsmydns.net

Enter `tatufortattoos.com` and check if it points to Vercel's servers.

---

## Step 4: SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt.

**Timeline:**
- Usually takes 5-10 minutes after DNS is configured
- Can take up to 24 hours in some cases

**Verify SSL:**
- Visit: `https://tatufortattoos.com`
- Look for the padlock icon in the browser
- Click padlock → Certificate → Should say "Let's Encrypt"

---

## Step 5: Test Your Domain

Once DNS propagates and SSL is active:

1. **Visit Your Domain**
   ```
   https://tatufortattoos.com
   ```

2. **Test Key Pages**
   - Homepage: https://tatufortattoos.com
   - Explore: https://tatufortattoos.com/explore
   - Login: https://tatufortattoos.com/login
   - About: https://tatufortattoos.com/about

3. **Check Redirect**
   - Visit: https://www.tatufortattoos.com
   - Should redirect to https://tatufortattoos.com (or vice versa)

---

## Troubleshooting

### Domain Shows "Deployment Not Found"

**Cause:** Domain is not properly connected to the project

**Fix:**
1. Go to Vercel → tatu-app → Settings → Domains
2. Verify domain is listed
3. Click "Refresh" or "Edit" → "Save"
4. Redeploy the project (Deployments → click "..." → "Redeploy")

### DNS Not Propagating

**Cause:** DNS changes can take 24-48 hours

**Check:**
1. Verify DNS records are correct in your registrar
2. Use https://dnschecker.org to check propagation status
3. Clear your browser cache
4. Try from a different network/device

### SSL Certificate Not Provisioning

**Cause:** DNS must be fully propagated first

**Fix:**
1. Wait for DNS to fully propagate (check dnschecker.org)
2. In Vercel Domains settings, click "Refresh"
3. If still failing after 24 hours, contact Vercel support

### "This site can't be reached"

**Cause:** DNS not configured or not propagated

**Fix:**
1. Double-check DNS records in your registrar
2. Make sure you're pointing to Vercel's servers
3. Wait for propagation (can take up to 48 hours)
4. Test using `dig tatufortattoos.com` or `nslookup tatufortattoos.com`

---

## Environment Variable Update

After domain is working, update this environment variable in Vercel:

```
NEXTAUTH_URL=https://tatufortattoos.com
```

**How to update:**
1. Vercel Dashboard → tatu-app → Settings → Environment Variables
2. Find `NEXTAUTH_URL`
3. Click "Edit"
4. Change value to: `https://tatufortattoos.com`
5. Click "Save"
6. Redeploy the project

---

## Common Domain Registrars

### GoDaddy
1. Log in to GoDaddy
2. My Products → Domains → tatufortattoos.com → Manage
3. DNS → Manage Zones
4. Add/Edit records as shown above

### Namecheap
1. Log in to Namecheap
2. Domain List → Manage (next to tatufortattoos.com)
3. Advanced DNS tab
4. Add/Edit records as shown above

### Google Domains
1. Log in to Google Domains
2. My domains → tatufortattoos.com
3. DNS tab
4. Add/Edit records as shown above

### Cloudflare
1. Log in to Cloudflare
2. Select tatufortattoos.com
3. DNS tab
4. Add/Edit records as shown above
5. **Important:** Set Proxy Status to "DNS only" (gray cloud)

---

## Quick Commands to Test

```bash
# Check DNS A record
dig tatufortattoos.com A

# Check DNS CNAME record
dig www.tatufortattoos.com CNAME

# Check from specific DNS server
dig @8.8.8.8 tatufortattoos.com

# Check if site is reachable
curl -I https://tatufortattoos.com
```

---

## Summary

1. ✅ Add domain in Vercel Dashboard
2. ✅ Configure DNS at your registrar
3. ⏳ Wait for DNS propagation (24-48 hours)
4. ✅ Verify SSL certificate is active
5. ✅ Update `NEXTAUTH_URL` environment variable
6. ✅ Test the domain

**Current Branch:** `merger-test-2`  
**All fixes are pushed and ready!**

Once DNS propagates, your site will be live at https://tatufortattoos.com 🎉

