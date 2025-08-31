// modules/lang-pl-addons-pf2e/scripts/exploration-effects.js

const MODULE_ID = "lang-pl-addons-pf2e";
const DEFAULT_ICON = "icons/svg/eye.svg";

// ---------------- HOOKS ----------------

Hooks.on("preUpdateActor", async (actor, update) => {
    if (!game.settings.get(MODULE_ID, "enableExplorationEffects")) return;
    try {
        const newList = foundry.utils.getProperty(update, "system.exploration");
        if (newList === undefined) return;
        if (!Array.isArray(newList)) return;

        const prevList = Array.isArray(actor.system?.exploration) ? actor.system.exploration : [];

        const added = newList.filter((id) => !prevList.includes(id));
        const removed = prevList.filter((id) => !newList.includes(id));

        for (const id of added) {
            let item = actor.items.get(id);
            if (!item) {
                const doc = await fromUuid(`${actor.uuid}.Item.${id}`).catch(() => null);
                if (doc) item = doc;
            }
            if (!item) continue;

            const traits = item.system?.traits?.value ?? item.system?.traits ?? [];
            if (!Array.isArray(traits) || !traits.includes("exploration")) continue;

            if (game.user.isGM || actor.isOwner) {
                await createExplorationEffect(actor, item);
            }
        }

        for (const id of removed) {
            await removeExplorationEffect(actor, id);
        }
    } catch (err) {
        console.error(`${MODULE_ID} | preUpdateActor error:`, err);
    }
});

// Gdy zaczyna się walka → usuń wszystkie efekty eksploracji i wyczyść aktywne akcje
Hooks.on("combatStart", async (combat) => {
    if (!game.settings.get(MODULE_ID, "enableExplorationEffects")) return;

    try {
        for (const combatant of combat.combatants) {
            const actor = combatant.actor;
            if (!actor) continue;

            const effects = actor.itemTypes?.effect?.filter(
                (e) => e.getFlag(MODULE_ID, "explorationItem") !== undefined
            ) ?? [];

            if (effects.length > 0) {
                await actor.deleteEmbeddedDocuments(
                    "Item",
                    effects.map((e) => e.id)
                );
            }

            // wyczyść listę aktywnych eksploracji
            if (actor.system?.exploration?.length > 0) {
                await actor.update({ "system.exploration": [] });
            }
        }
    } catch (err) {
        console.error(`${MODULE_ID} | combatStart error:`, err);
    }
});

// ---------------- FUNKCJE ----------------

async function createExplorationEffect(actor, item) {
    try {
        const itemId = item.id ?? item._id ?? null;
        const existing = actor.itemTypes?.effect?.find(
            (e) => e.getFlag(MODULE_ID, "explorationItem") === itemId || e.name === item.name
        );
        if (existing) return;

        const effectData = {
            type: "effect",
            name: item.name,
            img: item.img ?? DEFAULT_ICON,
            system: {
                description: { value: item.system?.description?.value ?? item.system?.description ?? "" },
                duration: { value: -1, unit: "unlimited", sustained: false, expiry: null },
                tokenIcon: { show: true }
            },
            flags: {
                [MODULE_ID]: { explorationItem: itemId },
                pf2e: { origin: { uuid: item.uuid ?? null } }
            }
        };

        await actor.createEmbeddedDocuments("Item", [effectData]);
    } catch (err) {
        console.error(`${MODULE_ID} | createExplorationEffect error:`, err);
    }
}

async function removeExplorationEffect(actor, itemId) {
    try {
        const effect = actor.itemTypes?.effect?.find(
            (e) => e.getFlag(MODULE_ID, "explorationItem") === itemId
        );
        if (effect) {
            await effect.delete();
        }
    } catch (err) {
        console.error(`${MODULE_ID} | removeExplorationEffect error:`, err);
    }
}
