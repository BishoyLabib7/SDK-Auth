import React, { useEffect, useState } from "react";
import Button from "../UI/Button";
import Footer from "../UI/Footer";
import { IoLanguage, IoCheckmarkCircle } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import Logo from "../assets/logo.png";
import { useTranslation } from "../contexts/TranslationContext";
import { useOAuthContext } from "../contexts/OAuthContext";
import { submitOAuthConsent } from "../lib/oauthService";
import OAuthError from "../components/OAuthError";
import { mapOAuthError } from "../lib/oauthErrorHandler";

export default function OAuthConsent() {
  const { language, translations: t, toggleLanguage, isRTL } = useTranslation();
  const { oauthParams, consentData, clearOAuthContext } = useOAuthContext();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // State for consent token from URL
  const [consentToken, setConsentToken] = useState(null);

  // Load consent data on mount if not in context
  useEffect(() => {
    if (!consentData) {
      // Try to get consent data from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('consent_token');
      
      if (tokenFromUrl) {
        setConsentToken(tokenFromUrl);
        console.log('Consent token from URL:', tokenFromUrl);
      } else if (!oauthParams) {
        const errorInfo = mapOAuthError("Missing required parameters", t);
        setError(errorInfo.message);
        setErrorType(errorInfo.type);
      }
    }
  }, [consentData, oauthParams, t]);

  async function handleApprove() {
    const tokenToUse = consentData?.consent_token || consentToken;
    
    console.log('handleApprove - consentData:', consentData);
    console.log('handleApprove - consentToken from URL:', consentToken);
    console.log('handleApprove - oauthParams:', oauthParams);
    console.log('handleApprove - tokenToUse:', tokenToUse);
    
    if (!tokenToUse || !oauthParams) {
      const errorInfo = mapOAuthError("Missing required parameters", t);
      setError(errorInfo.message);
      setErrorType(errorInfo.type);
      return;
    }

    setLoading(true);
    setError(null);
    setErrorType(null);

    try {
      console.log('Submitting consent with:', {
        approved: true,
        consent_token: tokenToUse,
        oauthParams: oauthParams
      });
      
      const response = await submitOAuthConsent(
        true,
        tokenToUse,
        oauthParams
      );

      if (response.redirect_url) {
        // Clear OAuth context before redirecting
        clearOAuthContext();
        // Redirect to the application with authorization code
        window.location.href = response.redirect_url;
      } else {
        const errorInfo = mapOAuthError("Server error", t);
        setError(errorInfo.message);
        setErrorType(errorInfo.type);
      }
    } catch (err) {
      const errorInfo = mapOAuthError(err.message || "Network error", t);
      setError(errorInfo.message);
      setErrorType(errorInfo.type);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeny() {
    const tokenToUse = consentData?.consent_token || consentToken;
    
    console.log('handleDeny - consentData:', consentData);
    console.log('handleDeny - consentToken from URL:', consentToken);
    console.log('handleDeny - oauthParams:', oauthParams);
    console.log('handleDeny - tokenToUse:', tokenToUse);
    
    if (!tokenToUse || !oauthParams) {
      const errorInfo = mapOAuthError("Missing required parameters", t);
      setError(errorInfo.message);
      setErrorType(errorInfo.type);
      return;
    }

    setLoading(true);
    setError(null);
    setErrorType(null);

    try {
      console.log('Submitting consent with:', {
        approved: false,
        consent_token: tokenToUse,
        oauthParams: oauthParams
      });
      
      const response = await submitOAuthConsent(
        false,
        tokenToUse,
        oauthParams
      );

      if (response.redirect_url) {
        // Clear OAuth context before redirecting
        clearOAuthContext();
        // Redirect to the application with error
        window.location.href = response.redirect_url;
      } else {
        const errorInfo = mapOAuthError("Server error", t);
        setError(errorInfo.message);
        setErrorType(errorInfo.type);
      }
    } catch (err) {
      const errorInfo = mapOAuthError(err.message || "Network error", t);
      setError(errorInfo.message);
      setErrorType(errorInfo.type);
    } finally {
      setLoading(false);
    }
  }

  // Helper function to format permission text
  const getPermissionText = (permission) => {
    // Normalize permission string (lowercase, remove spaces, handle variations)
    const normalized = permission.toLowerCase().replace(/\s+/g, '');
    
    const permissionMap = {
      profile: t.permissionProfile,
      email: t.permissionEmail,
      read: t.permissionRead,
      write: t.permissionWrite,
      name: t.permissionName,
      profilephoto: t.permissionProfilePhoto,
      photo: t.permissionProfilePhoto,
      phone: t.permissionPhone,
      phonenumber: t.permissionPhone,
      address: t.permissionAddress,
    };
    
    return permissionMap[normalized] || permission;
  };

  // Show loading state
  if (loading) {
    return (
      <div
        className="min-h-screen w-full bg-white flex items-center justify-center px-4"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="w-full max-w-xl">
          <div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 sm:p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#20ABF0] mx-auto mb-4"></div>
              <p className="text-gray-600">{t.loading || "Loading..."}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <OAuthError
        error={error}
        errorType={errorType}
        onRetry={() => {
          setError(null);
          setErrorType(null);
        }}
        onRestart={() => {
          clearOAuthContext();
          window.location.href = oauthParams?.redirect_uri 
            ? `/oauth2/oauth/authorize?${new URLSearchParams(oauthParams).toString()}`
            : "/oauth2/login";
        }}
        onCancel={() => {
          clearOAuthContext();
          window.location.href = "/oauth2/login";
        }}
        showLanguageToggle={true}
      />
    );
  }

  // Show consent screen
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

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t.oauthConsentTitle}
            </h1>
            {consentData?.app?.name && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-[#20ABF0]">
                  {consentData.app.name}
                </span>{" "}
                {t.oauthConsentSubtitle}
              </p>
            )}
          </div>

          {/* User Information Section */}
          {consentData?.user && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {t.oauthConsentYourInfo}
              </h3>
              <div className="flex items-center gap-3">
                {consentData.user.photo ? (
                  <img
                    src={consentData.user.photo}
                    alt={consentData.user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#20ABF0] flex items-center justify-center text-white">
                    <FaUser size={20} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {consentData.user.name}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {consentData.user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Permissions List */}
          {consentData?.permissions && consentData.permissions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {t.oauthConsentPermissions}
              </h3>
              <div className="space-y-2">
                {consentData.permissions.map((permission, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <IoCheckmarkCircle
                      className="text-[#20ABF0] flex-shrink-0 mt-0.5"
                      size={20}
                    />
                    <span className="text-sm text-gray-700">
                      {getPermissionText(permission)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 mt-8">
            <Button primary onClick={handleApprove} disabled={loading}>
              {t.oauthConsentAllow}
            </Button>
            <Button onClick={handleDeny} disabled={loading}>
              {t.oauthConsentDeny}
            </Button>
          </div>
        </div>

        {/* Page footer */}
        <Footer language={language} />
      </div>
    </div>
  );
}
