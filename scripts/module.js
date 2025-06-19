import { registerSettings } from "./settings.js";
import { toggleJournalStyle } from "./toggle-journal-style.js";

Hooks.once("ready", () => {
    const isEnabled = game.settings.get("lang-pl-addons-pf2e", "enableJournalStyle");
    toggleJournalStyle(isEnabled);
});

Hooks.once("init", () => {
  registerSettings();
});

Hooks.once("init", () => {
  const modId = "lang-pl-addons-pf2e";
  const lang = "pl";
  const useAddonTranslations = game.settings.get(modId, "enableAddonTranslations");

  if (useAddonTranslations && game.babele) {
    game.babele.register({
      module: modId,
      lang,
      dir: "translation_addons/pl/compendium"
    });
    console.log(`[${modId}] Tłumaczenia dodatków Babele zarejestrowane`);
  }
});
