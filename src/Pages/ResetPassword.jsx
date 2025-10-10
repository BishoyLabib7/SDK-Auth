import React, { useEffect, useState } from "react";
import Button from "../UI/Button";
import Footer from "../UI/Footer";
import Logo from "../assets/logo.png";
import { IoEye, IoEyeOff, IoLanguage } from "react-icons/io5";
import { FaLock } from "react-icons/fa";
import { useTranslation } from "../contexts/TranslationContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { updatePassword } from "../lib/service";

export default function ResetPassword() {
  const { language, translations: t, toggleLanguage, isRTL } = useTranslation();
  const [searchParams] = useSearchParams();

  const [entered, setEntered] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [entered]);

  useEffect(() => {
    // Extract email from URL parameters
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      setError("Invalid reset password link. Please request a new password reset.");
    }
  }, [searchParams]);

  function initializeFirebaseIfNeeded() {
    const globals = typeof window !== "undefined" ? window : {};
    const appId = globals.__app_id;
    const config = globals.__firebase_config;
    const token = globals.__initial_auth_token;
    console.log("[firebase:init]", {
      appId,
      hasConfig: !!config,
      hasToken: !!token,
    });
  }

  // Calls backend service to update password

  const navigate = useNavigate();

  async function handleUpdatePassword() {
    setError("");
    
    if (!password || !confirmPassword) {
      setError(t.pleaseEnterBothPasswords);
      return;
    }
    if (password !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }
    if (!email) {
      setError(t.emailMissing);
      return;
    }
    
    setLoading(true);
    try {
      initializeFirebaseIfNeeded();
      await updatePassword(email, password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || t.failedToSendCode);
    } finally {
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
          } hover:-translate-y-0.5 hover:shadow-2xl `}
        >
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

          <img
            src={Logo}
            alt="logo"
            className=" mx-auto mb-6 transition-transform duration-300 hover:scale-105"
          />

          <h1 className="text-xl font-semibold text-center text-gray-900 mb-2">
            {t.resetNewPasswordTitle}
          </h1>
          <p className="text-sm text-center text-gray-600 mb-8">
            {t.resetNewPasswordSubtitle}
          </p>

          <div className="space-y-3">
            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                {t.passwordResetSuccess}
              </div>
            )}

            {/* New Password */}
            <div className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-[#20ABF0]/20 transition">
              <span className="text-gray-400">
                <FaLock />
              </span>
              <input
                className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                type={showPassword ? "text" : "password"}
                placeholder={t.newPassword}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir={isRTL ? "rtl" : "ltr"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-gray-500 hover:text-gray-700 transition-transform duration-150 hover:scale-105"
                aria-label={showPassword ? t.hidePassword : t.showPassword}
              >
                {showPassword ? <IoEyeOff size={18} /> : <IoEye size={18} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-[#20ABF0]/20 transition">
              <span className="text-gray-400">
                <FaLock />
              </span>
              <input
                className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t.confirmNewPassword}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                dir={isRTL ? "rtl" : "ltr"}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="text-gray-500 hover:text-gray-700 transition-transform duration-150 hover:scale-105"
                aria-label={
                  showConfirmPassword
                    ? t.hideConfirmPassword
                    : t.showConfirmPassword
                }
              >
                {showConfirmPassword ? (
                  <IoEyeOff size={18} />
                ) : (
                  <IoEye size={18} />
                )}
              </button>
            </div>
          </div>

          <div className="mt-8">
            <Button primary onClick={handleUpdatePassword} disabled={loading || success || !email}>
              {loading ? t.updating : success ? t.success : t.updatePassword}
            </Button>
          </div>
        </div>
        <Footer language={language} />
      </div>
    </div>
  );
}
