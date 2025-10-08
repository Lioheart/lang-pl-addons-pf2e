const EFFECT_SLUG = "reaction-used";
const MODULE_ID = "lang-pl-addons-pf2e";

function log(...args) {
  console.debug(`[${MODULE_ID}]`, ...args);
}

/** Pomocnik: bezpieczne pobranie Item z ChatMessage (różne formaty flag) */
async function getItemFromMessage(message) {
    const flags = message?.flags?.pf2e ?? {};

    // Najczęściej działa:
    let itemUuid =
        flags.origin?.uuid ??
        flags.item?.uuid ??
        flags.context?.item?.uuid ??
        flags.context?.origin?.uuid ??
        null;

    if (itemUuid) {
        try {
            const doc = await fromUuid(itemUuid);
            if (doc?.documentName === "Item") return doc;
        } catch (e) {
            log("fromUuid error", e);
        }
    }

    try {
        const match = /data-item-uuid="([^"]+)"/.exec(message?.content ?? "");
        if (match?.[1]) {
            const doc = await fromUuid(match[1]);
            if (doc?.documentName === "Item") return doc;
        }
    } catch (e) {
        /* ignore */
    }

    return null;
}

/** Czy to „reakcja”? — sprawdź typ akcji i/lub cechę */
function isReactionItem(item) {
    const at = item?.system?.actionType?.value ?? null;
    if (at === "reaction") return true;
    // niektóre karty/featy mają trait zamiast actionType
    const traits = item?.system?.traits?.value ?? [];
    return Array.isArray(traits) && traits.includes("reaction");
}

/** Znajdź aktora z itemu albo z message speaker */
async function getActorForMessage(message, item) {
    if (item?.actor) return item.actor;

    const flags = message?.flags?.pf2e ?? {};
    const actorUuid =
        flags.origin?.actorUuid ??
        flags.origin?.actorUUID ?? // różne wersje systemu
        null;

    if (actorUuid) {
        try {
            const doc = await fromUuid(actorUuid);
            if (doc?.documentName === "Actor") return doc;
        } catch (e) {
            log("fromUuid actor error", e);
        }
    }

    // Fallback: speaker
    const speaker = message?.speaker ?? {};
    if (speaker.actor) {
        const a = game.actors?.get(speaker.actor);
        if (a) return a;
    }
    if (speaker.token) {
        const t = canvas?.tokens?.get(speaker.token);
        if (t?.actor) return t.actor;
    }

    return null;
}

/** Utwórz albo odśwież efekt „Wykorzystano reakcję” */
async function ensureReactionEffect(actor) {
    if (!actor) return;

    // Szukamy po slug lub nazwie (gdy ktoś zmienił slug/nazwę)
    const existing =
        actor.itemTypes?.effect?.find(
            (e) => e.system?.slug === EFFECT_SLUG || e.name === game.i18n.localize(`${MODULE_ID}.effects.usedReaction.name`)
        ) ?? null;

    const effectData = {
        type: "effect",
        name: game.i18n.localize(`${MODULE_ID}.effects.usedReaction.name`),
        img: "systems/pf2e/icons/actions/Reaction.webp", // bezpieczna, wbudowana ikonka
        system: {
            slug: EFFECT_SLUG,
            description: {
                value:
                    game.i18n.localize(`${MODULE_ID}.effects.usedReaction.description`)
            },
            level: { value: 0 },
            // 1 runda, wygasa na początku tury właściciela efektu
            duration: {
                value: 1,
                unit: "rounds",
                expiry: "turn-start",
                sustained: false
            },
            rules: [],
            tokenIcon: { show: true },
            traits: { rarity: "common", value: [] },
            source: { value: "Auto reaction effect" }
        }
    };

    if (existing) {
        // Odśwież na pełną rundę od teraz
        await existing.update({
            "system.duration.value": 1,
            "system.duration.unit": "rounds",
            "system.duration.expiry": "turn-start",
            "system.start.initiative": actor.combatant?.initiative ?? null
        });
        return existing;
    } else {
        const [created] = await actor.createEmbeddedDocuments("Item", [effectData]);
        log(`Add effect to ${actor.name}`);
        return created;
    }
}

/** Główny hook */
Hooks.on("createChatMessage", async (message, _options, _userId) => {
    if (!game.settings.settings.has("lang-pl-addons-pf2e.enableUsedReactionEffect") ||
    !game.settings.get(MODULE_ID, "enableUsedReactionEffect")) return;
    try {
        // żeby nie tworzyć efektu po kilka razy — robi to tylko GM
        if (!game.user?.isGM) return;

        const item = await getItemFromMessage(message);
        if (!item) return;

        if (!isReactionItem(item)) return;

        const actor = await getActorForMessage(message, item);
        if (!actor) return;

        await ensureReactionEffect(actor);
    } catch (err) {
        console.error(`Error in createChatMessage:`, err);
    }
});