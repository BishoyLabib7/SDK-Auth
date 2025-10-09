import React from "react";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
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
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path="/verify-otp" element={<OTPPage />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </LanguageTransition>
    </TranslationProvider>
  );
}
