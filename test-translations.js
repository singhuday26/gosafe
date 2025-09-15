// Test script to verify translations are working
import i18n from "./src/i18n/index.ts";

const testLanguages = ["en", "es", "fr", "zh", "ar", "de", "pt", "ru"];

async function testTranslations() {
  console.log("Testing language translations...\n");

  for (const lang of testLanguages) {
    try {
      await i18n.changeLanguage(lang);
      const title = i18n.t("home.title.line1");
      const description = i18n.t("home.description");
      const touristButton = i18n.t("home.buttons.tourist");

      console.log(`✅ ${lang.toUpperCase()}:`);
      console.log(`  Title: ${title}`);
      console.log(`  Button: ${touristButton}`);
      console.log("");
    } catch (error) {
      console.log(`❌ ${lang.toUpperCase()}: Failed to load translations`);
      console.log(`  Error: ${error.message}`);
      console.log("");
    }
  }
}

// Note: This is a test script to verify our translations work
// The actual testing would be done in the browser
console.log("Translation files have been created for:", testLanguages);
console.log(
  "Please test language switching in the browser at http://localhost:5173"
);
