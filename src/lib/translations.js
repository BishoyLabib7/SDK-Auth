export const translations = {
  en: {
    // Common
    continueWith: "Continue with",
    orContinueWithEmail: "or Continue with Email",
    google: "Google",
    apple: "Apple",
    ar: "AR",
    en: "English",

    // Login specific
    email: "Email",
    password: "Password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    signIn: "Sign in",
    notRegistered: "Not registered yet?",
    signUp: "Sign up",

    // Signup specific
    fullName: "Full Name",
    confirmPassword: "Confirm Password",
    agreeToTerms: "I agree to the Terms and Conditions",
    alreadyRegistered: "Already have an account?",

    // Password visibility
    hidePassword: "Hide password",
    showPassword: "Show password",
    hideConfirmPassword: "Hide confirm password",
    showConfirmPassword: "Show confirm password",

    // Footer
    copyright: "© 2025 Poswise. All rights reserved.",

    // Forgot password
    resetTitle: "Reset your password",
    resetSubtitle: "Enter your email to receive a reset link",
    sendResetLink: "Send reset link",
    backToSignIn: "Back to Sign in",

    // OTP
    otpTitle: "Enter verification code",
    otpSubtitlePrefix: "We sent a 6-digit code to",
    otpDidntReceive: "Didn't receive the code?",
    otpResend: "Resend",
    otpVerify: "Verify",
    otpChangeEmail: "Change email",
    otpCodePlaceholder: "Enter 6-digit code",

    // Reset password
    resetNewPasswordTitle: "Create new password",
    resetNewPasswordSubtitle:
      "Your new password must be different from the previous",
    newPassword: "New password",
    confirmNewPassword: "Confirm new password",
    updatePassword: "Update password",
  },
  ar: {
    // Common
    continueWith: "تسجيل الدخول بواسطة",
    orContinueWithEmail: "أو المتابعة عبر البريد الإلكتروني",
    google: "Google",
    apple: "Apple",
    ar: "لغة عربية",
    en: "إنجليزي",

    // Login specific
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    rememberMe: "تذكرني",
    forgotPassword: "نسيت كلمة المرور؟",
    signIn: "تسجيل الدخول",
    notRegistered: "لست مسجلاً؟",
    signUp: "إنشاء حساب",

    // Signup specific
    fullName: "الاسم الكامل",
    confirmPassword: "تأكيد كلمة المرور",
    agreeToTerms: "أوافق على الشروط والأحكام",
    alreadyRegistered: "لديك حساب بالفعل؟",

    // Password visibility
    hidePassword: "إخفاء كلمة المرور",
    showPassword: "إظهار كلمة المرور",
    hideConfirmPassword: "إخفاء تأكيد كلمة المرور",
    showConfirmPassword: "إظهار تأكيد كلمة المرور",

    // Footer
    copyright: "© 2025 Poswise. جميع الحقوق محفوظة.",

    // Forgot password
    resetTitle: "إعادة تعيين كلمة المرور",
    resetSubtitle: "أدخل بريدك الإلكتروني لاستلام رابط إعادة التعيين",
    sendResetLink: "إرسال رابط إعادة التعيين",
    backToSignIn: "العودة لتسجيل الدخول",

    // OTP
    otpTitle: "أدخل رمز التحقق",
    otpSubtitlePrefix: "قمنا بإرسال رمز مكون من 6 أرقام إلى",
    otpDidntReceive: "لم يصلك الرمز؟",
    otpResend: "إعادة الإرسال",
    otpVerify: "تحقق",
    otpChangeEmail: "تغيير البريد الإلكتروني",
    otpCodePlaceholder: "أدخل الرمز المكون من 6 أرقام",

    // Reset password
    resetNewPasswordTitle: "إنشاء كلمة مرور جديدة",
    resetNewPasswordSubtitle: "يجب أن تكون مختلفة عن السابقة",
    newPassword: "كلمة المرور الجديدة",
    confirmNewPassword: "تأكيد كلمة المرور الجديدة",
    updatePassword: "تحديث كلمة المرور",
  },
};

export const getTranslations = (language = "en") => {
  return translations[language] || translations.en;
};

export const t = (language = "en", key) => {
  const langTranslations = getTranslations(language);
  return langTranslations[key] || key;
};
