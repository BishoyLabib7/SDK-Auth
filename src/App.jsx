import React from "react";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import {
  TranslationProvider,
  LanguageTransition,
} from "./contexts/TranslationContext";
import { OAuthProvider } from "./contexts/OAuthContext";
import ForgetPassword from "./Pages/ForgetPassword";
import OTPPage from "./Pages/OTPPage";
import ResetPassword from "./Pages/ResetPassword";
import OAuthConsent from "./Pages/OAuthConsent";
import OAuthUsernameSelection from "./Pages/OAuthUsernameSelection";
import { BrowserRouter, Route, Routes } from "react-router-dom";

export default function App() {
  // Auto-detect basename from current URL path
  // Extracts everything before the route (e.g., /testAPI/oauth from /testAPI/oauth/login)
  const currentPath = window.location.pathname;
  const oauthIndex = currentPath.indexOf('/oauth');
  const basename = oauthIndex !== -1 ? currentPath.substring(0, oauthIndex + 6) : '/oauth';

  return (
    <TranslationProvider>
      <LanguageTransition>
        <BrowserRouter basename={basename}>
          <OAuthProvider>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/authorize" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forget-password" element={<ForgetPassword />} />
              <Route path="/verify-otp" element={<OTPPage />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/consent" element={<OAuthConsent />} />
              <Route path="/username" element={<OAuthUsernameSelection />} />
            </Routes>
          </OAuthProvider>
        </BrowserRouter>
      </LanguageTransition>
    </TranslationProvider>
  );
}
