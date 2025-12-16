# Custom Domain Setup Guide

This guide explains how to connect your custom domain to your Next.js application.

## Prerequisites
- A custom domain registered with a domain registrar (e.g., DreamHost, GoDaddy, Namecheap, Google Domains)
- Your website deployed on a hosting platform (Vercel, Netlify, etc.)

## Important: Domain Registrar vs Hosting Provider

**DreamHost Users:** DreamHost is both a domain registrar AND a hosting provider. However, for Next.js applications:
- ✅ **Recommended:** Keep your domain registered at DreamHost, but host your Next.js app on Vercel (or another Node.js-friendly platform)
- ⚠️ **Not Recommended:** DreamHost's shared hosting is PHP-focused and won't work well with Next.js
- 💡 **Alternative:** DreamHost VPS can run Node.js, but requires more setup and server management

**The Solution:** Register your domain at DreamHost, host your app on Vercel, and point DreamHost's DNS to Vercel. This is the standard approach and works perfectly!

### What "DNS Only" Means (DreamHost)

If DreamHost shows your domain as **"DNS Only"**, this is perfect! It means:
- ✅ Your domain is registered with DreamHost
- ✅ DreamHost is managing your DNS records
- ✅ No DreamHost hosting is active (which is what you want)
- ✅ You can point DNS to any hosting provider (like Vercel)

**This is the ideal setup** for hosting on Vercel. You don't need to change anything about the "DNS Only" status - just update the DNS records to point to Vercel.

### Domain Registration vs DNS Management - Important Distinction

**Domain Registration** (stays with DreamHost):
- This is who you pay for your domain (annual renewal fee)
- DreamHost is your registrar
- You keep renewing with DreamHost
- **No transfer needed!**

**DNS Management** (can point anywhere):
- This is where your domain's DNS records are configured
- You can manage DNS at DreamHost and point it to Vercel
- Vercel doesn't charge for hosting your site or providing SSL
- **This is free!**

**Bottom Line:** You keep your domain registered at DreamHost (and pay DreamHost for renewals), but point the DNS to Vercel (which is free for hosting). No transfer, no additional domain fees to Vercel.

## Option 1: Vercel (Recommended for Next.js)

### Step 1: Add Domain in Vercel Dashboard

