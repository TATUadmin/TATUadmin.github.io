# Fix "Invalid Configuration" Error for tatufortattoos.com

## What "Invalid Configuration" Means

This error on Vercel means that Vercel cannot verify your domain's DNS records are correctly pointing to Vercel's servers.

## Step-by-Step Fix

### Step 1: Check Current DNS Records at DreamHost

1. Log into [DreamHost Panel](https://panel.dreamhost.com)
2. Go to **Domains** → **Manage Domains**
3. Click on **tatufortattoos.com**
4. Click the **DNS** tab
5. Note all existing A and CNAME records

### Step 2: Get Correct DNS Records from Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Domains**
4. Click on **tatufortattoos.com**
5. Vercel will show you the exact DNS records needed
6. **Important:** Copy these exact values - they may differ from generic examples

### Step 3: Update DNS Records at DreamHost

#### Remove Conflicting Records First:

1. In DreamHost DNS tab, look for any existing A records for `@` (root domain)
2. Look for any CNAME records for `www`
3. **Delete or remove** any that point to DreamHost's servers or other IPs

#### Add Correct Records:

**For Root Domain (tatufortattoos.com):**
1. Click **Add Record**
2. **Type:** A
3. **Name:** @ (or leave blank - this means root domain)
4. **Value:** The IP address Vercel provides (typically `76.76.21.21` but use what Vercel shows)
5. **TTL:** 3600 (or default)
6. Click **Add Record**

**For www Subdomain (www.tatufortattoos.com):**
1. Click **Add Record**
2. **Type:** CNAME
3. **Name:** www
4. **Value:** The CNAME value Vercel provides (typically `cname.vercel-dns.com` but use what Vercel shows)
5. **TTL:** 3600 (or default)
6. Click **Add Record**

### Step 4: Verify DNS Records

After adding the records, verify they're correct:

1. **Check at DreamHost:** Make sure the records show the correct values
2. **Check DNS Propagation:** Use [whatsmydns.net](https://www.whatsmydns.net/#A/tatufortattoos.com) to see if DNS has propagated
3. **Check at Vercel:** Go back to Vercel dashboard and click "Refresh" or wait a few minutes

### Step 5: Wait for Propagation

- DNS changes can take 5 minutes to 48 hours
- Usually takes 15-60 minutes
- Vercel will automatically check periodically

### Step 6: Refresh in Vercel

1. Go to Vercel Dashboard → Settings → Domains
2. Click on **tatufortattoos.com**
3. Look for a "Refresh" or "Recheck" button
4. Click it to force Vercel to re-verify

## Common Issues and Solutions

### Issue: "Domain not verified"
**Solution:** Wait for DNS propagation (up to 48 hours). Check DNS propagation status.

### Issue: "SSL certificate pending"
**Solution:** This is normal. SSL certificates are issued automatically after DNS is verified. Wait 5-60 minutes.

### Issue: DNS records look correct but still shows error
**Solution:**
1. Double-check for typos in the DNS values
2. Make sure you removed conflicting records
3. Wait longer for propagation
4. Try removing and re-adding the domain in Vercel

### Issue: Multiple conflicting A records
**Solution:** You should only have ONE A record for the root domain pointing to Vercel. Remove any others.

### Issue: CNAME conflict with A record
**Solution:** For the root domain, use an A record. For www, use a CNAME. Don't mix them for the same name.

## Quick Checklist

- [ ] Removed old/conflicting DNS records at DreamHost
- [ ] Added A record for root domain (@) with Vercel's IP
- [ ] Added CNAME record for www with Vercel's CNAME value
- [ ] Verified records are saved at DreamHost
- [ ] Waited at least 15 minutes for DNS propagation
- [ ] Refreshed domain status in Vercel dashboard
- [ ] Checked DNS propagation at whatsmydns.net

## Still Not Working?

If after 48 hours it's still showing "invalid configuration":

1. **Contact Vercel Support:** They can check their logs and see what's wrong
2. **Verify DNS Records:** Use `dig tatufortattoos.com` or `nslookup tatufortattoos.com` to verify DNS
3. **Check for Typos:** Double-check every character in the DNS records
4. **Try Removing and Re-adding:** Remove the domain from Vercel, wait 5 minutes, then add it back

## Expected DNS Records (Example - Use Vercel's Exact Values)

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

**Remember:** Always use the exact values Vercel provides in your dashboard, not these examples!

