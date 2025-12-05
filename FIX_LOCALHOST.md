# 🔧 Fix Localhost API URL Issue

## Problem
Even on localhost, the app is trying to use the production URL `https://infspsb.com/api/admin/years`

## Solution Applied

The code now **FORCES localhost** when running on `localhost:5173`, regardless of environment variables.

## Steps to Fix

### 1. Stop the Dev Server
Press `Ctrl+C` in the terminal where `npm run dev` is running

### 2. Clear Browser Cache
- Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or open DevTools → Application → Clear Storage → Clear site data

### 3. Restart Dev Server
```bash
cd frontend
npm run dev
```

### 4. Check Browser Console
Open DevTools (F12) and look for:
```
🔵 Localhost detected - FORCING localhost API URL: http://localhost:8000/api
```

If you see this, it's working correctly!

## Verification

After restarting, the console should show:
```
=== API Configuration ===
Hostname: localhost
Port: 5173
Is Dev: true
VITE_API_URL env: https://infspsb.com/api/public/index.php/api
Final API Base URL: http://localhost:8000/api
========================
```

Notice that even though `VITE_API_URL env` shows the production URL, the `Final API Base URL` should be `http://localhost:8000/api`.

## If Still Not Working

1. **Hard refresh the browser**: `Ctrl+Shift+R` or `Cmd+Shift+R`
2. **Check the console logs** - look for the emoji indicators (🔵, 🟢, 🟡, 🔴)
3. **Verify backend is running**: Make sure `php artisan serve` is running on port 8000
4. **Check Network tab**: In DevTools → Network, see what URL is actually being called

## Current Environment Files

- `.env` - Has production URL (this is OK, it's overridden)
- `.env.local` - Has localhost URL (for your machine)
- Code now forces localhost when on `localhost:5173`

---

**The fix is in the code - just restart the dev server!**

