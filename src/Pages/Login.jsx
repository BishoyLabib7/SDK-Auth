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
import { submitOAuthLogin } from "../lib/oauthService";
import { useOAuthContext } from "../contexts/OAuthContext";
import { Link, useNavigate } from "react-router-dom";
import { mapOAuthError } from "../lib/oauthErrorHandler";

export default function Login() {
  const { language, translations: t, toggleLanguage, isRTL } = useTranslation();
  const { setOAuthParams, setConsentData, oauthParams, isInOAuthFlow, clearOAuthContext } = useOAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRemembered, setIsRemembered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [entered, setEntered] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []); // Empty dependency array - only run once on mount

  // Detect OAuth parameters in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect_uri = urlParams.get('redirect_uri');

    console.log('=== Login Page Mount ===');
    console.log('Full URL:', window.location.href);
    console.log('Search params:', window.location.search);
    console.log('redirect_uri from URL:', redirect_uri);

    if (redirect_uri) {
      // This is an OAuth flow - store parameters
      // Note: setOAuthParams will generate state if not provided
      const params = {
        redirect_uri,
        response_type: urlParams.get('response_type') || 'code',
        scope: urlParams.get('scope') || '',
        state: urlParams.get('state') || ''
      };
      console.log('Setting OAuth params:', params);
      setOAuthParams(params);
    } else {
      console.log('No redirect_uri in URL - NOT an OAuth flow');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - setOAuthParams is stable

  // Handle social login callback in OAuth flow
  useEffect(() => {
    async function handleSocialOAuthCallback() {
      // Check if returning from social login with OAuth context
      const savedOAuthParams = sessionStorage.getItem('oauth_social_flow');

      if (savedOAuthParams) {
        try {
          const params = JSON.parse(savedOAuthParams);

          // Check if user is now authenticated (social login succeeded)
          // This would typically be indicated by a session cookie or token
          // For now, we'll check authorization status
          const { checkOAuthAuthorization } = await import('../lib/oauthService');
          const response = await checkOAuthAuthorization(params);

          if (response.status === 'needs_consent') {
            // Social login succeeded, show consent screen
            setConsentData(response);
            sessionStorage.removeItem('oauth_social_flow');
            navigate('/auth/oauth/consent');
          } else if (response.status === 'authorized') {
            // Has existing consent, redirect immediately
            sessionStorage.removeItem('oauth_social_flow');
            // Note: clearOAuthContext is not called here because we're in the middle
            // of the social login callback. The context will be cleared on the next page load.
            window.location.href = response.redirect_url;
          }
          // If still unauthenticated, social login failed - stay on login page
        } catch (err) {
          console.error('Social OAuth callback error:', err);
          const errorInfo = mapOAuthError(err.message || 'Social login failed', t);
          setError(errorInfo.message);
          sessionStorage.removeItem('oauth_social_flow');
        }
      }
    }

    handleSocialOAuthCallback();
  }, [setConsentData, navigate, t]);

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
    try {
      setError(""); // Clear any previous errors

      if (isInOAuthFlow()) {
        // OAuth flow - use OAuth login endpoint
        const response = await submitOAuthLogin(email, password, oauthParams);

        if (response.status === 'success') {
          // Needs consent - navigate to consent page
          setConsentData(response);
          navigate('/auth/oauth/consent');
        } else if (response.status === 'authorized') {
          // Has existing consent - clear context and redirect immediately
          clearOAuthContext();
          window.location.href = response.redirect_url;
        } else if (response.status === 'error') {
          // Display error message with proper mapping
          const errorInfo = mapOAuthError(response.error_description || 'Login failed', t);
          setError(errorInfo.message);
        }
      } else {
        // Standard login flow - use existing logic
        initializeFirebaseIfNeeded();
        await loginWithEmailPassword(email, password, isRemembered);
      }
    } catch (err) {
      console.error('Login error:', err);
      // Map error to user-friendly message
      const errorInfo = mapOAuthError(err.message || 'Login failed', t);
      setError(errorInfo.message);
    }
  }

  function handleGoogleSignIn() {
    initializeFirebaseIfNeeded();

    console.log('=== Google Sign In Debug ===');
    console.log('isInOAuthFlow:', isInOAuthFlow());
    console.log('oauthParams:', oauthParams);
    console.log('URL search params:', window.location.search);
    console.log('SessionStorage oauth_params:', sessionStorage.getItem('oauth_params'));

    // If in OAuth flow, preserve OAuth parameters for social login callback
    if (isInOAuthFlow()) {
      // Store OAuth params in sessionStorage so they persist through social auth redirect
      sessionStorage.setItem('oauth_social_flow', JSON.stringify(oauthParams));
      console.log('Calling loginWithGoogle with OAuth params:', oauthParams);
      loginWithGoogle(oauthParams);
    } else {
      console.log('Calling loginWithGoogle without OAuth params (NOT in OAuth flow)');
      loginWithGoogle();
    }
  }

  function handleAppleSignIn() {
    initializeFirebaseIfNeeded();

    // If in OAuth flow, preserve OAuth parameters for social login callback
    if (isInOAuthFlow()) {
      // Store OAuth params in sessionStorage so they persist through social auth redirect
      sessionStorage.setItem('oauth_social_flow', JSON.stringify(oauthParams));
      loginWithApple(oauthParams);
    } else {
      loginWithApple();
    }
  }

  return (
    <div
      className="min-h-screen w-full bg-white flex items-center justify-center px-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-xl">
        <div
          className={`rounded-3xl bg-white shadow-xl border border-gray-100 p-6 sm:p-8 hover:shadow transform transition-all duration-500 ${entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
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

          <div className="flex justify-center items-center gap-3 my-4">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {t.continueWith}
            </span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          {/* Social logins */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
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

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {t.orContinueWithEmail}
            </span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

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

          {/* Error message display */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Primary action */}
          <div className="mt-10">
            <Button primary onClick={handlePrimarySignIn}>
              {t.signIn}
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-5 text-center text-sm text-gray-700">
            <span>{t.notRegistered} </span>
            <Link
              to={`/signup${window.location.search}`}
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
