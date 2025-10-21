/**
 * OAuth Error Handler Utility
 * 
 * Maps backend error codes and messages to user-friendly messages
 * and determines error types for appropriate handling
 */

/**
 * Error types for OAuth flows
 */
export const ERROR_TYPES = {
  NETWORK: "network",
  SESSION_EXPIRED: "session_expired",
  INVALID_REDIRECT: "invalid_redirect",
  VALIDATION: "validation",
  INVALID_CREDENTIALS: "invalid_credentials",
  SERVER: "server",
};

/**
 * Map backend error codes to user-friendly messages
 * 
 * @param {string} errorMessage - Error message from backend or caught error
 * @param {Object} translations - Translation object
 * @returns {Object} { message: string, type: string }
 */
export function mapOAuthError(errorMessage, translations) {
  const t = translations;
  const lowerError = errorMessage.toLowerCase();

  // Network errors
  if (
    lowerError.includes("network") ||
    lowerError.includes("failed to fetch") ||
    lowerError.includes("networkerror") ||
    lowerError.includes("connection")
  ) {
    return {
      message: t.oauthErrorNetwork,
      type: ERROR_TYPES.NETWORK,
    };
  }

  // Session expired / token expired
  if (
    lowerError.includes("session expired") ||
    lowerError.includes("token expired") ||
    lowerError.includes("consent_token") ||
    lowerError.includes("unauthorized") ||
    lowerError.includes("401")
  ) {
    return {
      message: t.oauthErrorSessionExpired,
      type: ERROR_TYPES.SESSION_EXPIRED,
    };
  }

  // Invalid redirect URI
  if (
    lowerError.includes("invalid redirect") ||
    lowerError.includes("redirect_uri") ||
    lowerError.includes("invalid application")
  ) {
    return {
      message: t.oauthErrorInvalidRedirect,
      type: ERROR_TYPES.INVALID_REDIRECT,
    };
  }

  // Missing parameters / validation errors
  if (
    lowerError.includes("missing") ||
    lowerError.includes("required") ||
    lowerError.includes("invalid request") ||
    lowerError.includes("parameter")
  ) {
    return {
      message: t.oauthErrorMissingParams,
      type: ERROR_TYPES.VALIDATION,
    };
  }

  // Invalid credentials
  if (
    lowerError.includes("invalid credentials") ||
    lowerError.includes("invalid email") ||
    lowerError.includes("invalid password") ||
    lowerError.includes("authentication failed")
  ) {
    return {
      message: t.oauthErrorInvalidCredentials,
      type: ERROR_TYPES.INVALID_CREDENTIALS,
    };
  }

  // Server errors (500, etc.)
  if (
    lowerError.includes("500") ||
    lowerError.includes("server error") ||
    lowerError.includes("internal error")
  ) {
    return {
      message: t.oauthErrorServerError,
      type: ERROR_TYPES.SERVER,
    };
  }

  // Default to server error with original message
  return {
    message: errorMessage || t.oauthErrorServerError,
    type: ERROR_TYPES.SERVER,
  };
}

/**
 * Determine if an error is recoverable (can retry)
 * 
 * @param {string} errorType - Error type from ERROR_TYPES
 * @returns {boolean}
 */
export function isRecoverableError(errorType) {
  return (
    errorType === ERROR_TYPES.NETWORK ||
    errorType === ERROR_TYPES.SERVER
  );
}

/**
 * Determine if an error requires restarting the OAuth flow
 * 
 * @param {string} errorType - Error type from ERROR_TYPES
 * @returns {boolean}
 */
export function requiresRestart(errorType) {
  return errorType === ERROR_TYPES.SESSION_EXPIRED;
}

/**
 * Determine if an error should prevent redirecting
 * 
 * @param {string} errorType - Error type from ERROR_TYPES
 * @returns {boolean}
 */
export function shouldPreventRedirect(errorType) {
  return (
    errorType === ERROR_TYPES.INVALID_REDIRECT ||
    errorType === ERROR_TYPES.VALIDATION
  );
}
