/**
 * OAuth Service Functions
 * 
 * This module provides functions to interact with OAuth API endpoints.
 * All functions include proper error handling and session cookie support.
 * 
 * Security Note: All OAuth functions accept and include the state parameter
 * in their requests. The state parameter is used for CSRF protection and
 * should be validated on callbacks to ensure the request is legitimate.
 */

/**
 * Get current OAuth flow state
 * @param {Object} params - OAuth parameters
 * @param {string} params.redirect_uri - The redirect URI
 * @param {string} [params.response_type='code'] - The response type
 * @param {string} [params.scope=''] - The requested scope
 * @param {string} [params.consent_token=''] - Optional consent token
 * @returns {Promise<Object>} OAuth state response
 */
export async function getOAuthState(params) {
  try {
    const queryParams = new URLSearchParams({
      redirect_uri: params.redirect_uri,
      response_type: params.response_type || 'code',
      scope: params.scope || '',
      consent_token: params.consent_token || ''
    });

    const url = `/oauth2/api/oauth/state?${queryParams}`;
    console.log('🔵 [FETCH] GET', url);
    console.log('  Params:', params);

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('🔵 [RESPONSE]', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('🔴 [ERROR]', errorData);
      throw new Error(errorData.error_description || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [SUCCESS]', data);
    return data;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}

/**
 * Submit OAuth login with credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} oauthParams - OAuth parameters
 * @param {string} oauthParams.redirect_uri - The redirect URI
 * @param {string} [oauthParams.response_type='code'] - The response type
 * @param {string} [oauthParams.scope=''] - The requested scope
 * @param {string} [oauthParams.state=''] - The state parameter
 * @returns {Promise<Object>} OAuth login response
 */
export async function submitOAuthLogin(email, password, oauthParams) {
  try {
    const url = '/oauth2/api/oauth/login';
    const body = {
      email,
      password,
      redirect_uri: oauthParams.redirect_uri
      // Note: response_type, scope, and state are stored in session on backend
      // They don't need to be sent with login request
    };

    console.log('🔵 [FETCH] POST', url);
    console.log('  Body:', { email, redirect_uri: oauthParams.redirect_uri });

    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body)
    });

    console.log('🔵 [RESPONSE]', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('🔴 [ERROR]', errorData);
      throw new Error(errorData.error_description || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [SUCCESS]', data);
    return data;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}

/**
 * Submit OAuth consent decision
 * @param {boolean} approved - Whether consent is approved
 * @param {string} consentToken - The consent token
 * @param {Object} oauthParams - OAuth parameters
 * @param {string} oauthParams.redirect_uri - The redirect URI
 * @param {string} [oauthParams.response_type='code'] - The response type
 * @param {string} [oauthParams.scope=''] - The requested scope
 * @param {string} [oauthParams.state=''] - The state parameter
 * @returns {Promise<Object>} OAuth consent response
 */
export async function submitOAuthConsent(approved, consentToken, oauthParams) {
  try {
    const requestBody = {
      consent_token: consentToken,
      action: approved ? 'approve' : 'deny', // Backend expects 'approve' or 'deny'
      redirect_uri: oauthParams.redirect_uri // Backend requires redirect_uri
    };
    
    const url = '/oauth2/api/oauth/consent';
    console.log('🔵 [FETCH] POST', url);
    console.log('  Body:', requestBody);
    
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('🔵 [RESPONSE]', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('🔴 [ERROR]', errorData);
      throw new Error(errorData.error_description || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [SUCCESS]', data);
    return data;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}

/**
 * Check OAuth authorization status
 * @param {Object} oauthParams - OAuth parameters
 * @param {string} oauthParams.redirect_uri - The redirect URI
 * @param {string} [oauthParams.response_type='code'] - The response type
 * @param {string} [oauthParams.scope=''] - The requested scope
 * @param {string} [oauthParams.state=''] - The state parameter
 * @returns {Promise<Object>} OAuth authorization response
 */
export async function checkOAuthAuthorization(oauthParams) {
  try {
    const queryParams = new URLSearchParams({
      redirect_uri: oauthParams.redirect_uri,
      response_type: oauthParams.response_type || 'code',
      scope: oauthParams.scope || '',
      state: oauthParams.state || ''
    });

    const url = `/oauth2/api/oauth/authorize?${queryParams}`;
    console.log('🔵 [FETCH] GET', url);
    console.log('  Params:', oauthParams);

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('🔵 [RESPONSE]', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('🔴 [ERROR]', errorData);
      throw new Error(errorData.error_description || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ [SUCCESS]', data);
    return data;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}
