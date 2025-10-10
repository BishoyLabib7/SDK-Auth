import React, { useEffect, useState } from "react";
import Input from "../UI/Input";
import Button from "../UI/Button";
import { IoPerson, IoLanguage } from "react-icons/io5";
import Logo from "../assets/logo.png";
import Footer from "../UI/Footer";
import { useTranslation } from "../contexts/TranslationContext";
import { completeOAuthRegistration } from "../lib/service";

export default function OAuthSignup() {
  const { language, translations: t, toggleLanguage, isRTL } = useTranslation();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [entered, setEntered] = useState(false);
  const [oauthData, setOauthData] = useState(null);
  const [redirectUri, setRedirectUri] = useState('');

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [entered]);

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const provider = params.get('provider');
    const email = params.get('email');
    const name = params.get('name');
    const providerId = params.get('providerId');
    const redirectUriParam = params.get('redirect_uri');
    
    if (provider && email && name && providerId) {
      setOauthData({ provider, email, name, providerId });
      setRedirectUri(redirectUriParam || 'http://localhost:3001/auth/poswize/callback');
    } else {
      setError("Invalid OAuth registration request. Missing required parameters.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError(t.pleaseEnterUsername);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await completeOAuthRegistration({
        username: username.trim(),
        email: oauthData.email,
        name: oauthData.name,
        provider: oauthData.provider,
        providerId: oauthData.providerId,
      });

      setSuccess(true);
      // Redirect to OAuth consent page with proper parameters
      const appName = new URL(redirectUri).hostname;
      const consentUrl = `/oauth-ui/consent?redirect_uri=${encodeURIComponent(redirectUri)}&appName=${encodeURIComponent(appName)}&userName=${encodeURIComponent(oauthData.name)}&userEmail=${encodeURIComponent(oauthData.email)}&userPhoto=${encodeURIComponent('https://postbet.com/default-avatar.png')}`;
      setTimeout(() => {
        window.location.href = consentUrl;
      }, 2000);
    } catch (err) {
      setError(err.message || t.registrationFailed);
    } finally {
      setLoading(false);
    }
  };

  if (!oauthData) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#20ABF0] mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loadingRegistrationInfo}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{t.registrationComplete}</h2>
          <p className="text-gray-600">{t.redirectingOAuth}</p>
        </div>
      </div>
    );
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
            className="mx-auto mb-8 transition-transform duration-300 hover:scale-105"
          />

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {t.completeRegistration}
            </h2>
            <p className="text-gray-600">
              {t.chooseUsername}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {oauthData.email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.username}
              </label>
              <Input
                type="text"
                icon={<IoPerson />}
                placeholder={t.username}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                isRTL={isRTL}
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              primary
              disabled={loading || !username.trim()}
              className="w-full"
            >
              {loading ? t.completing : t.completeSignup}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              By completing registration, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
        
        <Footer language={language} />
      </div>
    </div>
  );
}
