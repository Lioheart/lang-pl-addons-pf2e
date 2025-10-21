import { MODULE_ID } from "./settings.js";

let hooksRegistered = false;

export function registerRoundMarker() {
  if (hooksRegistered) return; // zabezpieczenie
  hooksRegistered = true;

  let lastRound = 1;
  let battleStarted = false;

  Hooks.on("updateCombat", async (combat, changed) => {
    if (!game.user.isGM) return;
    if (!game.settings.get(MODULE_ID, "enableRoundMarkers")) return;

    const roundNumber = combat.round;
    const roundLabel = game.i18n.localize(`${MODULE_ID}.round`);

    // Początek walki – tylko raz przy pierwszej rundzie
    if (!battleStarted && roundNumber === 1) {
      await ChatMessage.create({
        speaker: { alias: "Gamemaster" },
        content: game.i18n.localize(`${MODULE_ID}.combatStart`),
        flavor: game.i18n.localize(`${MODULE_ID}.combatStart`),
        flags: { [MODULE_ID]: { roundMarker: true } }
      });
      battleStarted = true;
    }

    // Separator dla każdej nowej rundy
    if (roundNumber > lastRound) {
      await ChatMessage.create({
        speaker: { alias: "Gamemaster" },
        content: `${roundLabel} ${roundNumber}`,
        flavor: `${roundLabel} ${roundNumber}`,
        flags: { [MODULE_ID]: { roundMarker: true } }
      });
      lastRound = roundNumber;
    }
  });

  Hooks.on("deleteCombat", async (combat) => {
    if (!game.user.isGM) return;
    if (!game.settings.get(MODULE_ID, "enableRoundMarkers")) return;

    await ChatMessage.create({
      speaker: { alias: "Gamemaster" },
      content: game.i18n.localize(`${MODULE_ID}.combatEnd`),
      flavor: game.i18n.localize(`${MODULE_ID}.combatEnd`),
      flags: { [MODULE_ID]: { roundMarker: true } }
    });

    lastRound = 0;
    battleStarted = false;
  });

  Hooks.on("renderChatMessage", (_message, html) => {
    const roundMarker = _message.getFlag(MODULE_ID, "roundMarker");
    if (roundMarker) html.addClass("round-divider");
  });
}
