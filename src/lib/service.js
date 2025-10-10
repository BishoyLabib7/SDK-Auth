// API base URL - will be set by the backend
const API_BASE_URL = window.__API_BASE_URL__ || '';

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

export async function loginWithEmailPassword(email, password, remember) {
  // Get redirect URI from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUri = urlParams.get('redirect_uri') || 'http://localhost:3001/auth/poswize/callback';
  
  // Create a form and submit it to trigger a browser redirect
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = `${API_BASE_URL}/oauth/login`;
  form.style.display = 'none';
  
  const emailInput = document.createElement('input');
  emailInput.type = 'hidden';
  emailInput.name = 'email';
  emailInput.value = email;
  
  const passwordInput = document.createElement('input');
  passwordInput.type = 'hidden';
  passwordInput.name = 'password';
  passwordInput.value = password;
  
  const redirectInput = document.createElement('input');
  redirectInput.type = 'hidden';
  redirectInput.name = 'redirect_uri';
  redirectInput.value = redirectUri;
  
  form.appendChild(emailInput);
  form.appendChild(passwordInput);
  form.appendChild(redirectInput);
  
  document.body.appendChild(form);
  form.submit();
  
  // This function doesn't return anything because the form submission causes a page redirect
}

export async function loginWithGoogle() {
  // Get redirect URI from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUri = urlParams.get('redirect_uri') || 'http://localhost:3001/auth/poswize/callback';
  
  window.location.href = `${API_BASE_URL}/Auth/google?state=${encodeURIComponent(redirectUri)}`;
}

export async function loginWithApple() {
  // Get redirect URI from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUri = urlParams.get('redirect_uri') || 'http://localhost:3001/auth/poswize/callback';
  
  window.location.href = `${API_BASE_URL}/Auth/apple?state=${encodeURIComponent(redirectUri)}`;
}

export async function signUpWithEmailPassword(fullName, email, password) {
  return apiCall('/Auth/signUp', {
    method: 'POST',
    body: JSON.stringify({
      name: fullName,
      email,
      password,
    }),
  });
}

export async function sendPasswordResetEmail(email) {
  return apiCall('/Auth/forget-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(email, code) {
  return apiCall('/Auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp: code }),
  });
}

export async function resendOtp(email) {
  return apiCall('/Auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function updatePassword(email, newPassword) {
  return apiCall('/Auth/change-forget-password', {
    method: 'POST',
    body: JSON.stringify({ email, newPassword }),
  });
}

export async function completeOAuthRegistration(data) {
  return apiCall('/Auth/complete-oauth-registration', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
