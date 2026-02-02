const MODULE_ID = "pf2e-defense-raise-shield";

const DEFENSE_ACTION_UUID =
  "Compendium.pf2e.actionspf2e.Item.cYtYKa1gDEl7y2N0";

const RAISE_SHIELD_EFFECT_UUID =
  "Compendium.pf2e.equipment-effects.Item.2YgXoHvJfrDHucMr";

/* -------------------------------------------- */
/* Wykrywanie dodania Obrony do eksploracji      */
/* -------------------------------------------- */
Hooks.on("preUpdateActor", async (actor, update) => {
  try {
    const newList = foundry.utils.getProperty(update, "system.exploration");
    if (!Array.isArray(newList)) return;

    const prevList = Array.isArray(actor.system?.exploration)
      ? actor.system.exploration
      : [];

    const added = newList.filter((id) => !prevList.includes(id));
    if (added.length === 0) return;

    for (const id of added) {
      let item = actor.items.get(id);
      if (!item) {
        item = await fromUuid(`${actor.uuid}.Item.${id}`).catch(() => null);
      }
      if (!item) continue;

      if (item.uuid !== DEFENSE_ACTION_UUID) continue;

      await actor.setFlag(MODULE_ID, "usedDefenseExploration", true);

      console.debug(
        "[Defense → Raise Shield] Defense exploration set for:",
        actor.name
      );
    }
  } catch (err) {
    console.error(`${MODULE_ID} | preUpdateActor error:`, err);
  }
});

/* -------------------------------------------- */
/* Start walki → dodaj Raise a Shield            */
/* -------------------------------------------- */
Hooks.on("combatStart", async (combat) => {
  try {
    for (const combatant of combat.combatants) {
      const actor = combatant.actor;
      if (!actor) continue;

      const usedDefense = actor.getFlag(
        MODULE_ID,
        "usedDefenseExploration"
      );
      if (!usedDefense) continue;

      const alreadyHas = actor.itemTypes.effect.some(
        (e) => e.sourceId === RAISE_SHIELD_EFFECT_UUID
      );
      if (alreadyHas) continue;

      const effect = await fromUuid(RAISE_SHIELD_EFFECT_UUID);
      if (!effect) continue;

      await actor.createEmbeddedDocuments("Item", [
        effect.toObject()
      ]);

      console.debug(
        "[Defense → Raise Shield] Raise Shield applied to:",
        actor.name
      );

      // wyczyść flagę po użyciu
      await actor.unsetFlag(MODULE_ID, "usedDefenseExploration");
    }
  } catch (err) {
    console.error(`${MODULE_ID} | combatStart error:`, err);
  }
});
