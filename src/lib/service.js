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
    
    const googleUrl = `/api/Auth/google?state=${encodedState}`;
    console.log('Full Google OAuth URL:', window.location.origin + googleUrl);
    console.log('Redirecting to Google OAuth...');
    window.location.href = googleUrl;
  } else {
    console.log('No OAuth params - regular Google login');
    console.log('Redirecting to:', window.location.origin + '/api/Auth/google');
    // Regular Google OAuth without OAuth context
    window.location.href = '/api/Auth/google';
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
  // Store callback context in sessionStorage (will be read after redirect)
  const contextData = {
    callback_url: window.location.origin,
    ...(oauthParams || {})
  };
  sessionStorage.setItem('oauth_callback_context', JSON.stringify(contextData));

  // If we have OAuth parameters, pass them through the state parameter
  if (oauthParams && oauthParams.redirect_uri) {
    const stateData = {
      redirect_uri: oauthParams.redirect_uri,
      response_type: oauthParams.response_type || 'code',
      scope: oauthParams.scope || '',
      state: oauthParams.state || ''
    };
    const encodedState = encodeURIComponent(btoa(JSON.stringify(stateData)));
    window.location.href = `/api/Auth/apple?state=${encodedState}`;
  } else {
    // Regular Apple OAuth without OAuth context
    window.location.href = '/api/Auth/apple';
  }
}

export async function signUpWithEmailPassword(fullName, email, password) {
  try {
    const response = await fetch('/api/auth/signUp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fullName,
        email,
        password,
        username: email.split('@')[0] // Use email prefix as username
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to sign up');
    }

    return await response.json();
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email) {
  try {
    const response = await fetch('/api/auth/forget-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to send reset email');
    }

    return await response.json();
  } catch (error) {
    console.error('Send password reset email error:', error);
    throw error;
  }
}

export async function verifyOtp(email, code) {
  try {
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otp: code }), // Backend expects 'otp' field only
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Invalid OTP code');
    }

    return await response.json();
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
}

export async function resendOtp(email) {
  try {
    const response = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to resend OTP');
    }

    return await response.json();
  } catch (error) {
    console.error('Resend OTP error:', error);
    throw error;
  }
}

export async function updatePassword(email, newPassword) {
  try {
    const response = await fetch('/api/auth/change-forget-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update password');
    }

    return await response.json();
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
}
