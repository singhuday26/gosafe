import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Dynamically import translation files for better performance
const loadTranslations = async (language: string) => {
  try {
    const translations = await import(`./locales/${language}.json`);
    return translations.default;
  } catch (error) {
    console.warn(
      `Failed to load translations for ${language}, falling back to English`
    );
    const fallback = await import("./locales/en.json");
    return fallback.default;
  }
};

// Load available translation files - complete languages with all translations
const availableLanguages = [
  "en",
  "hi",
  "bn",
  "te",
  "as",
  "es",
  "zh",
  "ar",
  "de",
  "pt",
  "ru",
];

// Load initial translations synchronously for immediate use
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import bn from "./locales/bn.json";
import te from "./locales/te.json";
import as from "./locales/as.json";
import es from "./locales/es.json";
import zh from "./locales/zh.json";
import ar from "./locales/ar.json";
import de from "./locales/de.json";
import pt from "./locales/pt.json";
import ru from "./locales/ru.json";

// Comprehensive language support - dynamically imported
export const SUPPORTED_LANGUAGES = [
  // Northeast Languages
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", region: "Northeast" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", region: "Northeast" },
  {
    code: "mni",
    name: "Manipuri",
    nativeName: "মৈতৈলোন্",
    region: "Northeast",
  },
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
  {
    code: "en",
    name: "English",
    nativeName: "English",
    region: "International",
  },
  { code: "zh", name: "Chinese", nativeName: "中文", region: "International" },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    region: "International",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    region: "International",
  },
  {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    region: "International",
  },
  {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    region: "International",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    region: "International",
  },
  // Additional international languages (fallback to English)
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    region: "International",
  },
  { code: "ko", name: "Korean", nativeName: "한국어", region: "International" },
  {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    region: "International",
  },
];

// Load available translation files
const resources: Record<string, { translation: unknown }> = {};

// Initialize with English translations for immediate availability
const initializeResources = async () => {
  try {
    const enTranslations = await import("./locales/en.json");
    resources.en = { translation: enTranslations.default };
    console.log("✅ i18n: English translations loaded");
  } catch (error) {
    console.error("❌ i18n: Failed to load English translations:", error);
  }
};

// Lazy load additional translations
const lazyLoadLanguage = async (language: string) => {
  if (!resources[language] && availableLanguages.includes(language)) {
    try {
      const translations = await loadTranslations(language);
      resources[language] = { translation: translations };
      i18n.addResourceBundle(language, "translation", translations, true, true);
      return true;
    } catch (error) {
      console.error(`Failed to lazy load ${language}:`, error);
      return false;
    }
  }
  return true;
};

// Initialize i18n with async resource loading
const initializeI18n = async () => {
  await initializeResources();

  // Enhanced i18n configuration with comprehensive fallback handling
  i18n.use(initReactI18next).init({
    resources,
    lng: localStorage.getItem("language") || "en", // Use stored language or default to English
    fallbackLng: {
      // Northeast languages fallback to Bengali or English
      as: ["bn", "hi", "en"],
      mni: ["bn", "hi", "en"],
      grt: ["bn", "en"],
      kha: ["en", "hi"],
      lus: ["en", "hi"],
      nag: ["en", "hi"],
      adi: ["en", "hi"],
      bpy: ["bn", "hi", "en"],
      sit: ["hi", "en"],

      // Indian languages fallback to Hindi then English
      ta: ["hi", "en"],
      ml: ["hi", "en"],
      kn: ["hi", "en"],
      gu: ["hi", "en"],
      mr: ["hi", "en"],
      pa: ["hi", "en"],
      or: ["hi", "en"],
      ur: ["hi", "en"],
      te: ["hi", "en"],

      // International languages fallback to English
      zh: ["en"],
      es: ["en"],
      ar: ["en"],
      pt: ["en"],
      ru: ["en"],
      de: ["en"],
      ja: ["en"],
      ko: ["en"],
      it: ["en"],
      tr: ["en"],
      pl: ["en"],
      nl: ["en"],
      sv: ["en"],
      da: ["en"],
      no: ["en"],
      fi: ["en"],
      hu: ["en"],
      cs: ["en"],
      sk: ["en"],
      uk: ["en"],
      bg: ["en"],
      ro: ["en"],
      hr: ["en"],
      sr: ["en"],
      sl: ["en"],
      et: ["en"],
      lv: ["en"],
      lt: ["en"],
      el: ["en"],
      he: ["en"],
      th: ["en"],
      vi: ["en"],
      id: ["en"],
      ms: ["en"],
      tl: ["en"],
      sw: ["en"],

      // Default fallback
      default: ["en"],
    },
    debug: false, // Disable debug in production

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
      bindI18n: "languageChanged",
      bindI18nStore: "added",
      transEmptyNodeValue: "",
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ["br", "strong", "i", "em"],
    },

    // Performance optimizations
    load: "languageOnly", // Don't load country-specific variants
    cleanCode: true,
    lowerCaseLng: true,
  });
};

// Initialize i18n
initializeI18n();

// Enhanced language change handler with lazy loading
const enhancedChangeLanguage = async (language: string) => {
  try {
    // Try to lazy load the language first
    await lazyLoadLanguage(language);

    // Then change the language using the original method
    const result = await i18n.changeLanguage(language);

    // Update localStorage and document attributes
    localStorage.setItem("language", language);
    document.documentElement.lang = language;

    // Update direction for RTL languages
    const rtlLanguages = ["ar", "he", "ur"];
    document.documentElement.dir = rtlLanguages.includes(language)
      ? "rtl"
      : "ltr";

    // Dispatch custom event for smooth transitions
    window.dispatchEvent(
      new CustomEvent("languageChanged", {
        detail: {
          language,
          isRTL: rtlLanguages.includes(language),
        },
      })
    );

    return result;
  } catch (error) {
    console.error("Language change failed:", error);
    throw error;
  }
};

// Export enhanced change language function
export const changeLanguageSmooth = enhancedChangeLanguage;

export default i18n;
