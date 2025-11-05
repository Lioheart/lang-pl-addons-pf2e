const READY_EFFECT_SLUG = "ready-used";
const READY_ACTION_UUID = "Compendium.pf2e.actionspf2e.Item.dLgAMt3TbkmLkUqE";
const MODULE_ID = "lang-pl-addons-pf2e";

function log(...args) {
  console.debug(`[${MODULE_ID}]`, ...args);
}

/** Pomocnik: bezpieczne pobranie Item z ChatMessage (różne formaty flag) */
async function getItemFromMessage(message) {
    const flags = message?.flags?.pf2e ?? {};

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

/** Sprawdź, czy to akcja Ready */
function isReadyItem(item) {
    if (!item) return false;
    if (item.slug === "ready") return true;
    if (item.uuid === READY_ACTION_UUID) return true;
    const name = item.name?.toLowerCase?.() ?? "";
    return name.includes("ready") || name.includes("przygotowanie");
}

/** Znajdź aktora powiązanego z wiadomością */
async function getActorForMessage(message, item) {
    if (item?.actor) return item.actor;

    const flags = message?.flags?.pf2e ?? {};
    const actorUuid =
        flags.origin?.actorUuid ??
        flags.origin?.actorUUID ??
        null;

    if (actorUuid) {
        try {
            const doc = await fromUuid(actorUuid);
            if (doc?.documentName === "Actor") return doc;
        } catch (e) {
            log("fromUuid actor error", e);
        }
    }

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

/** Utwórz albo odśwież efekt „Przygotowano Akcję” */
async function ensureReadyEffect(actor) {
    if (!actor) return;

    const existing =
        actor.itemTypes?.effect?.find(
            (e) => e.system?.slug === READY_EFFECT_SLUG || e.name === game.i18n.localize(`${MODULE_ID}.effects.readyEffect.name`)
        ) ?? null;

    const effectData = {
        type: "effect",
        name: game.i18n.localize(`${MODULE_ID}.effects.readyEffect.name`),
        img: "systems/pf2e/icons/default-icons/action.svg",
        system: {
            slug: READY_EFFECT_SLUG,
            description: {
                value: game.i18n.localize(`${MODULE_ID}.effects.readyEffect.description`)
            },
            level: { value: 0 },
            // Efekt trwa do początku tury aktora
            duration: {
                value: 1,
                unit: "rounds",
                expiry: "turn-start",
                sustained: false
            },
            rules: [],
            tokenIcon: { show: true },
            traits: { rarity: "common", value: [] },
            source: { value: "Auto ready effect" }
        }
    };

    if (existing) {
        await existing.update({
            "system.duration.value": 1,
            "system.duration.unit": "rounds",
            "system.duration.expiry": "turn-start",
            "system.start.initiative": actor.combatant?.initiative ?? null
        });
        return existing;
    } else {
        const [created] = await actor.createEmbeddedDocuments("Item", [effectData]);
        return created;
    }
}

/** Główny hook */
Hooks.on("createChatMessage", async (message, _options, _userId) => {
    if (!game.settings.get(MODULE_ID, "enableReadyEffect")) return;
    try {
        if (!game.user?.isGM) return; // tylko MG tworzy efekt

        const item = await getItemFromMessage(message);
        if (!item) return;

        if (!isReadyItem(item)) return;

        const actor = await getActorForMessage(message, item);
        if (!actor) return;

        await ensureReadyEffect(actor);
    } catch (err) {
        console.error(`[${MODULE_ID}] Ready effect error:`, err);
    }
});
