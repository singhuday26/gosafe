import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { changeLanguageSmooth } from "@/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Languages, Globe, Loader2 } from "lucide-react";

// Comprehensive language list with North-eastern languages prioritized
const languages = [
  // North-eastern Languages (Priority)
  {
    code: "as",
    name: "Assamese",
    nativeName: "অসমীয়া",
    flag: "🇮🇳",
    region: "Northeast",
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    flag: "🇮🇳",
    region: "Northeast",
  },
  {
    code: "mni",
    name: "Manipuri (Meitei)",
    nativeName: "মৈতৈলোন্",
    flag: "🇮🇳",
    region: "Northeast",
  },
  {
    code: "grt",
    name: "Garo",
    nativeName: "A·chik",
    flag: "🇮🇳",
    region: "Northeast",
  },
  {
    code: "kha",
    name: "Khasi",
    nativeName: "Khasi",
    flag: "🇮🇳",
    region: "Northeast",
  },
  {
    code: "lus",
    name: "Mizo (Lushai)",
    nativeName: "Mizo ṭawng",
    flag: "🇮🇳",
    region: "Northeast",
  },
  {
    code: "nag",
    name: "Nagamese",
    nativeName: "Nagamese",
    flag: "🇮🇳",
    region: "Northeast",
  },
  {
    code: "adi",
    name: "Adi",
    nativeName: "Adi",
    flag: "🇮🇳",
    region: "Northeast",
  },
  {
    code: "bpy",
    name: "Bishnupriya",
    nativeName: "বিষ্ণুপ্রিয়া মণিপুরী",
    flag: "🇮🇳",
    region: "Northeast",
  },
  {
    code: "sit",
    name: "Sikkim (Nepali)",
    nativeName: "नेपाली",
    flag: "🇮🇳",
    region: "Northeast",
  },

  // Major Indian Languages
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिंदी",
    flag: "🇮🇳",
    region: "India",
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    flag: "🇮🇳",
    region: "India",
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    flag: "🇮🇳",
    region: "India",
  },
  {
    code: "ml",
    name: "Malayalam",
    nativeName: "മലയാളം",
    flag: "🇮🇳",
    region: "India",
  },
  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    flag: "🇮🇳",
    region: "India",
  },
  {
    code: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    flag: "🇮🇳",
    region: "India",
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    flag: "🇮🇳",
    region: "India",
  },
  {
    code: "pa",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    flag: "🇮🇳",
    region: "India",
  },
  {
    code: "or",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    flag: "🇮🇳",
    region: "India",
  },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇮🇳", region: "India" },
  {
    code: "sd",
    name: "Sindhi",
    nativeName: "سنڌي",
    flag: "🇮🇳",
    region: "India",
  },
  {
    code: "sa",
    name: "Sanskrit",
    nativeName: "संस्कृतम्",
    flag: "🇮🇳",
    region: "India",
  },
  {
    code: "kok",
    name: "Konkani",
    nativeName: "कोंकणी",
    flag: "🇮🇳",
    region: "India",
  },
  {
    code: "mai",
    name: "Maithili",
    nativeName: "मैथिली",
    flag: "🇮🇳",
    region: "India",
  },
  {
    code: "sat",
    name: "Santali",
    nativeName: "ᱥᱟᱱᱛᱟᱲᱤ",
    flag: "🇮🇳",
    region: "India",
  },
  {
    code: "doi",
    name: "Dogri",
    nativeName: "डोगरी",
    flag: "🇮🇳",
    region: "India",
  },
  {
    code: "bho",
    name: "Bhojpuri",
    nativeName: "भोजपुरी",
    flag: "🇮🇳",
    region: "India",
  },
  {
    code: "mag",
    name: "Magahi",
    nativeName: "मगही",
    flag: "🇮🇳",
    region: "India",
  },

  // Major International Languages
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    region: "International",
  },
  {
    code: "zh",
    name: "Chinese (Mandarin)",
    nativeName: "中文",
    flag: "🇨🇳",
    region: "International",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    region: "International",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    region: "International",
  },
  {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    flag: "🇵🇹",
    region: "International",
  },
  {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    flag: "🇷🇺",
    region: "International",
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    region: "International",
  },
  {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷",
    region: "International",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    region: "International",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    region: "International",
  },
  {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹",
    region: "International",
  },
  {
    code: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
    flag: "🇹🇷",
    region: "International",
  },
  {
    code: "pl",
    name: "Polish",
    nativeName: "Polski",
    flag: "🇵🇱",
    region: "International",
  },
  {
    code: "nl",
    name: "Dutch",
    nativeName: "Nederlands",
    flag: "🇳🇱",
    region: "International",
  },
  {
    code: "sv",
    name: "Swedish",
    nativeName: "Svenska",
    flag: "🇸🇪",
    region: "International",
  },
  {
    code: "da",
    name: "Danish",
    nativeName: "Dansk",
    flag: "🇩🇰",
    region: "International",
  },
  {
    code: "no",
    name: "Norwegian",
    nativeName: "Norsk",
    flag: "🇳🇴",
    region: "International",
  },
  {
    code: "fi",
    name: "Finnish",
    nativeName: "Suomi",
    flag: "🇫🇮",
    region: "International",
  },
  {
    code: "hu",
    name: "Hungarian",
    nativeName: "Magyar",
    flag: "🇭🇺",
    region: "International",
  },
  {
    code: "cs",
    name: "Czech",
    nativeName: "Čeština",
    flag: "🇨🇿",
    region: "International",
  },
  {
    code: "sk",
    name: "Slovak",
    nativeName: "Slovenčina",
    flag: "🇸🇰",
    region: "International",
  },
  {
    code: "uk",
    name: "Ukrainian",
    nativeName: "Українська",
    flag: "🇺🇦",
    region: "International",
  },
  {
    code: "bg",
    name: "Bulgarian",
    nativeName: "български",
    flag: "🇧🇬",
    region: "International",
  },
  {
    code: "ro",
    name: "Romanian",
    nativeName: "Română",
    flag: "🇷🇴",
    region: "International",
  },
  {
    code: "hr",
    name: "Croatian",
    nativeName: "Hrvatski",
    flag: "🇭🇷",
    region: "International",
  },
  {
    code: "sr",
    name: "Serbian",
    nativeName: "Српски",
    flag: "🇷🇸",
    region: "International",
  },
  {
    code: "sl",
    name: "Slovenian",
    nativeName: "Slovenščina",
    flag: "🇸🇮",
    region: "International",
  },
  {
    code: "et",
    name: "Estonian",
    nativeName: "Eesti",
    flag: "🇪🇪",
    region: "International",
  },
  {
    code: "lv",
    name: "Latvian",
    nativeName: "Latviešu",
    flag: "🇱🇻",
    region: "International",
  },
  {
    code: "lt",
    name: "Lithuanian",
    nativeName: "Lietuvių",
    flag: "🇱🇹",
    region: "International",
  },
  {
    code: "el",
    name: "Greek",
    nativeName: "Ελληνικά",
    flag: "🇬🇷",
    region: "International",
  },
  {
    code: "he",
    name: "Hebrew",
    nativeName: "עברית",
    flag: "🇮🇱",
    region: "International",
  },
  {
    code: "th",
    name: "Thai",
    nativeName: "ไทย",
    flag: "🇹🇭",
    region: "International",
  },
  {
    code: "vi",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    flag: "🇻🇳",
    region: "International",
  },
  {
    code: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    flag: "🇮🇩",
    region: "International",
  },
  {
    code: "ms",
    name: "Malay",
    nativeName: "Bahasa Melayu",
    flag: "🇲🇾",
    region: "International",
  },
  {
    code: "tl",
    name: "Filipino",
    nativeName: "Filipino",
    flag: "🇵🇭",
    region: "International",
  },
  {
    code: "sw",
    name: "Swahili",
    nativeName: "Kiswahili",
    flag: "🇹🇿",
    region: "International",
  },
];

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (langCode: string) => {
    if (i18n.language === langCode) return;

    setIsChanging(true);
    setFadeOut(true);

    try {
      // Add a small delay for smooth transition
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Use the enhanced change language function
      await changeLanguageSmooth(langCode);
    } catch (error) {
      console.error("Language change failed:", error);
    } finally {
      setTimeout(() => {
        setFadeOut(false);
        setIsChanging(false);
      }, 100);
    }
  };

  // Listen for language changes to update loading state
  useEffect(() => {
    const handleLanguageChanged = () => {
      setIsChanging(false);
      setFadeOut(false);
    };

    i18n.on("languageChanged", handleLanguageChanged);
    return () => i18n.off("languageChanged", handleLanguageChanged);
  }, [i18n]);

  // Group languages by region
  const groupedLanguages = {
    Northeast: languages.filter((lang) => lang.region === "Northeast"),
    India: languages.filter((lang) => lang.region === "India"),
    International: languages.filter((lang) => lang.region === "International"),
  };

  const renderLanguageItem = (language: (typeof languages)[0]) => (
    <DropdownMenuItem
      key={language.code}
      onClick={() => handleLanguageChange(language.code)}
      disabled={isChanging}
      className={`flex items-center gap-2 cursor-pointer transition-all duration-200 ${
        i18n.language === language.code
          ? "bg-ne-tea-brown/10 text-ne-tea-brown font-medium"
          : ""
      } ${isChanging ? "opacity-50" : "hover:bg-ne-tea-brown/5"}`}
    >
      <span className="transition-transform duration-200">{language.flag}</span>
      <span className="flex flex-col flex-1">
        <span className="text-sm transition-opacity duration-200">
          {language.name}
        </span>
        <span className="text-xs text-muted-foreground transition-opacity duration-200">
          {language.nativeName}
        </span>
      </span>
      {i18n.language === language.code && (
        <span className="text-ne-tea-brown text-xs animate-in fade-in duration-200">
          ✓
        </span>
      )}
      {isChanging && i18n.language === language.code && (
        <Loader2 className="h-3 w-3 animate-spin text-ne-tea-brown" />
      )}
    </DropdownMenuItem>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className={`gap-1 sm:gap-2 min-w-0 transition-all duration-200 ${
            isChanging ? "animate-pulse" : ""
          } ${fadeOut ? "opacity-50" : "opacity-100"}`}
          disabled={isChanging}
        >
          {isChanging ? (
            <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
          ) : (
            <Globe className="h-4 w-4 flex-shrink-0" />
          )}
          <span className="hidden md:inline-flex items-center gap-2 min-w-0">
            <span className="flex-shrink-0">{currentLanguage.flag}</span>
            <span className="flex flex-col items-start min-w-0">
              <span className="text-sm leading-none truncate max-w-20">
                {currentLanguage.name}
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-20">
                {currentLanguage.nativeName}
              </span>
            </span>
          </span>
          <span className="md:hidden flex items-center gap-1">
            <span>{currentLanguage.flag}</span>
            <span className="text-xs sm:text-sm truncate max-w-16 sm:max-w-20">
              {currentLanguage.name}
            </span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 sm:w-80 max-h-80 sm:max-h-96 overflow-y-auto z-50"
      >
        {/* North-eastern Languages */}
        <DropdownMenuLabel className="flex items-center gap-2 text-ne-tea-brown font-semibold">
          <span className="text-base">🏔️</span>
          Northeast India Languages
        </DropdownMenuLabel>
        {groupedLanguages.Northeast.map(renderLanguageItem)}

        <DropdownMenuSeparator />

        {/* Other Indian Languages */}
        <DropdownMenuLabel className="flex items-center gap-2 text-ne-tea-brown font-semibold">
          <span className="text-base">🇮🇳</span>
          Other Indian Languages
        </DropdownMenuLabel>
        {groupedLanguages.India.map(renderLanguageItem)}

        <DropdownMenuSeparator />

        {/* International Languages */}
        <DropdownMenuLabel className="flex items-center gap-2 text-ne-tea-brown font-semibold">
          <span className="text-base">🌍</span>
          International Languages
        </DropdownMenuLabel>
        {groupedLanguages.International.map(renderLanguageItem)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
