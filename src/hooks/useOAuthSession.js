import { useState, useEffect, useCallback } from "react";
import { useOAuthContext } from "../contexts/OAuthContext";
import { getOAuthSession } from "../lib/service";

/**
 * useOAuthSession - Custom hook for managing OAuth session state
 * Provides OAuth session data with loading and error states
 * Automatically loads session from URL parameters or sessionStorage
 */
export function useOAuthSession() {
  const { oauthSession, loading, error, loadOAuthSession, updateOAuthSession, clearOAuthSession, isOAuthFlow } = useOAuthContext();
  
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Refresh OAuth session from backend
  const refreshSession = useCallback(async () => {
    if (!oauthSession?.redirectUri) {
      setLocalError("No OAuth session to refresh");
      return;
    }

    try {
      setLocalLoading(true);
      setLocalError(null);

      const sessionData = await getOAuthSession(
        oauthSession.redirectUri,
        oauthSession.responseType,
        oauthSession.scope
      );

      updateOAuthSession({
        appName: sessionData.appName,
        appDomain: sessionData.appDomain,
      });

      setLocalLoading(false);
    } catch (err) {
      console.error("Failed to refresh OAuth session:", err);
      setLocalError(err.message || "Failed to refresh OAuth session");
      setLocalLoading(false);
    }
  }, [oauthSession, updateOAuthSession]);

  // Get OAuth parameters for API calls
  const getOAuthParams = useCallback(() => {
    if (!oauthSession) {
      return null;
    }

    return {
      redirectUri: oauthSession.redirectUri,
      responseType: oauthSession.responseType,
      scope: oauthSession.scope,
    };
  }, [oauthSession]);

  // Build social auth URL with OAuth context
  const buildSocialAuthUrl = useCallback((provider, baseUrl) => {
    if (!oauthSession?.redirectUri) {
      return baseUrl;
    }

    const params = new URLSearchParams({
      oauth_redirect_uri: oauthSession.redirectUri,
      oauth_state: oauthSession.responseType || "code",
    });

    return `${baseUrl}?${params.toString()}`;
  }, [oauthSession]);

  return {
    // Session data
    session: oauthSession,
    appName: oauthSession?.appName,
    appDomain: oauthSession?.appDomain,
    redirectUri: oauthSession?.redirectUri,
    scope: oauthSession?.scope,
    
    // State flags
    loading: loading || localLoading,
    error: error || localError,
    isOAuthFlow: isOAuthFlow(),
    
    // Methods
    loadSession: loadOAuthSession,
    refreshSession,
    updateSession: updateOAuthSession,
    clearSession: clearOAuthSession,
    getOAuthParams,
    buildSocialAuthUrl,
  };
}
