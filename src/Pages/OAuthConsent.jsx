import React, { useEffect, useState } from "react";
import Button from "../UI/Button";
import { IoCheckmark, IoClose, IoPerson, IoMail, IoImage } from "react-icons/io5";
import Logo from "../assets/logo.png";
import Footer from "../UI/Footer";
import { useTranslation } from "../contexts/TranslationContext";

export default function OAuthConsent() {
  const { language, translations: t, toggleLanguage, isRTL } = useTranslation();
  const [entered, setEntered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [consentData, setConsentData] = useState(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [entered]);

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const redirectUri = params.get('redirect_uri');
    const appName = params.get('appName');
    const userEmail = params.get('userEmail');
    const userName = params.get('userName');
    const userPhoto = params.get('userPhoto');
    const consentToken = params.get('consentToken');
    
    if (redirectUri && appName) {
      setConsentData({
        redirectUri,
        appName,
        userEmail,
        userName,
        userPhoto,
        consentToken
      });
    } else {
      setError("Invalid consent request. Missing required parameters.");
    }
  }, []);

  const handleConsent = async (action) => {
    if (!consentData) return;

    setLoading(true);
    setError("");

    try {
      // Get API base URL using same logic as service.js
      const getApiBaseUrl = () => {
        // Priority 1: Vite environment variable (set during build)
        if (import.meta.env.VITE_API_BASE_URL) {
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
          return `${origin}${apiPath}`;
        }
        
        // Priority 3: Just use origin (for localhost development)
        return origin;
      };

      const API_BASE_URL = getApiBaseUrl();
      
      // Create form to submit (backend expects form data and performs redirect)
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `${API_BASE_URL}/oauth/consent`;
      form.style.display = 'none';
      
      const redirectInput = document.createElement('input');
      redirectInput.type = 'hidden';
      redirectInput.name = 'redirect_uri';
      redirectInput.value = consentData.redirectUri;
      
      const actionInput = document.createElement('input');
      actionInput.type = 'hidden';
      actionInput.name = 'action';
      actionInput.value = action;
      
      form.appendChild(redirectInput);
      form.appendChild(actionInput);
      
      if (consentData.consentToken) {
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'consent_token';
        tokenInput.value = consentData.consentToken;
        form.appendChild(tokenInput);
      }
      
      document.body.appendChild(form);
      form.submit();
      
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (!consentData) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#20ABF0] mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loadingConsentInfo}</p>
        </div>
      </div>
    );
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
          } hover:-translate-y-0.5 hover:shadow-2xl `}
        >
          <div className="flex justify-end mb-4">
            <button
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 hover:shadow transition cursor-pointer"
              onClick={toggleLanguage}
              aria-label="toggle language"
              title={language === "en" ? t.en : t.ar}
            >
              <span className="font-medium">
                {language === "en" ? t.en : t.ar}
              </span>
            </button>
          </div>
          
          <img
            src={Logo}
            alt="logo"
            className="mx-auto mb-8 transition-transform duration-300 hover:scale-105"
          />

          {/* User Info */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <img
                src={consentData.userPhoto || Logo}
                alt={consentData.userName || t.user}
                className="w-16 h-16 rounded-full mx-auto border-3 border-[#20ABF0] object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {t.hi}, {consentData.userName || t.user}
            </h3>
            <p className="text-sm text-gray-600">{consentData.userEmail}</p>
          </div>

          {/* App Request */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {t.authorizationRequest}
            </h2>
            <p className="text-sm text-gray-600">
              <strong className="text-[#20ABF0]">{consentData.appName}</strong> {t.wouldLikeAccess}
            </p>
          </div>

          {/* Permissions */}
          <div className="mb-8">
            <h4 className="text-base font-semibold text-gray-800 mb-4 text-center">
              {t.thisAppWillBeAbleTo}
            </h4>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className={`w-6 h-6 bg-[#20ABF0] rounded-full flex items-center justify-center flex-shrink-0 ${isRTL ? 'ml-3' : 'mr-3'}`}>
                    <IoCheckmark className="text-white text-sm" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{t.accessYourName}</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-6 h-6 bg-[#20ABF0] rounded-full flex items-center justify-center flex-shrink-0 ${isRTL ? 'ml-3' : 'mr-3'}`}>
                    <IoCheckmark className="text-white text-sm" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{t.accessYourEmail}</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-6 h-6 bg-[#20ABF0] rounded-full flex items-center justify-center flex-shrink-0 ${isRTL ? 'ml-3' : 'mr-3'}`}>
                    <IoCheckmark className="text-white text-sm" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{t.accessYourPhoto}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-orange-700 text-sm text-center">
              <strong>{t.securityNotice}</strong> {t.onlyApproveIfTrust} {consentData.appName} {t.andInitiatedRequest}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Consent Actions */}
          <div className="space-y-3">
            <Button
              primary
              onClick={() => handleConsent('approve')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              <IoCheckmark size={16} />
              {loading ? t.processing : t.allowAccess}
            </Button>
            
            <Button
              onClick={() => handleConsent('deny')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <IoClose size={16} />
              {t.cancel}
            </Button>
          </div>

          {/* App Info */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              {t.revokeAccessNotice}
              <br />
              {t.appDomain} <span className="text-[#20ABF0] font-medium">{new URL(consentData.redirectUri).hostname}</span>
            </p>
          </div>
        </div>
        
        <Footer language={language} />
      </div>
    </div>
  );
}

