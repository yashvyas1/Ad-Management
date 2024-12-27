import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import it from "./locales/it.json";
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    it: { translation: it },
  },
  lng: localStorage.getItem("language") || "en", // default or saved language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React handles escaping
  },
});
export default i18n;
