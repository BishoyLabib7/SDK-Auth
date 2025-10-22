import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useOAuthContext } from "../contexts/OAuthContext";
import Logo from "../assets/logo.png";

// Function to complete OAuth flow properly
async function completeOAuthFlow(jwtToken, oauthParams) {
  try {
    console.log("Completing OAuth flow with params:", oauthParams);

    // Call the backend OAuth authorize endpoint to complete the flow
    const response = await fetch(`/oauth2/api/oauth/authorize?${new URLSearchParams({
      redirect_uri: oauthParams.redirect_uri,
      response_type: oauthParams.response_type || 'code',
      scope: oauthParams.scope || '',
      state: oauthParams.state || ''
    })}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`OAuth authorize failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("OAuth authorize response:", result);

    if (result.status === 'authorized') {
      // Direct redirect to third-party app with authorization code
      console.log("Redirecting to authorized URL:", result.redirect_url);
      window.location.href = result.redirect_url;
    } else if (result.status === 'consent_required' || result.status === 'needs_consent') {
      // Redirect to consent page
      console.log("Consent required, redirecting to consent page");
      window.location.href = `/oauth2/auth/oauth/consent?consent_token=${encodeURIComponent(result.consent_token)}`;
    } else {
      throw new Error(`Unexpected OAuth response: ${result.status}`);
    }
  } catch (error) {
    console.error("Error completing OAuth flow:", error);

    // Fallback: redirect with token (not ideal but better than nothing)
    const redirectUrl = new URL(oauthParams.redirect_uri);
    redirectUrl.searchParams.set('token', jwtToken);
    console.log("Fallback redirect:", redirectUrl.toString());
    window.location.href = redirectUrl.toString();
  }
}

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const { oauthParams, isInOAuthFlow, clearOAuthContext } = useOAuthContext();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      console.log('=== AuthSuccess Page ===');
      console.log('Token received:', token.substring(0, 20) + '...');

      // Store the token
      localStorage.setItem("auth_token", token);

      // Check if we're in an OAuth flow
      console.log('Checking OAuth flow...');
      console.log('isInOAuthFlow():', isInOAuthFlow());
      console.log('oauthParams:', oauthParams);

      if (isInOAuthFlow() && oauthParams.redirect_uri) {
        console.log("✅ OAuth flow detected - completing OAuth flow properly");

        // Complete the OAuth flow by calling the backend OAuth login endpoint
        // This will generate an authorization code instead of using the JWT token
        completeOAuthFlow(token, oauthParams);
        return;
      }

      // Check if there's OAuth context in sessionStorage (from social login)
      const savedOAuthParams = sessionStorage.getItem('oauth_social_flow');
      console.log('Checking sessionStorage for oauth_social_flow:', savedOAuthParams);

      if (savedOAuthParams) {
        try {
          const params = JSON.parse(savedOAuthParams);
          console.log("✅ Found saved OAuth params:", params);

          if (params.redirect_uri) {
            const redirectUrl = new URL(params.redirect_uri);
            redirectUrl.searchParams.set('token', token);

            console.log("Redirecting to saved OAuth callback:", redirectUrl.toString());

            // Clear the saved params and redirect
            sessionStorage.removeItem('oauth_social_flow');
            window.location.href = redirectUrl.toString();
            return;
          } else {
            console.warn('⚠️ Saved OAuth params exist but no redirect_uri found');
          }
        } catch (error) {
          console.error("❌ Error parsing saved OAuth params:", error);
        }
      } else {
        console.warn('⚠️ No oauth_social_flow in sessionStorage');
      }

      // For Flutter app deep linking
      const isFlutterApp = /flutter/i.test(navigator.userAgent);

      if (isFlutterApp) {
        console.log('Flutter app detected - redirecting to deep link');
        // Redirect to Flutter deep link
        window.location.href = `poswize://auth/success?token=${encodeURIComponent(token)}`;
      } else {
        // For web applications (regular login, not OAuth)
        console.warn('⚠️ FALLBACK: No OAuth context found - this is a regular login');
        console.warn('If you expected OAuth flow, make sure you started from the OAuth authorize endpoint');
        console.log("Regular authentication successful! Token stored:", token);

        // Check if this is a popup window
        if (window.opener) {
          // This is a popup window, close it and let the parent handle the success
          console.log('Popup window detected - closing in 2 seconds');
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          // This is a regular window, redirect to a default location or show manual options
          // You can customize this based on your needs
          console.warn('⚠️ Redirecting to default URL in 3 seconds: https://poswize.com');
          console.warn('To fix: Start OAuth flow from your application (e.g., http://localhost:3001)');
          setTimeout(() => {
            // Option 1: Redirect to your main app (customize the URL)
            window.location.href = "https://poswize.com"; // Change this to your main app URL

            // Option 2: Or redirect back to login page
            // window.location.href = "/";
          }, 3000);
        }
      }
    }
  }, [token, isInOAuthFlow, oauthParams, clearOAuthContext]);

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl text-center">
        <div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-8">
          <img
            src={Logo}
            alt="logo"
            className="mx-auto mb-6 w-32 h-32 object-contain"
          />

          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Login Successful!
          </h2>
          <p className="text-gray-600 mb-4">
            {window.opener
              ? "This window will close automatically..."
              : "Redirecting you to the main application..."
            }
          </p>

          {!window.opener && (
            <div className="mt-4">
              <a
                href="https://poswize.com"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue to Poswize
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
