const MODULE_ID = "lang-pl-addons-pf2e";
/**
 * Konwertuje pierwszy znak stringu na wielką literę.
 * @param {string} string 
 * @returns {string}
 */
const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
};


/**
 * Ten plik implementuje modyfikacje UI dla arkusza postaci PF2e
 * w celu dodania kolumny z obrażeniami bazowymi i TŁUMACZONYM Tooltipem.
 * * UWAGA: Ten kod jest uruchamiany tylko, jeśli ustawienie 'enableDamageColumn' jest aktywne.
 */
Hooks.on("renderActorSheetPF2e", (app, html, data) => {
    if (!game.settings.settings.has("lang-pl-addons-pf2e.enableDamageColumn") ||
        !game.settings.get("lang-pl-addons-pf2e", "enableDamageColumn")) return;

    const actor = app.object;
    if (!actor) {
        return;
    }

    // -----------------------------------------------------------
    // MODYFIKACJA 1: Dodanie nagłówka kolumny "Obr."
    // Szukamy nagłówka sekcji "Bronie i Tarcze" za pomocą klucza lokalizacyjnego PF2E.
    // -----------------------------------------------------------

    // Pobieramy przetłumaczony tekst nagłówka sekcji broni
    const localizedWeaponsHeader = game.i18n.localize(`PF2E.Actor.Inventory.Section.WeaponsAndShields`);

    // Szukamy nagłówka h3.item-name, który zawiera ten przetłumaczony tekst
    const targetHeader = html.find(`h3.item-name:contains("${localizedWeaponsHeader}")`);

    // Sprawdzamy, czy nagłówek istnieje i czy kolumna została już dodana (klasa damage-col-header)
    if (targetHeader.length > 0) {
        // Dodajemy unikalną klasę dla nagłówka kolumny, aby móc ją stylować i sprawdzać unikalność
        const nextElement = targetHeader.next('.damage-col-header');
        if (nextElement.length === 0) {
            // Dodajemy etykietę kolumny "Obr." (Obrażenia)
            const localizedDamageHeader = game.i18n.localize(`${MODULE_ID}.DamageHeader`);
            targetHeader.after(`<span class="damage-col-header">${localizedDamageHeader}</span>`);
        }
    }

    // -----------------------------------------------------------
    // MODYFIKACJA 2: Dodanie wartości obrażeń z TŁUMACZONYM Tooltipem
    // -----------------------------------------------------------

    // Selekcja tylko dla elementów typu weapon i shield
    const itemLis = html.find('ul.items[data-item-types="weapon,shield"] > li[data-item-id]');

    itemLis.each(function () {
        const $li = $(this);
        const itemId = $li.data('item-id');

        // Szukamy oryginalnej nazwy przedmiotu
        const $currentItemName = $li.find('div.item-name');

        if ($currentItemName.length === 0) return;

        const item = actor.items.get(itemId);

        // Upewniamy się, że to broń i że kolumna jeszcze nie istnieje
        if (!item || item.type !== 'weapon' || $currentItemName.next('h4:has(span.dmg-value)').length > 0) {
            return;
        }

        // Obliczenia obrażeń (tylko bazowe kości)
        const dieType = item.system.damage?.die || "d4";
        const baseDice = Number(item.system.damage?.dice ?? 0);
        const totalDice = baseDice;

        if (totalDice === 0) {
            return; // Nie pokazujemy, jeśli brak kości obrażeń
        }

        // Pobieramy klucz typu obrażeń, np. "slashing"
        const damageKey = item.system.damage?.damageType;

        let translatedDamageType = game.i18n.localize("PF2E.TraitUntyped"); // Domyślna wartość

        if (damageKey) {
            // Konwersja na wielką literę, np. "slashing" -> "Slashing"
            const capitalizedDamageKey = capitalizeFirstLetter(damageKey);

            // Tworzenie poprawnego klucza lokalizacyjnego, np. PF2E.TraitSlashing
            translatedDamageType = game.i18n.localize(`PF2E.Trait${capitalizedDamageKey}`);
        }

        const damageString = `${totalDice}${dieType}`;

        // Wstawiamy H4 z PRZETŁUMACZONĄ wartością jako data-tooltip (ToolTip)
        $currentItemName.after(`<h4 data-tooltip="${translatedDamageType}"><span class="dmg-value">${damageString}</span></h4>`);
    });

});
