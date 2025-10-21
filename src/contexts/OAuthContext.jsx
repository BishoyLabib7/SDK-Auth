import React, { createContext, useContext, useState, useEffect } from "react";

const OAuthContext = createContext();

export const useOAuthContext = () => {
  const context = useContext(OAuthContext);
  if (!context) {
    throw new Error("useOAuthContext must be used within an OAuthProvider");
  }
  return context;
};

/**
 * Generate a cryptographically secure random state parameter for CSRF protection
 * @returns {string} Random state string
 */
const generateSecureState = () => {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback: generate random string using crypto.getRandomValues
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Last resort fallback (not cryptographically secure, but better than nothing)
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const OAuthProvider = ({ children }) => {
  // Initialize oauthParams from sessionStorage if available
  const [oauthParams, setOAuthParamsState] = useState(() => {
    try {
      const saved = sessionStorage.getItem("oauth_params");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Failed to parse OAuth params from sessionStorage:", error);
      return null;
    }
  });

  const [consentData, setConsentDataState] = useState(null);

  // Persist oauthParams to sessionStorage whenever it changes
  useEffect(() => {
    if (oauthParams) {
      try {
        sessionStorage.setItem("oauth_params", JSON.stringify(oauthParams));
        // Also store the state separately for validation
        if (oauthParams.state) {
          sessionStorage.setItem("oauth_state", oauthParams.state);
        }
      } catch (error) {
        console.error("Failed to save OAuth params to sessionStorage:", error);
      }
    } else {
      sessionStorage.removeItem("oauth_params");
      sessionStorage.removeItem("oauth_state");
    }
  }, [oauthParams]);

  // Set OAuth parameters with state generation if needed
  const setOAuthParams = (params) => {
    // If state is not provided, generate a secure random state
    const stateToUse = params.state || generateSecureState();
    
    const paramsWithState = {
      ...params,
      state: stateToUse
    };
    
    setOAuthParamsState(paramsWithState);
  };

  // Set consent data
  const setConsentData = (data) => {
    setConsentDataState(data);
  };

  // Clear all OAuth context and state
  const clearOAuthContext = () => {
    setOAuthParamsState(null);
    setConsentDataState(null);
    sessionStorage.removeItem("oauth_params");
    sessionStorage.removeItem("oauth_state");
  };

  // Helper method to check if currently in OAuth flow
  const isInOAuthFlow = () => {
    return !!oauthParams;
  };

  // Validate state parameter for CSRF protection
  const validateState = (stateToValidate) => {
    try {
      const storedState = sessionStorage.getItem("oauth_state");
      
      if (!storedState) {
        console.error("No stored state found for validation");
        return false;
      }
      
      if (!stateToValidate) {
        console.error("No state parameter provided for validation");
        return false;
      }
      
      const isValid = storedState === stateToValidate;
      
      if (!isValid) {
        console.error("State mismatch - possible CSRF attack");
      }
      
      return isValid;
    } catch (error) {
      console.error("Error validating state:", error);
      return false;
    }
  };

  const value = {
    oauthParams,
    consentData,
    setOAuthParams,
    setConsentData,
    clearOAuthContext,
    isInOAuthFlow,
    validateState,
  };

  return (
    <OAuthContext.Provider value={value}>{children}</OAuthContext.Provider>
  );
};

export { OAuthContext };

/**
 * OAuth State Security Implementation Notes:
 * 
 * 1. State Generation: When setOAuthParams is called without a state parameter,
 *    a cryptographically secure random state is automatically generated using
 *    crypto.randomUUID() or crypto.getRandomValues().
 * 
 * 2. State Storage: The state parameter is stored in sessionStorage under the
 *    key "oauth_state" for validation purposes. This provides CSRF protection.
 * 
 * 3. State Validation: The validateState function can be used to verify that
 *    a state parameter received in a callback matches the stored state.
 * 
 * 4. State Clearing: When clearOAuthContext is called, both the OAuth params
 *    and the stored state are removed from sessionStorage.
 * 
 * 5. CSRF Protection: The state parameter acts as a CSRF token, ensuring that
 *    OAuth callbacks are legitimate and not forged by an attacker.
 */
