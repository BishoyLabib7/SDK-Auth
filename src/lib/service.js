// API Base URL Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010';

// Helper function for API calls with error handling
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return { success: true };
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    // Network errors or timeouts
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    throw error;
  }
}

// ============================================================================
// OAuth Session Management
// ============================================================================

/**
 * Get OAuth session data for initializing the OAuth flow
 * @param {string} redirectUri - The OAuth redirect URI
 * @param {string} responseType - OAuth response type (default: 'code')
 * @param {string} scope - Requested OAuth scopes
 * @returns {Promise<Object>} OAuth session data
 */
export async function getOAuthSession(redirectUri, responseType = 'code', scope = '') {
  const params = new URLSearchParams({
    redirect_uri: redirectUri,
    response_type: responseType,
  });

  if (scope) {
    params.append('scope', scope);
  }

  return apiCall(`/oauth/session?${params.toString()}`, {
    method: 'GET',
  });
}

// ============================================================================
// OAuth Authentication Functions
// ============================================================================

/**
 * Authenticate user for OAuth flow (login or signup)
 * @param {string} action - 'login' or 'signup'
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} redirectUri - OAuth redirect URI
 * @param {string} name - User name (required for signup)
 * @param {string} username - Username (optional for signup)
 * @returns {Promise<Object>} Authentication result with consent token or redirect URL
 */
export async function authenticateForOAuth(action, email, password, redirectUri, name = '', username = '') {
  const payload = {
    action,
    email,
    password,
    redirectUri,
  };

  if (action === 'signup') {
    payload.name = name;
    if (username) {
      payload.username = username;
    }
  }

  return apiCall('/oauth/authenticate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ============================================================================
// OAuth Consent Management
// ============================================================================

/**
 * Get user profile data for consent page
 * @param {string} consentToken - Temporary consent token
 * @returns {Promise<Object>} User and app information for consent page
 */
export async function getUserProfileForConsent(consentToken) {
  return apiCall(`/oauth/user-profile?consent_token=${encodeURIComponent(consentToken)}`, {
    method: 'GET',
  });
}

/**
 * Submit consent decision (approve or deny)
 * @param {string} action - 'approve' or 'deny'
 * @param {string} consentToken - Temporary consent token
 * @param {string} redirectUri - OAuth redirect URI
 * @returns {Promise<Object>} Result with redirect URL
 */
export async function submitConsent(action, consentToken, redirectUri) {
  return apiCall('/oauth/consent', {
    method: 'POST',
    body: JSON.stringify({
      action,
      consent_token: consentToken,
      redirect_uri: redirectUri,
    }),
  });
}

// ============================================================================
// Social Auth Registration Functions
// ============================================================================

// Debounce helper
let usernameCheckTimeout = null;

/**
 * Check username availability with debouncing
 * @param {string} username - Username to check
 * @param {number} delay - Debounce delay in milliseconds (default: 500)
 * @returns {Promise<Object>} Availability result
 */
export async function checkUsernameAvailability(username, delay = 500) {
  return new Promise((resolve, reject) => {
    // Clear previous timeout
    if (usernameCheckTimeout) {
      clearTimeout(usernameCheckTimeout);
    }

    // Set new timeout for debouncing
    usernameCheckTimeout = setTimeout(async () => {
      try {
        const result = await apiCall(`/auth/check-username/${encodeURIComponent(username)}`, {
          method: 'GET',
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
}

/**
 * Complete OAuth registration for social auth users
 * @param {string} registrationToken - Temporary registration token
 * @param {string} username - Chosen username
 * @returns {Promise<Object>} Registration result with consent token
 */
export async function completeOAuthRegistration(registrationToken, username) {
  return apiCall('/oauth/complete-registration', {
    method: 'POST',
    body: JSON.stringify({
      registrationToken,
      username,
    }),
  });
}

// ============================================================================
// Social Auth Initiation Functions
// ============================================================================

/**
 * Initiate Google OAuth flow with OAuth context
 * @param {string} oauthRedirectUri - Original OAuth redirect URI
 * @param {string} oauthState - OAuth state parameter
 * @returns {string} Google OAuth URL
 */
export function initiateGoogleOAuth(oauthRedirectUri, oauthState) {
  const params = new URLSearchParams({
    oauth_redirect_uri: oauthRedirectUri,
    oauth_state: oauthState,
  });

  const url = `${API_BASE_URL}/auth/google?${params.toString()}`;
  return url;
}

/**
 * Initiate Apple OAuth flow with OAuth context
 * @param {string} oauthRedirectUri - Original OAuth redirect URI
 * @param {string} oauthState - OAuth state parameter
 * @returns {string} Apple OAuth URL
 */
export function initiateAppleOAuth(oauthRedirectUri, oauthState) {
  const params = new URLSearchParams({
    oauth_redirect_uri: oauthRedirectUri,
    oauth_state: oauthState,
  });

  const url = `${API_BASE_URL}/auth/apple?${params.toString()}`;
  return url;
}

// ============================================================================
// Existing Authentication Functions
// ============================================================================

export async function loginWithEmailPassword(email, password, remember) { }

export async function loginWithGoogle() { }

export async function loginWithApple() { }

export async function signUpWithEmailPassword(fullName, email, password) { }

export async function sendPasswordResetEmail(email) { }

export async function verifyOtp(email, code) { }

export async function resendOtp(email) { }

export async function updatePassword(newPassword) { }
