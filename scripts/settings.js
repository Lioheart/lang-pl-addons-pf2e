import { toggleJournalStyle } from "./toggle-journal-style.js";

const MOD_ID = "lang-pl-addons-pf2e";

/**
 * Rejestruje wszystkie ustawienia modułu.
 */
export function registerSettings() {
    game.settings.register(MOD_ID, "enableRuneDescriptions", {
        name: game.i18n.localize(`${MOD_ID}.settings.enableRuneDescriptions.name`),
        hint: game.i18n.localize(`${MOD_ID}.settings.enableRuneDescriptions.hint`),
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        restricted: true,
    });

    game.settings.register(MOD_ID, "enableAddonTranslations", {
        name: game.i18n.localize(`${MOD_ID}.settings.enableAddonTranslations.name`),
        hint: game.i18n.localize(`${MOD_ID}.settings.enableAddonTranslations.hint`),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        restricted: true,
        requiresReload: true
    });

    game.settings.register(MOD_ID, "first-turn", {
        name: game.i18n.localize(`${MOD_ID}.settings.firstTurn.name`),
        hint: game.i18n.localize(`${MOD_ID}.settings.firstTurn.hint`),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        restricted: false
    });

    game.settings.register(MOD_ID, "showSettingScopeIcons", {
        name: game.i18n.localize(`${MOD_ID}.settings.showSettingScopeIcons.name`),
        hint: game.i18n.localize(`${MOD_ID}.settings.showSettingScopeIcons.hint`),
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MOD_ID, "enableJournalStyle", {
        name: game.i18n.localize(`${MOD_ID}.settings.enableJournalStyle.name`),
        hint: game.i18n.localize(`${MOD_ID}.settings.enableJournalStyle.hint`),
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => toggleJournalStyle(value)
    });

    game.settings.register(MOD_ID, "nonlethalButton", {
        name: game.i18n.localize(`${MOD_ID}.settings.nonlethalButton.name`),
        hint: game.i18n.localize(`${MOD_ID}.settings.nonlethalButton.hint`),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,        
        requiresReload: true
    });
}
