const MODULE_ID = "lang-pl-addons-pf2e";

/** Konwertuje pierwszy znak stringu na wielką literę */
const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
};

/** Pobiera klasę ikony dla typu obrażeń (korzysta z systemu lub fallbacku) */
function getDamageIconClass(damageKey) {
    if (!damageKey) return "fa-regular fa-circle";

    const icons =
        CONFIG?.PF2E?.DAMAGE_TYPE_ICONS ??
        game?.pf2e?.DAMAGE_TYPE_ICONS ??
        window?.PF2E?.DAMAGE_TYPE_ICONS ??
        null;

    let id = icons?.[damageKey] ?? null;

    if (!id) {
        const fallback = {
            bleed: "droplet",
            acid: "vial",
            bludgeoning: "hammer",
            cold: "snowflake",
            electricity: "bolt",
            fire: "fire",
            force: "sparkles",
            mental: "brain",
            piercing: "bow-arrow",
            poison: "spider",
            slashing: "axe",
            sonic: "waveform-lines",
            spirit: "ghost",
            vitality: "sun",
            void: "skull",
            untyped: null,
        };
        id = fallback[damageKey] ?? null;
    }

    return id ? `fa-solid fa-${id}` : "fa-solid fa-question";
}

/**
 * Dodaje kolumnę "Obr." z ikoną i tooltipem typu obrażeń do arkusza postaci PF2e.
 */
Hooks.on("renderActorSheetPF2e", (app, html, data) => {
    if (!game.settings.settings.has(`${MODULE_ID}.enableDamageColumn`) ||
        !game.settings.get(MODULE_ID, "enableDamageColumn")) return;

    const actor = app.object;
    if (!actor) return;

    const localizedWeaponsHeader = game.i18n.localize(`PF2E.Actor.Inventory.Section.WeaponsAndShields`);
    const targetHeader = html.find(`h3.item-name:contains("${localizedWeaponsHeader}")`);
    if (targetHeader.length > 0 && targetHeader.next('.damage-col-header').length === 0) {
        const localizedDamageHeader = game.i18n.localize(`${MODULE_ID}.DamageHeader`);
        targetHeader.after(`<span class="damage-col-header">${localizedDamageHeader}</span>`);
    }

    // Przetwarzamy tylko bronie
    const itemLis = html.find('ul.items[data-item-types="weapon,shield"] > li[data-item-id]');
    itemLis.each(function () {
        const $li = $(this);
        const itemId = $li.data('item-id');
        const $currentItemName = $li.find('div.item-name');
        if ($currentItemName.length === 0) return;

        const item = actor.items.get(itemId);
        if (!item || item.type !== 'weapon') return;

        const dieType = item.system.damage?.die || "d4";
        const baseDice = Number(item.system.damage?.dice ?? 0);
        if (baseDice === 0) return;

        const damageKey = item.system.damage?.damageType ?? "untyped";
        const capitalizedDamageKey = capitalizeFirstLetter(damageKey);
        const translatedDamageType = game.i18n.localize(`PF2E.Trait${capitalizedDamageKey}`);

        const iconClass = getDamageIconClass(damageKey);
        const damageString = `${baseDice}${dieType}`;
        const cssClass = `dmg-${damageKey}`;

        const damageHTML = `
            <h4 class="damage-type" data-tooltip="${translatedDamageType}">
                <span class="dmg-value ${cssClass}">
                    ${damageString}<i class="${iconClass}" inert=""></i>
                </span>
            </h4>
        `;

        $currentItemName.after(damageHTML);
    });
});
