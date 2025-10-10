import React, { useEffect, useState } from "react";
import SocialButton from "../UI/SocialButton";
import Input from "../UI/Input";
import Button from "../UI/Button";
import { FcGoogle } from "react-icons/fc";
import { ImAppleinc } from "react-icons/im";
import { IoMail, IoEye, IoEyeOff, IoLanguage } from "react-icons/io5";
import { FaLock } from "react-icons/fa";
import Logo from "../assets/logo.png";
import Footer from "../UI/Footer";
import { useTranslation } from "../contexts/TranslationContext";
import {
  loginWithEmailPassword,
  loginWithGoogle,
  loginWithApple,
} from "../lib/service";
import { Link } from "react-router-dom";

export default function OAuthLogin() {
  const { language, translations: t, toggleLanguage, isRTL } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRemembered, setIsRemembered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [entered, setEntered] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Get URL parameters
  const [urlParams, setUrlParams] = useState({});

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [entered]);

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const redirectUri = params.get('redirect_uri');
    const appName = params.get('appName');
    const errorParam = params.get('error');
    
    setUrlParams({ redirectUri, appName, error: errorParam });
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
    
    // Check if user is already authenticated (has token from signup verification)
    const authToken = localStorage.getItem('auth_token');
    if (authToken && redirectUri) {
      // User is authenticated, need to check if consent is needed
      // For now, redirect to backend OAuth authorize endpoint which will handle consent
      const getApiBaseUrl = () => {
        if (import.meta.env.VITE_API_BASE_URL) {
          return import.meta.env.VITE_API_BASE_URL;
        }
        const currentPath = window.location.pathname;
        const origin = window.location.origin;
        const apiPathMatch = currentPath.match(/^(\/[^\/]+)\/oauth-ui/);
        if (apiPathMatch) {
          return `${origin}${apiPathMatch[1]}`;
        }
        return origin;
      };
      
      const apiBaseUrl = getApiBaseUrl();
      // Redirect to backend authorize endpoint with token
      // Backend will check consent and redirect appropriately
      window.location.href = `${apiBaseUrl}/oauth/authorize?response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&client_id=poswize-client&token=${encodeURIComponent(authToken)}`;
    }
  }, []);

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

  async function handlePrimarySignIn() {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      initializeFirebaseIfNeeded();
      await loginWithEmailPassword(email, password, isRemembered);
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignIn() {
    initializeFirebaseIfNeeded();
    loginWithGoogle();
  }

  function handleAppleSignIn() {
    initializeFirebaseIfNeeded();
    loginWithApple();
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
            className=" mx-auto mb-10 transition-transform duration-300 hover:scale-105"
          />

          {/* App Name Display */}
          {urlParams.appName && (
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {t.signInToContinue}
              </h2>
              <p className="text-sm text-gray-600">
                <strong className="text-[#20ABF0]">{urlParams.appName}</strong> {t.wantsToAccessYourAccount}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Inputs */}
          <div className="space-y-3">
            <Input
              type="email"
              icon={<IoMail />}
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRTL={isRTL}
            />

            {/* Password with eye toggle */}
            <div className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-[#20ABF0]/20 transition">
              <span className="text-gray-400">
                <FaLock />
              </span>
              <input
                className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                type={showPassword ? "text" : "password"}
                placeholder={t.password}
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
          </div>

          {/* Remember + Forgot */}
          <div className="mt-4 flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isRemembered}
                onChange={(e) => setIsRemembered(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#20ABF0] focus:ring-[#20ABF0]"
              />
              <span>{t.rememberMe}</span>
            </label>
            <Link
              to="/forget-password"
              className="text-sm text-gray-600 hover:text-gray-900 underline-offset-4 hover:underline"
            >
              {t.forgotPassword}
            </Link>
          </div>

          {/* Primary action */}
          <div className="mt-10">
            <Button 
              primary 
              onClick={handlePrimarySignIn}
              disabled={loading}
            >
              {loading ? "Signing in..." : t.signIn}
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {t.continueWith}
            </span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          {/* Social logins */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SocialButton
              icon={<FcGoogle />}
              text={t.google}
              onClick={handleGoogleSignIn}
            />
            <SocialButton
              icon={<ImAppleinc />}
              text={t.apple}
              onClick={handleAppleSignIn}
            />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-700">
            <span>{t.notRegistered} </span>
            <Link
              to={`/signup${urlParams.redirectUri ? `?redirect_uri=${encodeURIComponent(urlParams.redirectUri)}` : ''}`}
              className="font-medium text-[#20ABF0] underline-offset-4 hover:underline cursor-pointer"
            >
              {t.signUp}
            </Link>
          </div>
        </div>
        {/* Page footer */}
        <Footer language={language} />
      </div>
    </div>
  );
}
