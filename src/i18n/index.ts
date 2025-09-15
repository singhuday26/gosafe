import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import bn from "./locales/bn.json";
import te from "./locales/te.json";
import as from "./locales/as.json";

// Comprehensive language support - dynamically imported
export const SUPPORTED_LANGUAGES = [
  // Northeast Languages
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", region: "Northeast" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", region: "Northeast" },
  { code: "mni", name: "Manipuri", nativeName: "মৈতৈলোন্", region: "Northeast" },
  // Major Indian Languages
  { code: "hi", name: "Hindi", nativeName: "हिंदी", region: "India" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", region: "India" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", region: "India" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", region: "India" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", region: "India" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", region: "India" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", region: "India" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", region: "India" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", region: "India" },
  { code: "ur", name: "Urdu", nativeName: "اردو", region: "India" },
  // International Languages
  { code: "en", name: "English", nativeName: "English", region: "International" },
  { code: "zh", name: "Chinese", nativeName: "中文", region: "International" },
  { code: "es", name: "Spanish", nativeName: "Español", region: "International" },
  { code: "fr", name: "French", nativeName: "Français", region: "International" },
  { code: "ar", name: "Arabic", nativeName: "العربية", region: "International" },
  { code: "pt", name: "Portuguese", nativeName: "Português", region: "International" },
  { code: "ru", name: "Russian", nativeName: "Русский", region: "International" },
  { code: "ja", name: "Japanese", nativeName: "日本語", region: "International" },
  { code: "ko", name: "Korean", nativeName: "한국어", region: "International" },
  { code: "de", name: "German", nativeName: "Deutsch", region: "International" },
  { code: "it", name: "Italian", nativeName: "Italiano", region: "International" },
];

// Load available translation files
const resources = {
  en: { translation: en },
  hi: { translation: hi },
  bn: { translation: bn },
  te: { translation: te },
  as: { translation: as },
};

// Enhanced i18n configuration with comprehensive fallback handling
i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('language') || 'en', // Use stored language or default to English
  fallbackLng: {
    // Northeast languages fallback to Bengali or English
    "as": ["bn", "hi", "en"],
    "mni": ["bn", "hi", "en"],
    "grt": ["bn", "en"],
    "kha": ["en", "hi"],
    "lus": ["en", "hi"],
    "nag": ["en", "hi"],
    "adi": ["en", "hi"],
    "bpy": ["bn", "hi", "en"],
    "sit": ["hi", "en"],
    
    // Indian languages fallback to Hindi then English
    "ta": ["hi", "en"],
    "ml": ["hi", "en"],
    "kn": ["hi", "en"],
    "gu": ["hi", "en"],
    "mr": ["hi", "en"],
    "pa": ["hi", "en"],
    "or": ["hi", "en"],
    "ur": ["hi", "en"],
    "sd": ["hi", "en"],
    "sa": ["hi", "en"],
    "kok": ["hi", "en"],
    "mai": ["hi", "en"],
    "sat": ["hi", "en"],
    "doi": ["hi", "en"],
    "bho": ["hi", "en"],
    "mag": ["hi", "en"],
    
    // International languages fallback to English
    "zh": ["en"],
    "es": ["en"],
    "ar": ["en"],
    "pt": ["en"],
    "ru": ["en"],
    "ja": ["en"],
    "ko": ["en"],
    "fr": ["en"],
    "de": ["en"],
    "it": ["en"],
    "tr": ["en"],
    "pl": ["en"],
    "nl": ["en"],
    "sv": ["en"],
    "da": ["en"],
    "no": ["en"],
    "fi": ["en"],
    "hu": ["en"],
    "cs": ["en"],
    "sk": ["en"],
    "uk": ["en"],
    "bg": ["en"],
    "ro": ["en"],
    "hr": ["en"],
    "sr": ["en"],
    "sl": ["en"],
    "et": ["en"],
    "lv": ["en"],
    "lt": ["en"],
    "el": ["en"],
    "he": ["en"],
    "th": ["en"],
    "vi": ["en"],
    "id": ["en"],
    "ms": ["en"],
    "tl": ["en"],
    "sw": ["en"],
    
    // Default fallback
    "default": ["en"]
  },
  debug: true, // Enable debugging to see translation issues

  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
  
  // Handle missing translations gracefully
  saveMissing: false,
  returnEmptyString: false,
  returnNull: false,
  returnObjects: false,
  
  // React specific options
  react: {
    useSuspense: false,
    bindI18n: 'languageChanged',
    bindI18nStore: 'added',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em'],
  },
});

// Listen for language changes and update localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
  // Update html lang attribute for accessibility
  document.documentElement.lang = lng;
  // Force re-render by updating a custom event
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lng } }));
});

export default i18n;
