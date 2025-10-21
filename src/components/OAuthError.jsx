import React from "react";
import Button from "../UI/Button";
import Footer from "../UI/Footer";
import { IoLanguage } from "react-icons/io5";
import { useTranslation } from "../contexts/TranslationContext";

/**
 * Reusable OAuth Error Component
 * 
 * Displays error messages with appropriate actions based on error type
 * 
 * @param {Object} props
 * @param {string} props.error - Error message to display
 * @param {string} props.errorType - Type of error (network, session_expired, invalid_redirect, validation, server)
 * @param {Function} props.onRetry - Optional retry callback for recoverable errors
 * @param {Function} props.onRestart - Optional restart callback for session expired errors
 * @param {Function} props.onCancel - Optional cancel callback
 * @param {boolean} props.showLanguageToggle - Whether to show language toggle button
 */
export default function OAuthError({
  error,
  errorType = "server",
  onRetry,
  onRestart,
  onCancel,
  showLanguageToggle = true,
}) {
  const { language, translations: t, toggleLanguage, isRTL } = useTranslation();

  // Determine if error is recoverable
  const isRecoverable = errorType === "network" || errorType === "server";
  const isSessionExpired = errorType === "session_expired";
  const isInvalidRedirect = errorType === "invalid_redirect";

  return (
    <div
      className="min-h-screen w-full bg-white flex items-center justify-center px-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-xl">
        <div className="rounded-3xl bg-white shadow-xl border border-red-100 p-6 sm:p-8">
          {/* Language toggle */}
          {showLanguageToggle && (
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
          )}

          {/* Error content */}
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t.oauthErrorTitle}
            </h2>
            <p className="text-sm text-gray-600 mb-6">{error}</p>

            {/* Action buttons based on error type */}
            <div className="flex flex-col gap-3">
              {/* Retry button for recoverable errors */}
              {isRecoverable && onRetry && (
                <Button primary onClick={onRetry}>
                  {t.retry}
                </Button>
              )}

              {/* Restart button for session expired */}
              {isSessionExpired && onRestart && (
                <Button primary onClick={onRestart}>
                  {t.oauthRestartFlow || "Restart"}
                </Button>
              )}

              {/* Cancel/Go Back button */}
              {onCancel && !isInvalidRedirect && (
                <Button onClick={onCancel}>
                  {t.cancel}
                </Button>
              )}

              {/* For invalid redirect, only show a contact support message */}
              {isInvalidRedirect && (
                <p className="text-xs text-gray-500 mt-2">
                  {t.oauthContactSupport || "Please contact the application developer for support."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Page footer */}
        <Footer language={language} />
      </div>
    </div>
  );
}
