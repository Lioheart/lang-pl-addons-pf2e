const MOD_ID = "lang-pl-addons-pf2e";

Hooks.on("renderActorSheetPF2e", async (sheet, html) => {
  if (!game.settings.get(MOD_ID, "nonlethalButton")) return;
  const actor = sheet.actor;
  if (!actor?.isOfType?.("character")) return;

  const attacksLabel = game.i18n.localize("lang-pl-addons-pf2e.attacksLabel");
  const header = html.find("header").filter((_, el) => el.textContent?.trim() === attacksLabel).first();
  if (!header.length) return;
  if (sheet.element.find(".custom-attack-buttons").length) return;

  // Wstawiamy oba przyciski do jednego wrappera, aby nie nachodziły
  const $buttons = $(`
    <div class="controls custom-attack-buttons">
      <button type="button" class="lethal-button">
        <i class="fa-solid fa-user"></i> ${game.i18n.localize("lang-pl-addons-pf2e.buttons.lethal")}
      </button>
      <button type="button" class="nonlethal-button">
        <i class="fa-solid fa-user-slash"></i> ${game.i18n.localize("lang-pl-addons-pf2e.buttons.nonlethal")}
      </button>
    </div>
  `);
  header.append($buttons);

  // --- Nonlethal button ---
  $buttons.find("button.nonlethal-button").off("click").on("click", async () => {
    const name = game.i18n.localize("lang-pl-addons-pf2e.effects.nonlethal.name");
    const existing = actor.items.find(i => i.type === "effect" && i.name === name);

    const effectData = {
      name,
      type: "effect",
      img: "icons/skills/melee/unarmed-punch-fist-white.webp",
      system: {
        description: { value: game.i18n.localize("lang-pl-addons-pf2e.effects.nonlethal.desc") },
        duration: { value: 1, unit: "rounds", expiry: "turn-start", sustained: false },
        rules: [
          {
            key: "FlatModifier",
            selector: "strike-attack-roll",
            type: "status",
            value: -2,
            predicate: [{ "not": "item:trait:nonlethal" }]
          },
          {
            key: "RollOption",
            domain: "strike",
            option: "nonlethal",
            value: true
          },
          {
            key: "AdjustStrike",
            mode: "add",
            property: "traits",
            value: "nonlethal"
          }
        ]
      }
    };

    try {
      if (existing) {
        await actor.deleteEmbeddedDocuments("Item", [existing.id]);
        ui.notifications.info(`${game.i18n.localize("lang-pl-addons-pf2e.effects.nonlethal.notifications.removed") || "removed"}`);
      } else {
        await actor.createEmbeddedDocuments("Item", [effectData]);
        ui.notifications.info(`${game.i18n.localize("lang-pl-addons-pf2e.effects.nonlethal.notifications.added") || "added"}`);
      }
    } catch (err) {
      console.error("Nonlethal button error:", err);
      ui.notifications.error("Error toggling nonlethal effect");
    }
  });

  // --- Lethal button ---
  $buttons.find("button.lethal-button").off("click").on("click", async () => {
    const name = game.i18n.localize("lang-pl-addons-pf2e.effects.lethal.name");;
    const existing = actor.items.find(i => i.type === "effect" && i.name === name);

    const effectData = {
      name,
      type: "effect",
      img: "icons/skills/melee/unarmed-punch-fist-blue.webp",
      system: {
        description: {
          value: game.i18n.localize("lang-pl-addons-pf2e.effects.lethal.desc")
        },
        duration: { value: 1, unit: "rounds", expiry: "turn-start", sustained: false },
        rules: [
          {
            key: "FlatModifier",
            selector: "strike-attack-roll",
            type: "circumstance",
            value: -2,
            priority: 50,
            predicate: [
              {
                or: [
                  "item:trait:nonlethal",
                  "strike:trait:nonlethal"
                ]
              }
            ]
          },
          {
            key: "AdjustStrike",
            mode: "remove",
            property: "traits",
            value: "nonlethal"
          }
        ]
      }
    };

    try {
      if (existing) {
        await actor.deleteEmbeddedDocuments("Item", [existing.id]);
        ui.notifications.info(`${game.i18n.localize("lang-pl-addons-pf2e.effects.lethal.notifications.removed") || "removed"}`);
      } else {
        await actor.createEmbeddedDocuments("Item", [effectData]);
        ui.notifications.info(`${game.i18n.localize("lang-pl-addons-pf2e.effects.lethal.notifications.added") || "added"}`);
      }
    } catch (err) {
      console.error("Lethal button error:", err);
      ui.notifications.error("Error toggling lethal effect");
    }
  });
});
