export async function loginWithEmailPassword(email, password, remember) { }

/**
 * Login with Google
 * @param {Object} [oauthParams] - Optional OAuth parameters to preserve through social auth flow
 * @param {string} [oauthParams.redirect_uri] - The redirect URI
 * @param {string} [oauthParams.response_type] - The response type
 * @param {string} [oauthParams.scope] - The requested scope
 * @param {string} [oauthParams.state] - The state parameter
 */
export async function loginWithGoogle(oauthParams) {
  console.log('=== loginWithGoogle called ===');
  console.log('oauthParams:', oauthParams);

  // Store callback context in sessionStorage (will be read after redirect)
  const contextData = {
    callback_url: window.location.origin,
    ...(oauthParams || {})
  };
  sessionStorage.setItem('oauth_callback_context', JSON.stringify(contextData));

  // If we have OAuth parameters, pass them through the state parameter
  if (oauthParams && oauthParams.redirect_uri) {
    // Encode OAuth context as base64 JSON (backend expects this format)
    const stateData = {
      redirect_uri: oauthParams.redirect_uri,
      response_type: oauthParams.response_type || 'code',
      scope: oauthParams.scope || '',
      state: oauthParams.state || ''
    };
    const encodedState = encodeURIComponent(btoa(JSON.stringify(stateData)));

    console.log('OAuth context to encode:', stateData);
    console.log('Encoded state:', encodedState);

    const googleUrl = `/oauth2/api/Auth/google?state=${encodedState}`;
    console.log('Full Google OAuth URL:', window.location.origin + googleUrl);
    console.log('Redirecting to Google OAuth...');
    window.location.href = googleUrl;
  } else {
    console.log('No OAuth params - regular Google login');
    console.log('Redirecting to:', window.location.origin + '/oauth2/api/Auth/google');
    // Regular Google OAuth without OAuth context
    window.location.href = '/oauth2/api/Auth/google';
  }
}

/**
 * Login with Apple
 * @param {Object} [oauthParams] - Optional OAuth parameters to preserve through social auth flow
 * @param {string} [oauthParams.redirect_uri] - The redirect URI
 * @param {string} [oauthParams.response_type] - The response type
 * @param {string} [oauthParams.scope] - The requested scope
 * @param {string} [oauthParams.state] - The state parameter
 */
export async function loginWithApple(oauthParams) {
  console.log('=== loginWithApple called ===');
  console.log('oauthParams:', oauthParams);

  // Store callback context in sessionStorage (will be read after redirect)
  const contextData = {
    callback_url: window.location.origin,
    ...(oauthParams || {})
  };
  sessionStorage.setItem('oauth_callback_context', JSON.stringify(contextData));

  // If we have OAuth parameters, pass them through the state parameter
  if (oauthParams && oauthParams.redirect_uri) {
    // Encode OAuth context as base64 JSON (backend expects this format)
    const stateData = {
      redirect_uri: oauthParams.redirect_uri,
      response_type: oauthParams.response_type || 'code',
      scope: oauthParams.scope || '',
      state: oauthParams.state || ''
    };
    const encodedState = encodeURIComponent(btoa(JSON.stringify(stateData)));

    console.log('OAuth context to encode:', stateData);
    console.log('Encoded state:', encodedState);

    const appleUrl = `/oauth2/api/Auth/apple?state=${encodedState}`;
    console.log('Full Apple OAuth URL:', window.location.origin + appleUrl);
    console.log('Redirecting to Apple OAuth...');
    window.location.href = appleUrl;
  } else {
    console.log('No OAuth params - regular Apple login');
    console.log('Redirecting to:', window.location.origin + '/oauth2/api/Auth/apple');
    // Regular Apple OAuth without OAuth context
    window.location.href = '/oauth2/api/Auth/apple';
  }
}

export async function signUpWithEmailPassword(fullName, username, email, password) {
  try {
    const url = '/oauth2/api/auth/signUp';
    const body = {
      name: fullName,
      email,
      password,
      username: username || email.split('@')[0] // Use provided username or email prefix as fallback
    };

    console.log('🔵 [FETCH] POST', url);
    console.log('  Body:', { name: fullName, email, username: body.username });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('🔵 [RESPONSE]', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('🔴 [ERROR]', errorData);
      throw new Error(errorData.message || 'Failed to sign up');
    }

    const data = await response.json();
    console.log('✅ [SUCCESS]', data);
    return data;
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email) {
  try {
    const url = '/oauth2/api/auth/forget-password';
    console.log('🔵 [FETCH] POST', url);
    console.log('  Body:', { email });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    console.log('🔵 [RESPONSE]', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('🔴 [ERROR]', errorData);
      throw new Error(errorData.message || 'Failed to send reset email');
    }

    const data = await response.json();
    console.log('✅ [SUCCESS]', data);
    return data;
  } catch (error) {
    console.error('Send password reset email error:', error);
    throw error;
  }
}

export async function verifyOtp(email, code) {
  try {
    const url = '/oauth2/api/auth/verify-otp';
    console.log('🔵 [FETCH] POST', url);
    console.log('  Body:', { otp: code });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otp: code }), // Backend expects 'otp' field only
    });

    console.log('🔵 [RESPONSE]', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('🔴 [ERROR]', errorData);
      throw new Error(errorData.message || 'Invalid OTP code');
    }

    const data = await response.json();
    console.log('✅ [SUCCESS]', data);
    return data;
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
}

export async function resendOtp(email) {
  try {
    const url = '/oauth2/api/auth/resend-otp';
    console.log('🔵 [FETCH] POST', url);
    console.log('  Body:', { email });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    console.log('🔵 [RESPONSE]', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('🔴 [ERROR]', errorData);
      throw new Error(errorData.message || 'Failed to resend OTP');
    }

    const data = await response.json();
    console.log('✅ [SUCCESS]', data);
    return data;
  } catch (error) {
    console.error('Resend OTP error:', error);
    throw error;
  }
}

export async function updatePassword(email, newPassword) {
  try {
    const url = '/oauth2/api/auth/change-forget-password';
    console.log('🔵 [FETCH] POST', url);
    console.log('  Body:', { email });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, newPassword }),
    });

    console.log('🔵 [RESPONSE]', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('🔴 [ERROR]', errorData);
      throw new Error(errorData.message || 'Failed to update password');
    }

    const data = await response.json();
    console.log('✅ [SUCCESS]', data);
    return data;
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
}
