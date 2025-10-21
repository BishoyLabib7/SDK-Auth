/**
 * OAuth State Parameter Validation Utilities
 * 
 * This module provides utilities for validating OAuth state parameters
 * to protect against CSRF attacks.
 */

/**
 * Validate state parameter from OAuth callback
 * This function checks if the state parameter received in a callback
 * matches the state that was stored when the OAuth flow was initiated.
 * 
 * @param {string} callbackState - The state parameter from the OAuth callback
 * @returns {boolean} True if state is valid, false otherwise
 */
export function validateOAuthCallbackState(callbackState) {
  try {
    const storedState = sessionStorage.getItem("oauth_state");
    
    if (!storedState) {
      console.error("[OAuth Security] No stored state found for validation");
      return false;
    }
    
    if (!callbackState) {
      console.error("[OAuth Security] No state parameter provided in callback");
      return false;
    }
    
    const isValid = storedState === callbackState;
    
    if (!isValid) {
      console.error("[OAuth Security] State mismatch detected - possible CSRF attack");
      console.error("[OAuth Security] Expected:", storedState);
      console.error("[OAuth Security] Received:", callbackState);
    } else {
      console.log("[OAuth Security] State validation successful");
    }
    
    return isValid;
  } catch (error) {
    console.error("[OAuth Security] Error validating state:", error);
    return false;
  }
}

/**
 * Clear stored OAuth state from sessionStorage
 * Should be called after OAuth flow completes (success or failure)
 */
export function clearOAuthState() {
  try {
    sessionStorage.removeItem("oauth_state");
    console.log("[OAuth Security] OAuth state cleared from sessionStorage");
  } catch (error) {
    console.error("[OAuth Security] Error clearing OAuth state:", error);
  }
}

/**
 * Get the currently stored OAuth state
 * @returns {string|null} The stored state or null if not found
 */
export function getStoredOAuthState() {
  try {
    return sessionStorage.getItem("oauth_state");
  } catch (error) {
    console.error("[OAuth Security] Error retrieving stored state:", error);
    return null;
  }
}
