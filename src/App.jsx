import React from "react";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import OAuthLogin from "./Pages/OAuthLogin";
import OAuthConsent from "./Pages/OAuthConsent";
import OAuthSignup from "./Pages/OAuthSignup";
import VerifySignupOTP from "./Pages/VerifySignupOTP";
import {
  TranslationProvider,
  LanguageTransition,
} from "./contexts/TranslationContext";
import ForgetPassword from "./Pages/ForgetPassword";
import OTPPage from "./Pages/OTPPage";
import ResetPassword from "./Pages/ResetPassword";
import { BrowserRouter, Route, Routes } from "react-router-dom";

export default function App() {
  // Dynamically determine basename from current URL
  const getBasename = () => {
    const pathname = window.location.pathname;
    // If we're on /testAPI/oauth-ui/..., use /testAPI/oauth-ui as basename
    const match = pathname.match(/^(\/[^\/]+\/oauth-ui)/);
    if (match) {
      return match[1]; // e.g., "/testAPI/oauth-ui"
    }
    // Default to /oauth-ui for localhost
    return '/oauth-ui';
  };

  return (
    <TranslationProvider>
      <LanguageTransition>
        <BrowserRouter basename={getBasename()}>
          <Routes>
            <Route path="/login" element={<OAuthLogin />} />
            <Route path="/consent" element={<OAuthConsent />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-signup-otp" element={<VerifySignupOTP />} />
            <Route path="/complete-registration" element={<OAuthSignup />} />
            <Route path="/standalone-login" element={<Login />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path="/verify-otp" element={<OTPPage />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/" element={<OAuthLogin />} />
          </Routes>
        </BrowserRouter>
      </LanguageTransition>
    </TranslationProvider>
  );
}
