import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    setLanguage(i18n.language);
  }, [i18n.language]);

  const handleLanguageChange = (event) => {
    const selectedLang = event.target.value;
    i18n.changeLanguage(selectedLang);
  };

  const languageOptions = {
    en: "🇺🇸 English",
    zh: "🇨🇳 中文"
  };

  return (
    <div>
      <select
        value={language}
        onChange={handleLanguageChange}
        className="bg-white text-right text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
      >
        {Object.entries(languageOptions).map(([code, name]) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
