Hooks.on("combatStart", async (combat) => {
  if (!game.settings.get("lang-pl-addons-pf2e", "first-turn")) return;

  const sortedCombatants = combat.combatants.contents.sort((a, b) => b.initiative - a.initiative);
  const firstCombatant = sortedCombatants[0];

  const effectData = {
    name: game.i18n.localize("lang-pl-addons-pf2e.effects.firstTurn.name"),
    type: "effect",
    system: {
      description: {
        value: game.i18n.localize("lang-pl-addons-pf2e.effects.firstTurn.description")
      },
      level: { value: 1 },
      duration: {
        value: 0,
        unit: "rounds",
        expiry: "turn-start",
        sustained: false
      },
      start: { value: 0, initiative: null },
      tokenIcon: { show: true }
    },
    img: "icons/svg/cancel.svg",
    flags: {
      exportSource: {
        world: "pf2e",
        system: "pf2e",
        coreVersion: "13.345",
        systemVersion: "7.2.0"
      }
    }
  };

  for (const combatant of sortedCombatants) {
    if (combatant === firstCombatant) continue;
    const actor = combatant.actor;
    if (actor) {
      await actor.createEmbeddedDocuments("Item", [effectData]);
    }
  }
});
