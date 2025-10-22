import React, { useEffect, useMemo, useState } from "react";
import Button from "../UI/Button";
import Footer from "../UI/Footer";
import Logo from "../assets/logo.png";
import { IoLanguage } from "react-icons/io5";
import { useTranslation } from "../contexts/TranslationContext";
import { useOAuthContext } from "../contexts/OAuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export default function SignupOTPPage() {
  const { language, translations: t, toggleLanguage, isRTL } = useTranslation();
  const { setOAuthParams } = useOAuthContext();
  const location = useLocation();
  const email = location.state?.email || "user@example.com";

  const [entered, setEntered] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Detect OAuth parameters in URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect_uri = urlParams.get('redirect_uri');
    
    if (redirect_uri) {
      // This is an OAuth flow - store parameters
      const params = {
        redirect_uri,
        response_type: urlParams.get('response_type') || 'code',
        scope: urlParams.get('scope') || '',
        state: urlParams.get('state') || ''
      };
      setOAuthParams(params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const code = useMemo(() => otp.join(""), [otp]);

  function handleChange(index, value) {
    if (/^\d?$/.test(value)) {
      const next = [...otp];
      next[index] = value;
      setOtp(next);
      if (value && index < otp.length - 1) {
        const nextInput = document.getElementById(`signup-otp-${index + 1}`);
        nextInput && nextInput.focus();
      }
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`signup-otp-${index - 1}`);
      prevInput && prevInput.focus();
    }
  }

  const navigate = useNavigate();

  async function handleResend() {
    try {
      setError("");
      setResendLoading(true);
      
      const response = await fetch('/oauth2/api/auth/signUp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend code');
      }
      
      setError("");
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.message || "Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  }

  async function handleVerify() {
    try {
      setError("");
      setLoading(true);

      if (code.length !== 4) {
        setError("Please enter all 4 digits");
        setLoading(false);
        return;
      }

      const response = await fetch('/oauth2/api/auth/verifyAccount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid code');
      }

      const data = await response.json();

      // Store token if provided
      if (data.data && data.data.token) {
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user_data', JSON.stringify(data.data));
      }

      // Don't clear OAuth context - preserve it for login redirect
      // Only clear social flow flag since this is email/password signup
      sessionStorage.removeItem('oauth_social_flow');

      // Navigate to login, preserving OAuth parameters in URL
      const oauthParams = sessionStorage.getItem('oauth_params');
      if (oauthParams) {
        try {
          const params = JSON.parse(oauthParams);
          const queryString = new URLSearchParams(params).toString();
          navigate(`/login?${queryString}`, { replace: true });
        } catch (error) {
          console.error('Failed to parse OAuth params:', error);
          navigate("/login", { replace: true });
        }
      } else {
        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError(err.message || "Invalid code. Please try again.");
      setOtp(["", "", "", ""]);
      const firstInput = document.getElementById('signup-otp-0');
      firstInput && firstInput.focus();
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
          } hover:-translate-y-0.5 hover:shadow-2xl`}
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
            className="mx-auto mb-6 transition-transform duration-300 hover:scale-105"
          />

          <h1 className="text-xl font-semibold text-center text-gray-900 mb-2">
            {t.otpTitle}
          </h1>
          <p className="text-sm text-center text-gray-600 mb-8">
            {t.otpSubtitlePrefix}{" "}
            <span className="font-medium text-gray-900">{email}</span>
          </p>

          <div
            className="flex justify-center gap-3 mb-8"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`signup-otp-${idx}`}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                autoComplete="off"
                className="w-14 h-14 sm:w-16 sm:h-16 text-center text-2xl font-bold rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-[#20ABF0] focus:ring-4 focus:ring-[#20ABF0]/20 outline-none transition-all duration-200 hover:border-gray-300"
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button onClick={handleResend} disabled={resendLoading}>
              {resendLoading ? "Sending..." : t.otpResend}
            </Button>
            <Button primary onClick={handleVerify} disabled={loading}>
              {loading ? "Verifying..." : t.otpVerify}
            </Button>
          </div>
        </div>
        <Footer language={language} />
      </div>
    </div>
  );
}
