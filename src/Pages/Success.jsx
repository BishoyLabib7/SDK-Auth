import React, { useEffect, useState } from "react";
import Button from "../UI/Button";
import Footer from "../UI/Footer";
import Logo from "../assets/logo.png";
import { IoLanguage, IoCheckmarkCircle } from "react-icons/io5";
import { useTranslation } from "../contexts/TranslationContext";
import { useNavigate } from "react-router-dom";

export default function Success() {
  const { language, translations: t, toggleLanguage, isRTL } = useTranslation();
  const [entered, setEntered] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem('user_data');
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    navigate('/login');
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

          {/* Success Icon */}
          <div className="text-center mb-6">
            <IoCheckmarkCircle className="text-green-500 text-6xl mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {language === "en" ? "Success!" : "نجح!"}
            </h1>
            <p className="text-sm text-gray-600">
              {language === "en" 
                ? "Your password has been reset successfully. You are now logged in." 
                : "تم إعادة تعيين كلمة المرور بنجاح. أنت الآن مسجل الدخول."}
            </p>
          </div>

          {/* User Info */}
          {userData && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {language === "en" ? "Your Account" : "حسابك"}
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">
                    {language === "en" ? "Name:" : "الاسم:"}
                  </span>{" "}
                  {userData.name}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">
                    {language === "en" ? "Email:" : "البريد الإلكتروني:"}
                  </span>{" "}
                  {userData.email}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">
                    {language === "en" ? "Username:" : "اسم المستخدم:"}
                  </span>{" "}
                  {userData.username}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button primary onClick={handleLogout}>
              {language === "en" ? "Go to Login" : "الذهاب إلى تسجيل الدخول"}
            </Button>
          </div>

          <div className="mt-5 text-center text-sm text-gray-600">
            {language === "en" 
              ? "This is a demo success page. In production, you would redirect to your application." 
              : "هذه صفحة نجاح تجريبية. في الإنتاج، سيتم إعادة التوجيه إلى تطبيقك."}
          </div>
        </div>
        <Footer language={language} />
      </div>
    </div>
  );
}
