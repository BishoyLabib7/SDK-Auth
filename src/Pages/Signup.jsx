import React, { useEffect, useState } from "react";
import SocialButton from "../UI/SocialButton";
import Input from "../UI/Input";
import Button from "../UI/Button";
import { FcGoogle } from "react-icons/fc";
import { ImAppleinc } from "react-icons/im";
import { IoMail, IoEye, IoEyeOff, IoLanguage, IoPerson } from "react-icons/io5";
import { FaLock } from "react-icons/fa";
import Logo from "../assets/logo.png";
import Footer from "../UI/Footer";
import { useTranslation } from "../contexts/TranslationContext";
import { useOAuthContext } from "../contexts/OAuthContext";
import {
  signUpWithEmailPassword,
  loginWithGoogle,
  loginWithApple,
  authenticateForOAuth,
  initiateGoogleOAuth,
  initiateAppleOAuth,
  checkUsernameAvailability,
} from "../lib/service";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function Signup() {
  // Get translation context
  const { language, translations: t, toggleLanguage, isRTL } = useTranslation();
  const { oauthContext, loading: loadingOAuthContext, error: oauthError } = useOAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [entered, setEntered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Username validation state
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [entered]);

  // Set OAuth error if present
  useEffect(() => {
    if (oauthError) {
      setError(oauthError);
    }
  }, [oauthError]);

  // Username availability checking with debouncing
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      setUsernameError(null);
      return;
    }

    // Basic validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setUsernameAvailable(false);
      setUsernameError('Username must be 3-20 characters and contain only letters, numbers, and underscores');
      return;
    }

    setCheckingUsername(true);
    setUsernameError(null);

    checkUsernameAvailability(username)
      .then((result) => {
        // Handle response structure: { success, status, data: { available } }
        const available = result.data?.available ?? result.available;
        setUsernameAvailable(available);
        if (!available) {
          setUsernameError('This username is already taken');
        }
      })
      .catch((err) => {
        console.error('Username check error:', err);
        setUsernameError('Unable to check username availability');
      })
      .finally(() => {
        setCheckingUsername(false);
      });
  }, [username]);

  // Firebase mock setup using global variables
  // Expected globals: __app_id, __firebase_config, __initial_auth_token
  function initializeFirebaseIfNeeded() {
    const globals = typeof window !== "undefined" ? window : {};
    const appId = globals.__app_id;
    const config = globals.__firebase_config;
    const token = globals.__initial_auth_token;
    // Mock init: just log presence; in real setup we'd initialize Firebase here
    console.log("[firebase:init]", {
      appId,
      hasConfig: !!config,
      hasToken: !!token,
    });
  }

  async function handlePrimarySignUp() {
    console.log('Sign up clicked', {
      username,
      usernameAvailable,
      usernameError,
      checkingUsername,
      email,
      fullName,
      password,
      confirmPassword,
      agreeToTerms,
      oauthContext
    });

    // Validation
    if (!username || username.trim().length === 0) {
      console.log('Validation failed: Username is required');
      setError(language === 'en' ? 'Username is required' : 'اسم المستخدم مطلوب');
      return;
    }
    if (username.length < 3) {
      console.log('Validation failed: Username too short');
      setError(language === 'en' ? 'Username must be at least 3 characters' : 'يجب أن يكون اسم المستخدم 3 أحرف على الأقل');
      return;
    }
    if (usernameError) {
      console.log('Validation failed: Username error', usernameError);
      setError(usernameError);
      return;
    }
    if (usernameAvailable !== true) {
      console.log('Validation failed: Username not available', usernameAvailable);
      setError(language === 'en' ? 'Please wait for username validation or choose an available username' : 'يرجى انتظار التحقق من اسم المستخدم أو اختيار اسم متاح');
      return;
    }
    if (password !== confirmPassword) {
      console.log('Validation failed: Passwords do not match');
      setError(language === 'en' ? 'Passwords do not match' : 'كلمات المرور غير متطابقة');
      return;
    }
    if (!agreeToTerms) {
      console.log('Validation failed: Terms not agreed');
      setError(language === 'en' ? 'Please agree to terms and conditions' : 'يرجى الموافقة على الشروط والأحكام');
      return;
    }

    console.log('All validations passed, proceeding with signup');
    setError(null);
    setLoading(true);

    try {
      // Check if we're in OAuth flow
      if (oauthContext) {
        // Use OAuth authentication endpoint
        const result = await authenticateForOAuth(
          'signup',
          email,
          password,
          oauthContext.redirectUri,
          fullName,
          username
        );

        if (result.success) {
          if (result.consentToken) {
            // Navigate to consent page with token
            navigate(`/consent?consent_token=${result.consentToken}`);
          } else if (result.redirectUrl) {
            // Direct redirect (shouldn't happen for signup, but handle it)
            window.location.href = result.redirectUrl;
          }
        } else {
          setError(result.error || 'Signup failed. Please try again.');
        }
      } else {
        // Regular signup flow (non-OAuth)
        initializeFirebaseIfNeeded();
        await signUpWithEmailPassword(fullName, email, password);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred during signup. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignUp() {
    if (oauthContext) {
      // OAuth flow: redirect to Google with OAuth context
      const googleUrl = initiateGoogleOAuth(oauthContext.redirectUri, oauthContext.state);
      window.location.href = googleUrl;
    } else {
      // Regular flow
      initializeFirebaseIfNeeded();
      loginWithGoogle();
    }
  }

  function handleAppleSignUp() {
    if (oauthContext) {
      // OAuth flow: redirect to Apple with OAuth context
      const appleUrl = initiateAppleOAuth(oauthContext.redirectUri, oauthContext.state);
      window.location.href = appleUrl;
    } else {
      // Regular flow
      initializeFirebaseIfNeeded();
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

          {/* OAuth Context Display */}
          {oauthContext && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-gray-700 text-center">
                <span className="font-semibold text-blue-600">{oauthContext.appName}</span>
                {' '}
                {language === 'en' 
                  ? 'is requesting access to your account'
                  : 'يطلب الوصول إلى حسابك'}
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Loading OAuth Context */}
          {loadingOAuthContext && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-sm text-gray-600 text-center">
                {language === 'en' ? 'Loading...' : 'جاري التحميل...'}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Input
              type="text"
              icon={<IoPerson />}
              placeholder={t.fullName}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              isRTL={isRTL}
            />

            <Input
              type="email"
              icon={<IoMail />}
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRTL={isRTL}
            />

            {/* Username field with validation (required) */}
            <div>
              <div className={`w-full flex items-center gap-3 rounded-xl border ${
                usernameError ? 'border-red-300' : 
                usernameAvailable === true ? 'border-green-300' : 
                'border-gray-200'
              } bg-white px-4 py-3 focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-[#20ABF0]/20 transition`}>
                <span className="text-gray-400">
                  <IoPerson />
                </span>
                <input
                  className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                  type="text"
                  placeholder={t.username}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  dir={isRTL ? "rtl" : "ltr"}
                  required
                />
                {checkingUsername && (
                  <span className="text-gray-400 text-xs">
                    {language === 'en' ? 'Checking...' : 'جاري التحقق...'}
                  </span>
                )}
                {!checkingUsername && usernameAvailable === true && (
                  <span className="text-green-500 text-xs">✓</span>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <span className="text-red-500 text-xs">✗</span>
                )}
              </div>
              {usernameError && (
                <p className="mt-1 text-xs text-red-500 px-1">{usernameError}</p>
              )}
              {!usernameError && usernameAvailable === true && (
                <p className="mt-1 text-xs text-green-500 px-1">
                  {language === 'en' ? 'Username is available' : 'اسم المستخدم متاح'}
                </p>
              )}
            </div>

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

            <div className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-[#20ABF0]/20 transition">
              <span className="text-gray-400">
                <FaLock />
              </span>
              <input
                className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t.confirmPassword}
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

          <div className="mt-4">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#20ABF0] focus:ring-[#20ABF0]"
              />
              <span>{t.agreeToTerms}</span>
            </label>
          </div>

          <div className="mt-10">
            <Button primary onClick={handlePrimarySignUp} disabled={loading || loadingOAuthContext}>
              {loading ? (language === 'en' ? 'Creating account...' : 'جاري إنشاء الحساب...') : t.signUp}
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {t.orContinueWith}
            </span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          {/* Social signup buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <SocialButton
              icon={<FcGoogle />}
              text={t.google}
              onClick={handleGoogleSignUp}
            />
            <SocialButton
              icon={<ImAppleinc />}
              text={t.apple}
              onClick={handleAppleSignUp}
            />
          </div>

          <div className="mt-5 text-center text-sm text-gray-700">
            <span>{t.alreadyRegistered} </span>
            <Link
              to={oauthContext ? `/login?${searchParams.toString()}` : "/login"}
              className="font-medium text-[#20ABF0] underline-offset-4 hover:underline cursor-pointer"
            >
              {t.signIn}
            </Link>
          </div>
        </div>
        <Footer language={language} />
      </div>
    </div>
  );
}
