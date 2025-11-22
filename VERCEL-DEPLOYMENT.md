# Vercel Deployment Guide for VESIRON Tech Library PWA

## Deployment Settings

When deploying on Vercel, use these settings:

### 1. Framework Preset
- **Select:** "Other" or "Static Site"
- (No build framework needed - this is a static PWA)

### 2. Root Directory
- **Set to:** `./` (current directory)
- This is correct by default

### 3. Build and Output Settings
- **Build Command:** Leave empty (no build needed)
- **Output Directory:** Leave empty or set to `./`
- **Install Command:** Leave empty (no dependencies to install for deployment)

### 4. Environment Variables
- **None required** for this PWA

## Important Notes

✅ **HTTPS is Automatic:** Vercel provides HTTPS by default, which is required for PWA service workers.

✅ **Service Worker:** The `vercel.json` configuration ensures the service worker is served with correct headers.

✅ **Manifest:** The manifest file is configured with proper content-type headers.

## After Deployment

1. **Test Installability:**
   - Open your Vercel URL in Chrome
   - Check for install prompt
   - Test on mobile devices

2. **Verify Service Worker:**
   - Open DevTools → Application → Service Workers
   - Should show as "activated and is running"

3. **Test Offline:**
   - DevTools → Network → Check "Offline"
   - Navigate between pages - should work offline

## Deployment URL

After deployment, your PWA will be available at:
`https://your-project-name.vercel.app`

This HTTPS URL enables full PWA functionality including installation!

