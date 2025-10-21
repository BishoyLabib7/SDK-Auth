import React, { useEffect, useState } from "react";
import SocialButton from "../UI/SocialButton";
import Input from "../UI/Input";
import Button from "../UI/Button";
import { IoMail, IoLanguage } from "react-icons/io5";
import Logo from "../assets/logo.png";
import Footer from "../UI/Footer";
import { useTranslation } from "../contexts/TranslationContext";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "../lib/service";

export default function ForgetPassword() {
  const { language, translations: t, toggleLanguage, isRTL } = useTranslation();

  const [email, setEmail] = useState("");
  const [entered, setEntered] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []); // Empty dependency array - only run once on mount

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

  const navigate = useNavigate();
  async function handleSendReset() {
    try {
      setError(""); // Clear previous errors
      setLoading(true);
      
      initializeFirebaseIfNeeded();
      await sendPasswordResetEmail(email);
      
      // Pass the email to the OTP page via state
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      console.error('Send reset email error:', err);
      setError(err.message || "Failed to send reset email. Please try again.");
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
            {t.resetTitle}
          </h1>
          <p className="text-sm text-center text-gray-600 mb-8">
            {t.resetSubtitle}
          </p>

          <div className="space-y-3">
            <Input
              type="email"
              icon={<IoMail />}
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRTL={isRTL}
            />
          </div>

          {/* Error message display */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <div className="mt-8">
            <Button primary onClick={handleSendReset} disabled={loading}>
              {loading ? "Sending..." : t.sendResetLink}
            </Button>
          </div>

          <div className="mt-5 text-center text-sm text-gray-700">
            <Link
              to="/login"
              className="font-medium text-[#20ABF0] underline-offset-4 hover:underline cursor-pointer"
            >
              {t.backToSignIn}
            </Link>
          </div>
        </div>
        <Footer language={language} />
      </div>
    </div>
  );
}
