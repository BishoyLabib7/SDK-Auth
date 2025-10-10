# Environment Configuration

This React app needs to know the backend API URL. There are multiple ways to configure it:

## Development (Running with Vite Dev Server)

Create a `.env.local` file in the `SDK-Auth` folder:

```env
VITE_API_BASE_URL=http://localhost:3010
```

Then run:
```bash
npm run dev
```

## Production Build

### Option 1: Set environment variable during build

**Linux/Mac (Bash):**
```bash
VITE_API_BASE_URL=https://poswize.com/testAPI npm run build
```

**Windows (PowerShell):**
```powershell
$env:VITE_API_BASE_URL="https://poswize.com/testAPI"; npm run build
```

**Windows (CMD):**
```cmd
set VITE_API_BASE_URL=https://poswize.com/testAPI && npm run build
```

### Option 2: Let backend inject it at runtime
If you don't set `VITE_API_BASE_URL`, the app will use `window.__API_BASE_URL__` which is injected by the NestJS backend when serving the app.

## Priority Order

The app looks for the API base URL in this order:

1. **`VITE_API_BASE_URL`** - Environment variable (set at build time)
2. **`window.__API_BASE_URL__`** - Injected by backend (via `/oauth/config.js`)
3. **`window.location.origin`** - Fallback to current domain

## Examples

### Development
```bash
# In SDK-Auth folder, create .env.local
echo "VITE_API_BASE_URL=http://localhost:3010" > .env.local
npm run dev
```

### Production Build for Deployment

**Windows PowerShell:**
```powershell
# Build with production API URL
$env:VITE_API_BASE_URL="https://poswize.com/testAPI"; npm run build

# Copy dist/oauth-ui to NestJS public folder (if in same repo)
# If in different repos, copy manually or use CI/CD pipeline
```

**Linux/Mac:**
```bash
# Build with production API URL
VITE_API_BASE_URL=https://poswize.com/testAPI npm run build

# Copy dist/oauth-ui to NestJS public folder (if in same repo)
# If in different repos, copy manually or use CI/CD pipeline
```

### Testing the Build Locally

**Windows PowerShell:**
```powershell
# Build with local API URL
$env:VITE_API_BASE_URL="http://localhost:3010"; npm run build

# Preview the build
npm run preview
```

**Linux/Mac:**
```bash
# Build with local API URL
VITE_API_BASE_URL=http://localhost:3010 npm run build

# Preview the build
npm run preview
```

## Verifying Configuration

Open browser console and check for:
```
Using API_BASE_URL: http://localhost:3010
```

This confirms which API URL is being used.

