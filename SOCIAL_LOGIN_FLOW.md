# Social Login Flow (Google/Apple)

## Overview
The Google and Apple login buttons now work with proper redirect handling for both web and Flutter apps.

## How It Works

### 1. User Clicks Google/Apple Button
- Frontend sends `state` parameter with `callback_url` (current origin)
- Redirects to `/api/Auth/google` or `/api/Auth/apple`

### 2. Backend Initiates OAuth
- Backend redirects to Google/Apple OAuth consent screen
- User logs in with their Google/Apple account

### 3. OAuth Provider Callback
- Google/Apple redirects back to backend callback URL
- Backend processes the authentication

### 4. Backend Redirects to Frontend
Based on user status, backend redirects to:

#### New User (needs username):
```
{callback_url}/auth/complete-registration?token={registration_token}&provider={google|apple}
```

#### Existing User in OAuth Flow (needs consent):
```
{callback_url}/oauth/consent?token={consent_token}
```

#### Existing User with Prior Consent:
```
{third_party_app_redirect_uri}?code={auth_code}
```

#### Regular Social Login:
```
{callback_url}/auth/success?token={jwt_token}
```

## For Flutter App Integration

### Deep Link Setup
The Flutter app should register a deep link scheme:
```
poswize://auth/success?token={token}
```

### Detection
The `AuthSuccess.jsx` page detects Flutter apps by checking:
```javascript
const isFlutterApp = /flutter/i.test(navigator.userAgent);
```

### Alternative: Custom Callback URL
When initiating login from Flutter, pass a custom callback URL:
```dart
// In Flutter, open this URL in WebView or browser
final url = 'https://your-domain.com/login?callback=poswize://auth/callback';
```

Then update the frontend to use the callback parameter:
```javascript
const urlParams = new URLSearchParams(window.location.search);
const customCallback = urlParams.get('callback');

const stateData = {
  callback_url: customCallback || window.location.origin,
  ...(oauthParams || {})
};
```

## Environment Variables

### Backend (.env)
```env
FRONTEND_URL=http://localhost:5173  # For development
# FRONTEND_URL=https://auth.poswize.com  # For production

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://poswize.com/testAPI/auth/google/callback

APPLE_CLIENT_ID=...
APPLE_TEAM_ID=...
APPLE_KEY_ID=...
APPLE_PRIVATE_KEY=...
APPLE_CALLBACK_URL=https://poswize.com/testAPI/auth/apple/callback
```

## Testing

### Web App
1. Start backend: `npm run start:dev` (port 3010)
2. Start frontend: `npm run dev` (port 5173)
3. Navigate to `http://localhost:5173/login`
4. Click Google or Apple button
5. Complete OAuth flow
6. Should redirect back to success page

### Flutter App
1. Configure deep link in Flutter app
2. Open login page in WebView with callback parameter
3. Complete OAuth flow
4. App should receive deep link with token

## Routes

### Frontend Routes
- `/login` - Login page with social buttons
- `/auth/complete-registration` - Username selection for new users
- `/auth/success` - Success page with token handling
- `/oauth/consent` - OAuth consent page for third-party apps

### Backend Routes
- `GET /Auth/google` - Initiates Google OAuth
- `GET /Auth/google/callback` - Handles Google callback
- `GET /Auth/apple` - Initiates Apple OAuth
- `POST /Auth/apple/callback` - Handles Apple callback
- `POST /Auth/complete-oauth-registration` - Completes new user registration
