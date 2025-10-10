// API base URL - from Vite environment variable (VITE_API_BASE_URL)
// Falls back to deriving from current window location
const getApiBaseUrl = () => {
  // Priority 1: Vite environment variable (set during build)
  if (import.meta.env.VITE_API_BASE_URL) {
    console.log('Using VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Priority 2: Derive from current URL
  // If we're on https://poswize.com/testAPI/oauth-ui/..., extract https://poswize.com/testAPI
  const currentPath = window.location.pathname;
  const origin = window.location.origin;
  
  // Check if we're under /testAPI/ or similar API path
  const apiPathMatch = currentPath.match(/^(\/[^\/]+)\/oauth-ui/);
  if (apiPathMatch) {
    const apiPath = apiPathMatch[1]; // e.g., "/testAPI"
    const fullApiUrl = `${origin}${apiPath}`;
    console.log('Derived API_BASE_URL from path:', fullApiUrl);
    return fullApiUrl;
  }
  
  // Priority 3: Just use origin (for localhost development)
  console.log('Using window.location.origin:', origin);
  return origin;
};

const API_BASE_URL = getApiBaseUrl();

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
