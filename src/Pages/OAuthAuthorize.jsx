import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOAuthContext } from "../contexts/OAuthContext";
import { useTranslation } from "../contexts/TranslationContext";
import { checkOAuthAuthorization } from "../lib/oauthService";
import OAuthError from "../components/OAuthError";
import { mapOAuthError } from "../lib/oauthErrorHandler";

export default function OAuthAuthorize() {
  const { setOAuthParams, setConsentData, clearOAuthContext } = useOAuthContext();
  const { translations: t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [oauthParams, setLocalOAuthParams] = useState(null);

  useEffect(() => {
    async function initializeOAuth() {
      try {
        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const redirect_uri = urlParams.get("redirect_uri");
        const response_type = urlParams.get("response_type") || "code";
        const scope = urlParams.get("scope") || "";
        const state = urlParams.get("state") || "";

        // Validate redirect_uri is present
        if (!redirect_uri) {
          const errorInfo = mapOAuthError("Missing redirect_uri parameter", t);
          setError(errorInfo.message);
          setErrorType(errorInfo.type);
          setLoading(false);
          return;
        }

        // Store OAuth params in context (state will be generated if not provided)
        // setOAuthParams will automatically generate a secure state if not provided
        const params = {
          redirect_uri,
          response_type,
          scope,
          state,
        };
        setOAuthParams(params);

        // Get the params back from context to ensure we have the generated state
        // We need to wait a tick for the state update
        await new Promise(resolve => setTimeout(resolve, 0));

        // Retrieve the updated params with generated state from sessionStorage
        const savedParams = sessionStorage.getItem("oauth_params");
        const paramsWithState = savedParams ? JSON.parse(savedParams) : params;
        setLocalOAuthParams(paramsWithState);

        // Call checkOAuthAuthorization with OAuth params (including generated state)
        const response = await checkOAuthAuthorization(paramsWithState);

        // Handle different status responses
        if (response.status === "unauthenticated") {
          // Navigate to /login with OAuth params (including state)
          const loginParams = new URLSearchParams(paramsWithState).toString();
          navigate(`/login?${loginParams}`);
        } else if (response.status === "needs_consent") {
          // Set consent data and navigate to /oauth/consent
          setConsentData(response);
          navigate("/oauth/consent");
        } else if (response.status === "authorized") {
          // Clear OAuth context before redirecting (includes state cleanup)
          clearOAuthContext();
          // Redirect to redirect_url
          window.location.href = response.redirect_url;
        } else {
          const errorInfo = mapOAuthError("Unexpected response from authorization server", t);
          setError(errorInfo.message);
          setErrorType(errorInfo.type);
          setLoading(false);
        }
      } catch (err) {
        console.error("OAuth authorization error:", err);
        const errorInfo = mapOAuthError(err.message || "Failed to initialize OAuth flow", t);
        setError(errorInfo.message);
        setErrorType(errorInfo.type);
        setLoading(false);
      }
    }

    initializeOAuth();
  }, []); // Empty dependency array - only run once on mount
  // Note: setOAuthParams, setConsentData, navigate are stable functions and don't need to be in dependencies

  // Display loading state while checking authorization
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#20ABF0] mb-4"></div>
          <p className="text-gray-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  // Display error state if authorization check fails
  if (error) {
    return (
      <OAuthError
        error={error}
        errorType={errorType}
        onRetry={() => {
          setError(null);
          setErrorType(null);
          setLoading(true);
          // Retry by reloading the page
          window.location.reload();
        }}
        onRestart={() => {
          clearOAuthContext();
          if (oauthParams?.redirect_uri) {
            window.location.href = `/oauth2/oauth/authorize?${new URLSearchParams(oauthParams).toString()}`;
          } else {
            window.location.href = "/oauth2/login";
          }
        }}
        onCancel={() => {
          clearOAuthContext();
          window.location.href = "/oauth2/login";
        }}
        showLanguageToggle={true}
      />
    );
  }

  return null;
}
