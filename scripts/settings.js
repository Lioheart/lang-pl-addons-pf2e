import { toggleJournalStyle } from "./toggle-journal-style.js";
import { updateWorldTimeDisplay } from "./world-time-hud.js";
import { applyJournalFont } from "./journal-font.js";

export const MODULE_ID = "lang-pl-addons-pf2e";
export const DEFAULT_RATE = 1;

/**
 * Rejestruje wszystkie ustawienia modułu.
 */

export function registerClockPositionSettings() {
    game.settings.register(MODULE_ID, "clockPosition", {
        name: "Clock Position",
        scope: "client",
        config: false,
        type: Object,
        default: { top: 5, left: "50%" },
    });
}

function isSettingRegistered(key) {
    return game.settings.settings.has(`${MODULE_ID}.${key}`);
}

export function registerAddonTranslationSetting() {
    if (isSettingRegistered("enableAddonTranslations")) return;

    game.settings.register(MODULE_ID, "enableAddonTranslations", {
        name: game.i18n.localize(`${MODULE_ID}.settings.enableAddonTranslations.name`),
        hint: game.i18n.localize(`${MODULE_ID}.settings.enableAddonTranslations.hint`),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        restricted: true,
        requiresReload: true
    });
}

export function registerSettings() {
    const sundryActive = game.modules.get("sundry")?.active;
    const pf2etoolbeltActive = game.modules.get("pf2e-toolbelt")?.active;
    const calendariaActive = game.modules.get("calendaria")?.active;

    registerAddonTranslationSetting();

    if (!sundryActive) {
        game.settings.register(MODULE_ID, "enableRuneDescriptions", {
            name: game.i18n.localize(`${MODULE_ID}.settings.enableRuneDescriptions.name`),
            hint: game.i18n.localize(`${MODULE_ID}.settings.enableRuneDescriptions.hint`),
            scope: "world",
            config: true,
            default: false,
            type: Boolean,
            restricted: true,
        });
    }

    if (!sundryActive) {
        game.settings.register(MODULE_ID, "first-turn", {
            name: game.i18n.localize(`${MODULE_ID}.settings.firstTurn.name`),
            hint: game.i18n.localize(`${MODULE_ID}.settings.firstTurn.hint`),
            scope: "world",
            config: true,
            type: Boolean,
            default: true,
            restricted: true
        });
    }

    game.settings.register(MODULE_ID, "enableJournalStyle", {
        name: game.i18n.localize(`${MODULE_ID}.settings.enableJournalStyle.name`),
        hint: game.i18n.localize(`${MODULE_ID}.settings.enableJournalStyle.hint`),
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
        onChange: (value) => toggleJournalStyle(value)
    });

    game.settings.register(MODULE_ID, "nonlethalButton", {
        name: game.i18n.localize(`${MODULE_ID}.settings.nonlethalButton.name`),
        hint: game.i18n.localize(`${MODULE_ID}.settings.nonlethalButton.hint`),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        requiresReload: true,
        restricted: true
    });

    const showClockSettings = !calendariaActive;

    game.settings.register(MODULE_ID, "enableRealTimeClock", {
        name: game.i18n.localize(`${MODULE_ID}.settings.enableRealTimeClock.name`),
        hint: game.i18n.localize(`${MODULE_ID}.settings.enableRealTimeClock.hint`),
        scope: "world",
        config: showClockSettings,
        type: Boolean,
        requiresReload: true,
        default: false
    });

    game.settings.register(MODULE_ID, "showClockHUD", {
        name: game.i18n.localize(`${MODULE_ID}.settings.showClockHUD.name`),
        hint: game.i18n.localize(`${MODULE_ID}.settings.showClockHUD.hint`),
        scope: "client",
        config: showClockSettings,
        type: Boolean,
        default: false,
        onChange: () => {
            if (game.pf2e?.worldClock) {
                updateWorldTimeDisplay();
            }
        }
    });

    game.settings.register(MODULE_ID, "secondsPerRealSecond", {
        name: game.i18n.localize(`${MODULE_ID}.settings.secondsPerRealSecond.name`),
        hint: game.i18n.localize(`${MODULE_ID}.settings.secondsPerRealSecond.hint`),
        scope: "world",
        config: showClockSettings,
        type: Number,
        range: { min: 0, max: 10, step: 1 },
        default: DEFAULT_RATE,
        restricted: true
    });

    if (!pf2etoolbeltActive) {
        game.settings.register(MODULE_ID, "enableSellToMerchant", {
            name: game.i18n.localize(`${MODULE_ID}.settings.enableSellToMerchant.name`),
            hint: game.i18n.localize(`${MODULE_ID}.settings.enableSellToMerchant.hint`),
            scope: "world",
            config: true,
            type: Boolean,
            requiresReload: true,
            default: false
        });
    }

    if (!sundryActive) {
        game.settings.register(MODULE_ID, "enableUsedReactionEffect", {
            name: game.i18n.localize(`${MODULE_ID}.settings.enableUsedReactionEffect.name`),
            hint: game.i18n.localize(`${MODULE_ID}.settings.enableUsedReactionEffect.hint`),
            scope: "world",
            config: true,
            type: Boolean,
            default: true,
            restricted: true
        });
    }

    game.settings.register(MODULE_ID, "enableExplorationEffects", {
        name: game.i18n.localize(`${MODULE_ID}.settings.enableExplorationEffects.name`),
        hint: game.i18n.localize(`${MODULE_ID}.settings.enableExplorationEffects.hint`),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        restricted: true
    });

    game.settings.register(MODULE_ID, "enableReadyEffect", {
        name: game.i18n.localize(`${MODULE_ID}.settings.enableReadyEffect.name`),
        hint: game.i18n.localize(`${MODULE_ID}.settings.enableReadyEffect.hint`),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        restricted: true
    });

    game.settings.register(MODULE_ID, "enableCustomTurnMarker", {
        name: game.i18n.localize(`${MODULE_ID}.settings.enableCustomTurnMarker.name`),
        hint: game.i18n.localize(`${MODULE_ID}.settings.enableCustomTurnMarker.hint`),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        requiresReload: true,
    });

    game.settings.register(MODULE_ID, "journalFont", {
        name: game.i18n.localize(`${MODULE_ID}.settings.journalFont.name`),
        hint: game.i18n.localize(`${MODULE_ID}.settings.journalFont.hint`),
        scope: "client",
        config: true,
        type: String,
        choices: {
            "default": game.i18n.localize(`${MODULE_ID}.settings.journalFont.choices.default`),
            "im-fell-english-pro": "IM Fell English Pro",
            "immortal": "Immortal",
            "kirsty": "Kirsty",
            "almendra": "Almendra",
            "awery": "Awery"
        },
        default: "default",
        onChange: (value) => applyJournalFont(value)
    });

    game.settings.register(MODULE_ID, "enableDamageColumn", {
        name: game.i18n.localize(`${MODULE_ID}.settings.enableDamageColumn.name`),
        hint: game.i18n.localize(`${MODULE_ID}.settings.enableDamageColumn.hint`),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        requiresReload: true,
    });
}