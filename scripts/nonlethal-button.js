/*  Dodaje przycisk „Nieśmiercionośne” w sekcji „Ataki” karty bohatera.
    Po kliknięciu tworzy efekt „Ataki nieśmiercionośne”
    (bez pobierania czegokolwiek z kompendiów).                     */

const MOD_ID = "lang-pl-addons-pf2e";

Hooks.on("renderActorSheetPF2e", async (sheet, html) => {
  /* opcja klienta wyłączona → nie rób nic */
  if (!game.settings.get(MOD_ID, "nonlethalButton")) return;

  const actor = sheet.actor;
  if (!actor.isOfType("character")) return;

  /* znajdź nagłówek „Ataki” */
  const attacksLabel = game.i18n.localize("lang-pl-addons-pf2e.attacksLabel")
  const header = html.find("header").filter((_, el) => el.textContent?.trim() === attacksLabel);
  if (!header.length) return;

  /* uniknij duplikacji */
  if (header.find(".nonlethal-button").length) return;

  /* wstaw przycisk */
  const button = $(`
    <div class="controls">
      <button type="button" class="nonlethal-button">
        <i class="fa-solid fa-user-slash"></i> ${game.i18n.localize("lang-pl-addons-pf2e.buttons.nonlethal")}
      </button>
    </div>
  `);
  header.append(button);

  /* obsługa kliknięcia */
  button.find("button.nonlethal-button").on("click", async () => {
    const effectData = {
      name: game.i18n.localize("lang-pl-addons-pf2e.effects.nonlethal.name"),
      type: "effect",
      img: "icons/skills/melee/unarmed-punch-fist-white.webp",
      system: {
        description: { value: game.i18n.localize("lang-pl-addons-pf2e.effects.nonlethal.desc") },
        duration: { value: 1, unit: "rounds", expiry: "turn-start", sustained: false },
        rules: [
          { key: "AdjustStrike", mode: "add", property: "weapon-traits", value: "nonlethal" },
          { key: "FlatModifier", selector: ["attack"], type: "status", value: -2 }
        ]
      }
    };

    await actor.createEmbeddedDocuments("Item", [effectData]);
  });
});
