import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import {
  TranslationProvider,
  LanguageTransition,
} from "./contexts/TranslationContext";
import { OAuthProvider } from "./contexts/OAuthContext";
import ForgetPassword from "./Pages/ForgetPassword";
import OTPPage from "./Pages/OTPPage";
import SignupOTPPage from "./Pages/SignupOTPPage";
import ResetPassword from "./Pages/ResetPassword";
import Success from "./Pages/Success";
import OAuthAuthorize from "./Pages/OAuthAuthorize";
import OAuthConsent from "./Pages/OAuthConsent";
import CompleteRegistration from "./Pages/CompleteRegistration";
import AuthSuccess from "./Pages/AuthSuccess";
import { BrowserRouter, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <OAuthProvider>
      <TranslationProvider>
        <LanguageTransition>
          <BrowserRouter basename="/oauth2">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forget-password" element={<ForgetPassword />} />
              <Route path="/verify-otp" element={<OTPPage />} />
              <Route path="/verify-signup" element={<SignupOTPPage />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/success" element={<Success />} />
              <Route path="/oauth/authorize" element={<OAuthAuthorize />} />
              <Route path="/auth/oauth/consent" element={<OAuthConsent />} />
              <Route path="/auth/complete-registration" element={<CompleteRegistration />} />
              <Route path="/auth/success" element={<AuthSuccess />} />
              <Route path="/" element={<Login />} />
            </Routes>
          </BrowserRouter>
        </LanguageTransition>
      </TranslationProvider>
    </OAuthProvider>
  );
}
