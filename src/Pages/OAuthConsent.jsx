import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../UI/Button";
import { IoLanguage, IoShieldCheckmark } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import Logo from "../assets/logo.png";
import Footer from "../UI/Footer";
import { useTranslation } from "../contexts/TranslationContext";
import {
  getUserProfileForConsent,
  submitConsent,
} from "../lib/service";

export default function OAuthConsent() {
  const { language, translations: t, toggleLanguage, isRTL } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State management
  const [user, setUser] = useState(null);
  const [app, setApp] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [redirectUri, setRedirectUri] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [entered, setEntered] = useState(false);

  // Get consent token from URL
  const consentToken = searchParams.get("consent_token");

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [entered]);

  // Route guard: Validate consent token on mount
  useEffect(() => {
    if (!consentToken) {
      setError(t.invalidConsentToken || "Invalid or missing consent token");
      setLoading(false);
      
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
    } else {
      loadUserProfile();
    }
  }, [consentToken, navigate, t]);

  async function loadUserProfile() {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getUserProfileForConsent(consentToken);
      
      setUser(data.user);
      setApp(data.app);
      setPermissions(data.permissions || []);
      setRedirectUri(data.redirectUri);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load user profile:", err);
      setError(err.message || t.sessionExpired || "Session expired. Please try again.");
      setLoading(false);
      
      // Redirect to login after a delay if token is invalid
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
    }
  }

  async function handleApprove() {
    console.log("handleApprove called", { consentToken, redirectUri });
    
    if (!consentToken || !redirectUri) {
      setError(t.invalidRequest || "Invalid request");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      console.log("Submitting consent approval...");
      const result = await submitConsent("approve", consentToken, redirectUri);
      console.log("Consent result:", result);
      
      if (result.success && result.redirectUrl) {
        // Redirect to the third-party app with authorization code
        window.location.href = result.redirectUrl;
      } else {
        setError(t.consentFailed || "Failed to process consent");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("Failed to approve consent:", err);
      setError(err.message || t.consentFailed || "Failed to process consent");
      setSubmitting(false);
    }
  }

  async function handleDeny() {
    if (!consentToken || !redirectUri) {
      setError(t.invalidRequest || "Invalid request");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const result = await submitConsent("deny", consentToken, redirectUri);
      
      if (result.redirectUrl) {
        // Redirect to the third-party app with error
        window.location.href = result.redirectUrl;
      } else {
        setError(t.consentFailed || "Failed to process consent");
        setSubmitting(false);
      }
    } catch (err) {
      console.error("Failed to deny consent:", err);
      setError(err.message || t.consentFailed || "Failed to process consent");
      setSubmitting(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div
        className="min-h-screen w-full bg-white flex items-center justify-center px-4"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="text-center">
          <p className="text-gray-600">{t.loading || "Loading..."}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !user) {
    return (
      <div
        className="min-h-screen w-full bg-white flex items-center justify-center px-4"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="w-full max-w-xl">
          <div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 sm:p-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {t.errorTitle || "Error"}
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button primary onClick={() => navigate("/login")}>
                {t.backToSignIn || "Back to Sign in"}
              </Button>
            </div>
          </div>
          <Footer language={language} />
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

          {/* Consent header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t.consentTitle || "Authorization Request"}
            </h1>
            <p className="text-gray-600">
              {t.consentSubtitle || "An application is requesting access to your account"}
            </p>
          </div>

          {/* User profile section */}
          {user && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-4">
                {user.photo ? (
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <FaUserCircle className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* App information */}
          {app && (
            <div className="mb-6">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <IoShieldCheckmark className="w-6 h-6 text-[#20ABF0] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{app.name}</span>
                    {app.domain && (
                      <span className="text-gray-500"> ({app.domain})</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {t.consentAppMessage || "is requesting access to your Poswize account"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Permissions list */}
          {permissions && permissions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                {t.permissionsTitle || "This application will be able to:"}
              </h3>
              <ul className="space-y-2">
                {permissions.map((permission, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm text-gray-700"
                  >
                    <svg
                      className="w-5 h-5 text-[#20ABF0] flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{permission}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              primary
              onClick={handleApprove}
              disabled={submitting}
            >
              {submitting
                ? t.processing || "Processing..."
                : t.allowAccess || "Allow Access"}
            </Button>
            <Button
              onClick={handleDeny}
              disabled={submitting}
            >
              {t.denyAccess || "Deny"}
            </Button>
          </div>

          {/* Privacy notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              {t.consentPrivacyNotice ||
                "By allowing access, you agree to share your information with this application"}
            </p>
          </div>
        </div>

        {/* Page footer */}
        <Footer language={language} />
      </div>
    </div>
  );
}
