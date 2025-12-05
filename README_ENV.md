# Environment Variables Configuration

## File Priority

Vite loads environment variables in this order (later files override earlier ones):
1. `.env` - Default for all environments
2. `.env.local` - Local overrides (gitignored, for your local machine)
3. `.env.[mode]` - Mode-specific (e.g., `.env.development`, `.env.production`)
4. `.env.[mode].local` - Mode-specific local overrides

## Current Setup

- **`.env`** - Contains production URL (for reference)
- **`.env.local`** - Contains local development URL (for your machine)
- **`.env.production`** - Contains production URL

## For Local Development

The `.env.local` file should contain:
```env
VITE_API_URL=http://localhost:8000/api
```

This file is gitignored, so it won't affect other developers or production.

## For Production

The `.env.production` file contains:
```env
VITE_API_URL=https://infspsb.com/api
```

## Restart Dev Server

After changing environment variables, **restart your Vite dev server**:
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## Troubleshooting

If the API URL is still wrong:
1. Check which file is being used: Look at console logs
2. Restart the dev server
3. Clear browser cache
4. Check that `.env.local` exists and has the correct URL

