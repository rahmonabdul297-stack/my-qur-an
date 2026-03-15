import { useState, useEffect } from "react";
import { LanguageContext } from "./languageContext";
import { translations, LANGUAGES } from "../utils/translations";

const LANGUAGE_KEY = "my-quran-language";

const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    return stored && LANGUAGES[stored] ? stored : "en";
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    const dir = LANGUAGES[language]?.dir || "ltr";
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] ?? translations.en?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
