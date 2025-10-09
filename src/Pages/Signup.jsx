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
import {
  signUpWithEmailPassword,
  loginWithGoogle,
  loginWithApple,
} from "../lib/service";
import { Link } from "react-router-dom";

export default function Signup() {
  // Get translation context
  const { language, translations: t, toggleLanguage, isRTL } = useTranslation();

  // State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [entered]);

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
    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    }
    if (!agreeToTerms) {
      console.error("Please agree to terms and conditions");
      return;
    }
    initializeFirebaseIfNeeded();
    await signUpWithEmailPassword(fullName, email, password);
  }

  function handleGoogleSignUp() {
    initializeFirebaseIfNeeded();
    loginWithGoogle();
  }

  function handleAppleSignUp() {
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
            <Button primary onClick={handlePrimarySignUp}>
              {t.signUp}
            </Button>
          </div>

          <div className="mt-5 text-center text-sm text-gray-700">
            <span>{t.alreadyRegistered} </span>
            <Link
              to="/login"
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
