import React, { useEffect, useMemo, useState } from "react";
import Input from "../UI/Input";
import Button from "../UI/Button";
import Footer from "../UI/Footer";
import Logo from "../assets/logo.png";
import { IoLanguage } from "react-icons/io5";
import { useTranslation } from "../contexts/TranslationContext";
import { Link, useNavigate } from "react-router-dom";
import { verifyOtp, resendOtp } from "../lib/service";

export default function OTPPage({ email: emailProp }) {
  const { language, translations: t, toggleLanguage, isRTL } = useTranslation();

  const [entered, setEntered] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]); // 4 digits
  const [email, setEmail] = useState(emailProp || "");

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [entered]);

  useEffect(() => {
    // Get email from sessionStorage if not provided as prop
    if (!emailProp) {
      const storedEmail = sessionStorage.getItem('resetEmail');
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, [emailProp]);

  const code = useMemo(() => otp.join(""), [otp]);

  function handleChange(index, value) {
    if (/^\d?$/.test(value)) {
      const next = [...otp];
      next[index] = value;
      setOtp(next);
      // Auto-focus next input if a digit entered
      if (value && index < otp.length - 1) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput && nextInput.focus();
      }
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput && prevInput.focus();
    }
  }

  async function handleResend() {
    await resendOtp(email);
  }
  const navigate = useNavigate();
  async function handleVerify() {
    await verifyOtp(email, code);
    // Pass email as query parameter for password reset
    navigate(`/reset-password/token?email=${encodeURIComponent(email)}`);
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
            {t.otpTitle}
          </h1>
          <p className="text-sm text-center text-gray-600 mb-8">
            {t.otpSubtitlePrefix}{" "}
            <span className="font-medium text-gray-900">{email}</span>
          </p>

          <div
            className="flex justify-center gap-4 mb-8"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                className="w-14 h-14 text-center text-lg font-semibold rounded-xl border-2 border-gray-200 bg-white text-gray-900 focus:border-[#20ABF0] focus:ring-2 focus:ring-[#20ABF0]/20 outline-none transition-all"
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button onClick={handleResend}>{t.otpResend}</Button>
            <Button primary onClick={handleVerify}>
              {t.otpVerify}
            </Button>
          </div>

          <div className="mt-5 text-center text-sm text-gray-700">
            <Link
              to="./reset-password/2"
              className="font-medium text-[#20ABF0] underline-offset-4 hover:underline cursor-pointer"
            >
              {t.otpChangeEmail}
            </Link>
          </div>
        </div>
        <Footer language={language} />
      </div>
    </div>
  );
}
