import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../UI/Button";
import Input from "../UI/Input";
import { IoLanguage, IoPersonCircle } from "react-icons/io5";
import { FaUserCircle, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Logo from "../assets/logo.png";
import Footer from "../UI/Footer";
import { useTranslation } from "../contexts/TranslationContext";
import {
  checkUsernameAvailability,
  completeOAuthRegistration,
} from "../lib/service";

export default function OAuthUsernameSelection() {
  const { language, translations: t, toggleLanguage, isRTL } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get registration token from URL
  const registrationToken = searchParams.get("registration_token");

  // Pre-filled data from social provider (from URL params)
  const prefilledName = searchParams.get("name") || "";
  const prefilledEmail = searchParams.get("email") || "";
  const prefilledPhoto = searchParams.get("photo") || "";
  const provider = searchParams.get("provider") || "";

  // State management
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [entered]);

  // Route guard: Validate registration token on mount
  useEffect(() => {
    if (!registrationToken) {
      setError(t.invalidRegistrationToken || "Invalid or missing registration token");
      
      // Redirect to login immediately if no token
      const timer = setTimeout(() => {
        const oauthParams = sessionStorage.getItem('oauth_context');
        if (oauthParams) {
          try {
            const context = JSON.parse(oauthParams);
            const params = new URLSearchParams({
              redirect_uri: context.redirectUri,
              response_type: context.responseType || 'code',
              scope: context.scope || '',
              state: context.state || '',
            });
            navigate(`/login?${params.toString()}`);
          } catch {
            navigate("/login");
          }
        } else {
          navigate("/login");
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [registrationToken, navigate, t]);

  // Username validation regex (3-20 characters, letters, numbers, underscores)
  const isValidUsername = (username) => {
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    return regex.test(username);
  };

  // Real-time username availability checking with debouncing
  useEffect(() => {
    // Reset states when username changes
    setValidationError(null);
    setUsernameAvailable(null);

    // Don't check if username is empty
    if (!username) {
      return;
    }

    // Validate format first
    if (!isValidUsername(username)) {
      setValidationError(t.usernameInvalid || "Username must be 3-20 characters, letters, numbers, and underscores only");
      return;
    }

    // Check availability with debouncing
    setChecking(true);
    
    checkUsernameAvailability(username, 500)
      .then((result) => {
        setChecking(false);
        // Handle response structure: { success, status, data: { available } }
        const available = result.data?.available ?? result.available;
        setUsernameAvailable(available);
      })
      .catch((err) => {
        console.error("Failed to check username availability:", err);
        setChecking(false);
        setValidationError(err.message || "Failed to check username availability");
      });
  }, [username, t]);

  // Handle registration completion
  async function handleCompleteRegistration() {
    if (!registrationToken || !username || usernameAvailable !== true) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await completeOAuthRegistration(registrationToken, username);

      if (result.success && result.consentToken) {
        // Navigate to consent page with consent token
        const consentUrl = `/consent?consent_token=${encodeURIComponent(result.consentToken)}`;
        navigate(consentUrl);
      } else {
        setError(t.registrationFailed || "Failed to complete registration");
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to complete registration:", err);
      
      // Handle specific error codes
      if (err.message.includes("USERNAME_TAKEN") || err.message.includes("already taken")) {
        setValidationError(t.usernameTaken || "Username is already taken");
        setUsernameAvailable(false);
      } else if (err.message.includes("INVALID_TOKEN") || err.message.includes("expired")) {
        setError(t.invalidRegistrationToken || "Invalid or expired registration token");
        setTimeout(() => {
          const oauthParams = sessionStorage.getItem('oauth_context');
          if (oauthParams) {
            try {
              const context = JSON.parse(oauthParams);
              const params = new URLSearchParams({
                redirect_uri: context.redirectUri,
                response_type: context.responseType || 'code',
                scope: context.scope || '',
                state: context.state || '',
              });
              navigate(`/login?${params.toString()}`);
            } catch {
              navigate("/login");
            }
          } else {
            navigate("/login");
          }
        }, 2000);
      } else {
        setError(err.message || t.registrationFailed || "Failed to complete registration");
      }
      
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full bg-white flex items-center justify-center px-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-xl">
        <div
          className={`rounded-3xl bg-white shadow-xl border border-gray-100 p-6 sm:p-8 hover:shadow transform transition-all duration-500 ${
            entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          } hover:-translate-y-0.5 hover:shadow-2xl`}
        >
          {/* Language toggle */}
          <div className="flex justify-end mb-4">
            <button
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 hover:shadow transition cursor-pointer"
              onClick={toggleLanguage}
              aria-label="toggle language"
              title={language === "en" ? t.en : t.ar}
            >
              <IoLanguage className="text-[#20ABF0]" />
              <span className="font-medium">
                {language === "en" ? t.en : t.ar}
              </span>
            </button>
          </div>

          {/* Logo */}
          <img
            src={Logo}
            alt="logo"
            className="mx-auto mb-6 transition-transform duration-300 hover:scale-105"
          />

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t.usernameSelectionTitle || "Choose Your Username"}
            </h1>
            <p className="text-gray-600">
              {t.usernameSelectionSubtitle || "Complete your registration by choosing a unique username"}
            </p>
          </div>

          {/* User profile preview */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-4">
              {prefilledPhoto ? (
                <img
                  src={prefilledPhoto}
                  alt={prefilledName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <FaUserCircle className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{prefilledName}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MdEmail className="w-4 h-4" />
                  {prefilledEmail}
                </p>
                {provider && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t.signedInWith || "Signed in with"} {provider === "google" ? "Google" : "Apple"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Username input with real-time validation */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.username || "Username"}
            </label>
            
            {/* Custom input with validation feedback */}
            <div className={`w-full flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition ${
              validationError 
                ? "border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100"
                : usernameAvailable === false
                ? "border-red-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100"
                : usernameAvailable === true
                ? "border-green-300 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100"
                : "border-gray-200 focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-[#20ABF0]/20"
            }`}>
              <span className="text-gray-400">
                <IoPersonCircle />
              </span>
              <input
                className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                type="text"
                placeholder={t.usernamePlaceholder || "Enter your username"}
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                dir={isRTL ? "rtl" : "ltr"}
                maxLength={20}
              />
              
              {/* Status indicator */}
              {username && (
                <span className="flex-shrink-0">
                  {checking ? (
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-gray-200 border-t-[#20ABF0]"></div>
                  ) : validationError ? (
                    <FaTimesCircle className="w-5 h-5 text-red-500" />
                  ) : usernameAvailable === false ? (
                    <FaTimesCircle className="w-5 h-5 text-red-500" />
                  ) : usernameAvailable === true ? (
                    <FaCheckCircle className="w-5 h-5 text-green-500" />
                  ) : null}
                </span>
              )}
            </div>

            {/* Validation feedback messages */}
            {username && (
              <div className="mt-2">
                {checking && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <span className="inline-block animate-pulse">⏳</span>
                    {t.usernameChecking || "Checking availability..."}
                  </p>
                )}
                {!checking && validationError && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <FaTimesCircle className="w-4 h-4" />
                    {validationError}
                  </p>
                )}
                {!checking && !validationError && usernameAvailable === false && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <FaTimesCircle className="w-4 h-4" />
                    {t.usernameTaken || "Username is already taken"}
                  </p>
                )}
                {!checking && !validationError && usernameAvailable === true && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <FaCheckCircle className="w-4 h-4" />
                    {t.usernameAvailable || "Username is available"}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Submit button */}
          <div className="mt-6">
            <Button
              primary
              onClick={handleCompleteRegistration}
              disabled={loading || !username || checking || validationError || usernameAvailable !== true}
            >
              {loading
                ? t.processing || "Processing..."
                : t.continueButton || "Continue"}
            </Button>
          </div>

          {/* Privacy notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {t.usernamePrivacyNotice ||
                "Your username will be visible to other users"}
            </p>
          </div>
        </div>

        {/* Page footer */}
        <Footer language={language} />
      </div>
    </div>
  );
}
