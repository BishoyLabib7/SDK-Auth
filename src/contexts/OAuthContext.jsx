import React, { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getOAuthSession } from "../lib/service";

const OAuthContext = createContext(null);

export function OAuthProvider({ children }) {
  const [searchParams] = useSearchParams();
  const [oauthContext, setOauthContext] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load OAuth context from URL parameters or sessionStorage
  useEffect(() => {
    // First, try to get from sessionStorage (for navigation preservation)
    const storedContext = sessionStorage.getItem('oauth_context');
    if (storedContext) {
      try {
        setOauthContext(JSON.parse(storedContext));
        return;
      } catch (err) {
        console.error('Failed to parse stored OAuth context:', err);
        sessionStorage.removeItem('oauth_context');
      }
    }

    // Then check URL parameters
    const redirectUri = searchParams.get('redirect_uri');
    const responseType = searchParams.get('response_type');
    const scope = searchParams.get('scope');
    const state = searchParams.get('state');

    if (redirectUri) {
      setLoading(true);
      setError(null);
      
      getOAuthSession(redirectUri, responseType, scope)
        .then((data) => {
          const context = {
            ...data,
            state: state || '',
          };
          setOauthContext(context);
          // Store in sessionStorage for navigation preservation
          sessionStorage.setItem('oauth_context', JSON.stringify(context));
        })
        .catch((err) => {
          console.error('Failed to load OAuth context:', err);
          setError(err.message || 'Failed to initialize OAuth session');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [searchParams]);

  // Clear OAuth context
  const clearOAuthContext = () => {
    setOauthContext(null);
    sessionStorage.removeItem('oauth_context');
  };

  // Update OAuth context
  const updateOAuthContext = (updates) => {
    const newContext = { ...oauthContext, ...updates };
    setOauthContext(newContext);
    sessionStorage.setItem('oauth_context', JSON.stringify(newContext));
  };

  const value = {
    oauthContext,
    loading,
    error,
    clearOAuthContext,
    updateOAuthContext,
    isOAuthFlow: !!oauthContext,
  };

  return (
    <OAuthContext.Provider value={value}>
      {children}
    </OAuthContext.Provider>
  );
}

export function useOAuthContext() {
  const context = useContext(OAuthContext);
  if (context === undefined) {
    throw new Error('useOAuthContext must be used within an OAuthProvider');
  }
  return context;
}

// Hook for OAuth session data
export function useOAuthSession() {
  const { oauthContext, loading, error } = useOAuthContext();
  
  return {
    session: oauthContext,
    loading,
    error,
    isOAuthFlow: !!oauthContext,
  };
}
