import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Input from "../UI/Input";
import Button from "../UI/Button";
import { IoPersonOutline } from "react-icons/io5";
import Logo from "../assets/logo.png";
import { useTranslation } from "../contexts/TranslationContext";

export default function CompleteRegistration() {
  const { translations: t, isRTL } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = searchParams.get("token");
  const provider = searchParams.get("provider");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  async function handleSubmit() {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/oauth2/api/Auth/complete-oauth-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registration_token: token,
          username: username.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to complete registration");
      }

      const result = await response.json();
      console.log('Registration response:', result);

      // Extract data from wrapped response if needed
      const data = result.data || result;
      const status = data.status || result.status;

      // Handle different response types
      if (status === "consent_required") {
        // Redirect to consent page with the consent token
        const consentToken = data.consent_token || result.consent_token;

        // Preserve OAuth params in URL for consent page
        const oauthContext = sessionStorage.getItem('oauth_callback_context');
        let consentUrl = `/oauth/consent?consent_token=${encodeURIComponent(consentToken)}`;

        if (oauthContext) {
          const params = JSON.parse(oauthContext);
          if (params.redirect_uri) {
            consentUrl += `&redirect_uri=${encodeURIComponent(params.redirect_uri)}`;
            consentUrl += `&response_type=${encodeURIComponent(params.response_type || 'code')}`;
            consentUrl += `&scope=${encodeURIComponent(params.scope || '')}`;
            consentUrl += `&state=${encodeURIComponent(params.state || '')}`;
          }
        }

        navigate(consentUrl);
      } else if (status === "authorized") {
        // Redirect to third-party app
        const redirectUrl = data.redirect_url || result.redirect_url;
        window.location.href = redirectUrl;
      } else if (result.token) {
        // Direct token in response
        navigate(`/auth/success?token=${encodeURIComponent(result.token)}`);
      } else if (data.token) {
        // Token in data object
        navigate(`/auth/success?token=${encodeURIComponent(data.token)}`);
      } else {
        console.log('Unexpected response format:', result);
        setError("Registration completed but received unexpected response format");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to complete registration");
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
        <div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-6 sm:p-8">
          <img
            src={Logo}
            alt="logo"
            className="mx-auto mb-6 transition-transform duration-300 hover:scale-105"
          />

          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-2">
            Complete Your Registration
          </h2>
          <p className="text-center text-gray-600 mb-8">
            You signed in with {provider}. Please choose a username to complete your account.
          </p>

          <div className="space-y-4">
            <Input
              type="text"
              icon={<IoPersonOutline />}
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              isRTL={isRTL}
            />

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            <Button primary onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating Account..." : "Complete Registration"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
