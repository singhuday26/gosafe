import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import bn from "./locales/bn.json";
import te from "./locales/te.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
];

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  bn: { translation: bn },
  te: { translation: te },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // default language
  fallbackLng: "en",
  debug: false,

  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },

  detection: {
    order: ["localStorage", "navigator", "htmlTag"],
    caches: ["localStorage"],
  },
});

export default i18n;
