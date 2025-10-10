import React from "react";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import OAuthLogin from "./Pages/OAuthLogin";
import OAuthConsent from "./Pages/OAuthConsent";
import OAuthSignup from "./Pages/OAuthSignup";
import {
  TranslationProvider,
  LanguageTransition,
} from "./contexts/TranslationContext";
import ForgetPassword from "./Pages/ForgetPassword";
import OTPPage from "./Pages/OTPPage";
import ResetPassword from "./Pages/ResetPassword";
import { BrowserRouter, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <TranslationProvider>
      <LanguageTransition>
        <BrowserRouter basename="/oauth-ui">
          <Routes>
            <Route path="/login" element={<OAuthLogin />} />
            <Route path="/consent" element={<OAuthConsent />} />
            <Route path="/signup" element={<Signup />} />
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
