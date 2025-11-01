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
        "almendra": "Almendra",
        "awery": "Awery"
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
        // Upewnij się, że mamy jQuery-wrapped element (działa zarówno gdy html jest jQuery, jak i gdy jest HTMLElement)
        const $html = (typeof jQuery !== "undefined") ? $(html) : (html instanceof HTMLElement ? $(html) : null);
        if (!$html || !$html.length) return;

        // Znajdź select związany z naszym settingiem, potem weź najbliższy fieldset
        const $select = $html.find(`select[name="${MODULE_ID}.journalFont"]`);
        if (!$select.length) return;

        const $fieldset = $select.closest("fieldset");
        if (!$fieldset.length) return;

        // Zapobiegaj wielokrotnemu dodaniu przycisku
        if ($fieldset.find('.jp-reset-journal-font-btn').length) return;

        const $btn = $(`<button type="button" class="jp-reset-journal-font-btn" style="margin-top:5px;">Przywróć domyślną czcionkę</button>`);
        $btn.on("click", (ev) => {
            ev.preventDefault();
            resetJournalFont();
            // opcjonalnie: odśwież okno ustawień, żeby pokazać zmianę (jeśli chcesz)
            const app = game.apps?.find(a => a?.options?.id === "settings");
            if (app) app.render(); // bez await
        });

        $fieldset.append($btn);
    });
}
