import { registerSettings } from "./settings.js";
import { toggleJournalStyle } from "./toggle-journal-style.js";
import { initializeJournalFont, addJournalFontResetButton } from "./journal-font.js";

const MOD_ID = "lang-pl-addons-pf2e";
const LANG = "pl";

Hooks.once("init", () => {
    registerSettings();
    initializeJournalFont();
    addJournalFontResetButton();
});

Hooks.once("ready", () => {
    const isEnabled = game.settings.get(MOD_ID, "enableJournalStyle");
    toggleJournalStyle(isEnabled);
});

Hooks.once("babele.init", (babele) => {
    const useAddonTranslations = game.settings.get(MOD_ID, "enableAddonTranslations");

    if (!useAddonTranslations) {
        console.log(`[${MOD_ID}] Tłumaczenia dodatków Babele wyłączone w ustawieniach`);
        return;
    }

    babele.register({
        module: MOD_ID,
        lang: LANG,
        dir: "translation_addons/pl/compendium"
    });

    console.log(`[${MOD_ID}] Tłumaczenia dodatków Babele zarejestrowane`);
});