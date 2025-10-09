import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import { getTranslations } from "../lib/translations";

const TranslationContext = createContext();
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  const translations = useMemo(() => getTranslations(language), [language]);

  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === "en" ? "ar" : "en"));
  };

  const changeLanguage = (newLanguage) => {
    if (newLanguage === "en" || newLanguage === "ar") {
      setLanguage(newLanguage);
    }
  };

  const isRTL = language === "ar";

  const value = {
    language,
    translations,
    toggleLanguage,
    changeLanguage,
    isRTL,
    t: translations,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export { TranslationContext };

// Smoothly animates content on language change
export const LanguageTransition = ({ children }) => {
  const { language } = useTranslation();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    setEntered(false);
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [language]);

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      }`}
    >
      {children}
    </div>
  );
};
