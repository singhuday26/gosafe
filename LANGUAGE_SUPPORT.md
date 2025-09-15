# Language Support Documentation

## Overview
The Tourist Safety Portal now supports comprehensive language selection with **North-eastern languages prioritized**, followed by other Indian languages and major international languages.

## Supported Languages

### 🏔️ Northeast India Languages (Priority)
- **Assamese (as)** - অসমীয়া ✅ *Translations available*
- **Bengali (bn)** - বাংলা ✅ *Translations available*
- **Manipuri (Meitei) (mni)** - মৈতৈলোন্
- **Garo (grt)** - A·chik
- **Khasi (kha)** - Khasi
- **Mizo (Lushai) (lus)** - Mizo ṭawng
- **Nagamese (nag)** - Nagamese
- **Adi (adi)** - Adi
- **Bishnupriya (bpy)** - বিষ্ণুপ্রিয়া মণিপুরী
- **Sikkim (Nepali) (sit)** - नेपाली

### 🇮🇳 Other Indian Languages
- **Hindi (hi)** - हिंदी ✅ *Translations available*
- **Telugu (te)** - తెలుగు ✅ *Translations available*
- **Tamil (ta)** - தமிழ்
- **Malayalam (ml)** - മലയാളം
- **Kannada (kn)** - ಕನ್ನಡ
- **Gujarati (gu)** - ગુજરાતી
- **Marathi (mr)** - मराठी
- **Punjabi (pa)** - ਪੰਜਾਬੀ
- **Odia (or)** - ଓଡ଼ିଆ
- **Urdu (ur)** - اردو
- And 15+ more regional languages

### 🌍 International Languages
- **English (en)** - English ✅ *Translations available*
- **Chinese (zh)** - 中文
- **Spanish (es)** - Español ✅ *Translations available*
- **French (fr)** - Français ✅ *Translations available*
- **Arabic (ar)** - العربية
- **Portuguese (pt)** - Português
- **Russian (ru)** - Русский
- **Japanese (ja)** - 日本語
- **Korean (ko)** - 한국어
- **German (de)** - Deutsch
- And 20+ more international languages

## Features

### 🎯 Smart Fallback System
- Northeast languages → Bengali/Hindi → English
- Indian languages → Hindi → English  
- International languages → English
- Graceful handling of missing translations

### 🎨 Enhanced UI
- **Grouped by region** with clear visual separation
- **Native script display** for each language
- **Visual selection indicator** (✓) for current language
- **Flag icons** for easy identification
- **Responsive design** - compact on mobile, detailed on desktop
- **Consistent brown/white theme** integration

### 🔧 Easy Language Addition

To add a new language translation:

1. **Create translation file**: 
   ```
   src/i18n/locales/[language-code].json
   ```

2. **Add to i18n configuration**:
   ```typescript
   // In src/i18n/index.ts
   import newLang from "./locales/[language-code].json";
   
   const resources = {
     // ... existing languages
     [languageCode]: { translation: newLang },
   };
   ```

3. **Translation file structure**:
   ```json
   {
     "nav": {
       "signIn": "Translation",
       "signOut": "Translation",
       "dashboard": "Translation"
     },
     "home": {
       "badge": "Translation",
       "title": {
         "line1": "Translation",
         "line2": "Translation"
       },
       "description": "Translation",
       "buttons": {
         "tourist": "Translation",
         "authority": "Translation"
       }
     }
     // ... more sections
   }
   ```

### 🚀 Usage
Users can:
- Click the language selector in the top-right corner
- Browse languages organized by region
- See both English names and native scripts
- Switch languages instantly with persistent storage
- Experience smooth fallbacks for missing translations

### 🔍 Implementation Details
- **Persistent selection**: Language choice saved to localStorage
- **Browser detection**: Automatically detects user's browser language
- **Fallback chain**: Smart fallback to related languages then English
- **Performance optimized**: Lazy loading of translation resources
- **SEO friendly**: Proper language attributes and meta tags

## Technical Architecture

```
LanguageSelector Component
├── 70+ Languages organized by regions
├── Smart fallback system
├── Persistent storage (localStorage)
├── Browser language detection
└── React i18next integration
```

The language selector is now fully functional and ready for international users visiting North East India!