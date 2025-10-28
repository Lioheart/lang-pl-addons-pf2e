export const MODULE_ID = "lang-pl-addons-pf2e";

/**
 * Funkcja, która ustawia czcionkę w CSS
 */
export function applyJournalFont(fontKey) {
    const fontMap = {
        "default": "Girassol-Regular", // domyślna czcionka
        "im-fell-english-pro": "IM Fell English Pro",
        "immortal": "Immortal",
        "kirsty": "Kirsty",
        "almendra": "Almendra"
    };

    const fontName = fontMap[fontKey] || fontMap["default"];

    let style = document.getElementById("custom-journal-font-style");
    if (!style) {
        style = document.createElement("style");
        style.id = "custom-journal-font-style";
        document.head.appendChild(style);
    }

    style.innerHTML = `
        :root {
            --serif-condensed: "${fontName}", serif;
        }
    `;
}

/**
 * Przywraca czcionkę domyślną
 */
export function resetJournalFont() {
    game.settings.set(MODULE_ID, "journalFont", "default");
    applyJournalFont("default");
}

/**
 * Wczytanie aktualnie ustawionej czcionki
 */
export function initializeJournalFont() {
    // W tym hooku ustawienie modułu na pewno już istnieje
    const fontKey = game.settings.get(MODULE_ID, "journalFont") || "default";
    applyJournalFont(fontKey);
}

/**
 * Dodanie przycisku resetu w UI ustawień
 * Wywołaj po registerSettings()
 */
export function addJournalFontResetButton() {
    Hooks.on("renderSettingsConfig", (_app, html) => {
        const fieldset = html.find(`fieldset:has(select[name="${MODULE_ID}.journalFont"])`);
        if (!fieldset.length) return;

        const btn = $(`<button type="button" style="margin-top:5px;">Przywróć domyślną czcionkę</button>`);
        btn.on("click", () => resetJournalFont());
        fieldset.append(btn);
    });
}