**Important:** Adding your domain to Vercel does NOT transfer your domain registration. You keep your domain registered at DreamHost and continue paying DreamHost for renewals. Vercel only needs to verify you control the domain so they can host your site and provide SSL certificates.

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`tatu-app`)
3. Navigate to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter your domain (e.g., `yourdomain.com`)
6. Vercel will also suggest adding `www.yourdomain.com` - add both
7. Vercel will show you the DNS records you need to add (but won't charge you anything)

### Step 2: Configure DNS Records

Vercel will provide you with specific DNS records to add. Here's what you'll typically need:

#### For Apex Domain (yourdomain.com):
- **Type:** A Record
- **Name:** @ (or leave blank)
- **Value:** `76.76.21.21` (or the IP address Vercel provides)
- **TTL:** 3600 (or default)

#### For www Subdomain (www.yourdomain.com):
- **Type:** CNAME Record
- **Name:** www
- **Value:** `cname.vercel-dns.com` (or the value Vercel provides)
- **TTL:** 3600 (or default)

### Step 3: Add DNS Records at Your Domain Registrar

#### For DreamHost Users:

1. Log into your [DreamHost Panel](https://panel.dreamhost.com)
2. Navigate to **Domains** → **Manage Domains**
3. Click on your domain name
4. Click the **DNS** tab (or "DNS" link next to your domain)
5. You'll see existing DNS records - you may need to remove conflicting ones
6. Add the DNS records provided by Vercel:
   - **For Apex Domain (`yourdomain.com`):**
     - Click **Add Record**
     - **Type:** A
     - **Name:** @ (or leave blank for root domain)
     - **Value:** The IP address Vercel provides (e.g., `76.76.21.21`)
     - **TTL:** 3600 (or default)
   - **For www Subdomain (`www.yourdomain.com`):**
     - Click **Add Record**
     - **Type:** CNAME
     - **Name:** www
     - **Value:** The CNAME value Vercel provides (e.g., `cname.vercel-dns.com`)
     - **TTL:** 3600 (or default)
7. **Important:** Remove any existing A or CNAME records that conflict with these
8. Save changes

**Note:** DreamHost may have default DNS records. You can keep MX records (for email) but may need to remove or update A/CNAME records that point to DreamHost's servers.

#### For Other Registrars:

1. Log into your domain registrar's dashboard
2. Find DNS Management or DNS Settings
3. Add the records provided by Vercel
4. Save changes

### Step 4: Wait for DNS Propagation

- DNS changes can take 24-48 hours to propagate globally
- Vercel will show the status in the dashboard
- You can check propagation status at [whatsmydns.net](https://www.whatsmydns.net)

### Step 5: SSL Certificate

- Vercel automatically provisions SSL certificates via Let's Encrypt
- This happens automatically once DNS is configured correctly
- Your site will be accessible via HTTPS

## Option 2: GitHub Pages (Static Export Only)

⚠️ **Note:** GitHub Pages only hosts static sites. Your Next.js app has server-side features (API routes, authentication), so this requires exporting as a static site.

### If you want to use GitHub Pages:

1. **Export Next.js as Static Site:**
   - Modify `next.config.js` to add `output: 'export'`
   - This will disable server-side features

2. **Create CNAME File:**
   - Create a file named `CNAME` in your repository root
   - Add your domain name (e.g., `yourdomain.com`)

3. **Configure GitHub Pages:**
   - Go to repository Settings → Pages
   - Select source branch (usually `main` or `gh-pages`)
   - Save

4. **Configure DNS:**
   - Add CNAME record: `www` → `yourusername.github.io`
   - For apex domain, use GitHub's special IP addresses:
     - A Record: `185.199.108.153`
     - A Record: `185.199.109.153`
     - A Record: `185.199.110.153`
     - A Record: `185.199.111.153`

## Option 3: Other Hosting Providers

### Netlify
1. Add domain in Netlify dashboard
2. Configure DNS as instructed by Netlify
3. Similar process to Vercel

### AWS/Other Cloud Providers
- Follow provider-specific documentation
- Typically involves:
  - Configuring DNS records
  - Setting up load balancers or CDN
  - Configuring SSL certificates

## Troubleshooting

### Domain Not Working?
1. **Check DNS Propagation:**
   - Use [whatsmydns.net](https://www.whatsmydns.net) to check if DNS has propagated
   - Wait up to 48 hours for full propagation

2. **Verify DNS Records:**
   - Double-check that records are entered correctly
   - Ensure no typos in domain names or IP addresses

3. **Check SSL Certificate:**
   - Wait for SSL certificate to be issued (usually automatic)
   - Can take a few minutes to a few hours

4. **Clear Browser Cache:**
   - Try accessing in incognito/private mode
   - Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

### Common Issues

- **"Invalid Configuration"**: See `FIX_INVALID_CONFIGURATION.md` for detailed troubleshooting steps. Usually means DNS records are incorrect or not propagated yet.
- **"Domain not verified"**: Wait for DNS propagation
- **"SSL certificate pending"**: Wait 5-60 minutes after DNS is configured
- **"Site not loading"**: Check that your deployment is successful and DNS records are correct

## Next Steps

After your domain is configured:
1. **Deploy to Production:** See `DEPLOY_TO_PRODUCTION.md` for deployment instructions
2. Update your `NEXTAUTH_URL` environment variable to use your custom domain (`https://tatufortattoos.com`)
3. Update any hardcoded URLs in your application
4. Test all functionality to ensure everything works with the new domain
5. Consider setting up redirects (e.g., redirect `www` to non-www or vice versa)

**Important:** If Vercel says "Your domain is properly configured, but you don't have a production deployment", you need to deploy your app. See `DEPLOY_TO_PRODUCTION.md` for step-by-step instructions.

## Need Help?

- Vercel Docs: https://vercel.com/docs/concepts/projects/domains
- GitHub Pages Docs: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site


