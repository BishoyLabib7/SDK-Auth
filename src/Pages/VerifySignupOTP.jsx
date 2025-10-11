import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../contexts/TranslationContext";
import { verifySignupOtp, resendOtp } from "../lib/service";
import Logo from "../assets/logo.png";
import Footer from "../UI/Footer";
import { IoLanguage } from "react-icons/io5";

export default function VerifySignupOTP() {
  const { language, translations: t, toggleLanguage, isRTL } = useTranslation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [email, setEmail] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    // Get email and redirect_uri from sessionStorage
    const storedEmail = sessionStorage.getItem('signup_email');
    const storedRedirectUri = sessionStorage.getItem('signup_redirect_uri');
    
    if (!storedEmail) {
      // If no email, redirect back to signup
      navigate('/signup');
      return;
    }
    
    setEmail(storedEmail);
    setRedirectUri(storedRedirectUri || '');
    
    // Focus first input
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, [navigate]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 4) {
      setError(t.pleaseEnterCompleteOtp || "Please enter the complete 4-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Call verifySignupOtp which returns { token, user }
      const response = await verifySignupOtp(email, code);
      
      // Store the token in localStorage
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }
      
      // Clear session storage
      sessionStorage.removeItem('signup_email');
      sessionStorage.removeItem('signup_redirect_uri');
      
      // If there's a redirect_uri (OAuth flow), redirect to backend authorize with token
      if (redirectUri) {
        // Get API base URL
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
        
        // Redirect to backend OAuth authorize with token
        // Backend will handle consent check and redirect appropriately
        window.location.href = `${apiBaseUrl}/oauth/authorize?response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&client_id=poswize-client&token=${encodeURIComponent(response.token)}`;
      } else {
        // If not in OAuth flow, redirect to standalone login success or home
        navigate('/standalone-login');
      }
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setError("");

    try {
      await resendOtp(email);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src={Logo}
              alt="Logo"
              className="w-20 h-20 mx-auto mb-6 rounded-full"
            />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {t.verifyYourEmail || "Verify Your Email"}
            </h2>
            <p className="text-gray-600">
              {t.weSentCodeTo || "We sent a 4-digit code to"}
            </p>
            <p className="text-sm font-medium text-gray-800 mt-1">{email}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {resendSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                {t.otpResentSuccess || "OTP sent successfully!"}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                {t.enterFourDigitCode || "Enter 4-digit code"}
              </label>
              <div className={`flex justify-center gap-4`}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-14 h-14 text-center text-lg font-semibold border-2 border-gray-300 rounded-xl focus:border-[#20ABF0] focus:ring-2 focus:ring-[#20ABF0]/20 outline-none transition"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || otp.join("").length !== 4}
              className="w-full bg-gradient-to-r from-[#20ABF0] to-[#1890d5] text-white py-3 rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loading ? t.verifying || "Verifying..." : t.verify || "Verify"}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                {t.didNotReceiveCode || "Didn't receive the code?"}
              </p>
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-[#20ABF0] font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? t.resending || "Resending..." : t.resendOtp || "Resend OTP"}
              </button>
            </div>
          </div>

          <button
            onClick={toggleLanguage}
            className="mt-6 mx-auto flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <IoLanguage size={20} />
            <span className="text-sm font-medium">
              {language === "en" ? "العربية" : "English"}
            </span>
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

