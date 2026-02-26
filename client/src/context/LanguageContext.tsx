import React, { createContext, useContext, useState } from "react";

type Language = "sinhala" | "english" | "tamil";

interface LangContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LangContextType>({
  language: "sinhala",
  setLanguage: () => { },
});

export const LanguageProvider = ({ children }: any) => {
  const [language, setLanguage] = useState<Language>("sinhala");

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
