# OAuth Context Management

## Overview

The OAuth context management system provides a centralized way to manage OAuth session data throughout the React SDK. It handles OAuth session initialization, persistence across page navigation, and provides convenient hooks for components to access OAuth state.

## Files Created

1. **OAuthContext.jsx** - Main context provider
2. **useOAuthSession.js** - Custom hook for OAuth session management

## Usage

### 1. Wrap your app with OAuthProvider

```jsx
import { OAuthProvider } from './contexts/OAuthContext';

function App() {
  return (
    <OAuthProvider>
      {/* Your app components */}
    </OAuthProvider>
  );
}
```

### 2. Use the useOAuthSession hook in components

```jsx
import { useOAuthSession } from './hooks/useOAuthSession';

function LoginPage() {
  const {
    session,
    appName,
    redirectUri,
    loading,
    error,
    isOAuthFlow,
    getOAuthParams,
    buildSocialAuthUrl,
  } = useOAuthSession();

  if (loading) {
    return <div>Loading OAuth session...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (isOAuthFlow) {
    return (
      <div>
        <h1>Login to authorize {appName}</h1>
        {/* Login form */}
      </div>
    );
  }

  return <div>Regular login page</div>;
}
```

## Features

### OAuthProvider

- **Automatic session loading**: Loads OAuth session from URL parameters on mount
- **Session persistence**: Stores session in sessionStorage for navigation
- **Error handling**: Provides error state for failed session loads
- **Loading states**: Tracks loading state during session initialization

### useOAuthSession Hook

Returns:
- `session` - Full OAuth session object
- `appName` - Name of the requesting application
- `appDomain` - Domain of the requesting application
- `redirectUri` - OAuth redirect URI
- `scope` - Requested OAuth scopes
- `loading` - Loading state (boolean)
- `error` - Error message (string or null)
- `isOAuthFlow` - Whether currently in OAuth flow (boolean)
- `loadSession()` - Manually load session from URL
- `refreshSession()` - Refresh session from backend
- `updateSession(updates)` - Update session data
- `clearSession()` - Clear session data
- `getOAuthParams()` - Get OAuth parameters for API calls
- `buildSocialAuthUrl(provider, baseUrl)` - Build social auth URL with OAuth context

## Session Data Structure

```javascript
{
  redirectUri: string,      // OAuth redirect URI
  appName: string,          // Application name
  appDomain: string,        // Application domain
  scope: string,            // Requested scopes
  responseType: string,     // OAuth response type (usually 'code')
}
```

## Requirements Satisfied

- **Requirement 5.1**: Session and state management - OAuth flow maintains secure session state
- **Requirement 5.2**: Session validation - Context validates and manages session throughout the flow

## Integration with Other Components

The OAuth context should be used by:
- Login component (task 9)
- Signup component (task 10)
- OAuthConsent component (task 7)
- OAuthUsernameSelection component (task 8)

All these components can use `useOAuthSession()` to access OAuth context and determine if they're in an OAuth flow.
