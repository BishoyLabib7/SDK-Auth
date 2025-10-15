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
  // Use different basename for production vs development
  // Production: served at /testAPI/oauth (with nginx prefix)
  // Development: served at /oauth (direct from backend)
  const basename = import.meta.env.MODE === 'production' ? '/testAPI/oauth' : '/oauth';
  
  return (
    <TranslationProvider>
      <LanguageTransition>
        <BrowserRouter basename={basename}>
          <OAuthProvider>
            <Routes>
              <Route path="/" element={<Login />} />
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
