import { MODULE_ID, DEFAULT_RATE } from "./settings.js";

class RealTimeClock {
  constructor() {
    this._intervalId = null;
    this._combatActive = !!game.combat && game.combat.started;
    this._startTicker();
    this._registerHooks();
  }

  /** Only the active GM should advance the world clock */
  get isPrimary() {
    return game.user.isGM && game.users.activeGM?.id === game.user.id;
  }

  // ---------- ticker ----------
  _startTicker() {
    if (!this.isPrimary) return;
    this._intervalId = window.setInterval(() => this._tick(), 1000);
  }

  _stopTicker() {
    if (this._intervalId) {
      window.clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  _tick() {
    if (!this.isPrimary) return;
    if (game.paused) return;  // pauza wstrzymuje czas

    if (this._combatActive) {
      // Podczas walki nie odliczaj automatycznie w ticku!
      return;
    }

    const seconds = game.settings.get(MODULE_ID, "secondsPerRealSecond") ?? DEFAULT_RATE;
    this._advanceWorldTime(seconds);
  }


  // ---------- world‑clock helpers ----------
  _advanceWorldTime(seconds) {
    game.time.advance(seconds)
      .catch(err => console.warn(`${MODULE_ID} | Could not advance time:`, err))
      .finally(() => updateWorldTimeDisplay());
  }



  // ---------- Foundry hooks ----------
  _registerHooks() {
    Hooks.on("createCombat", this._onCombatStart.bind(this));
    Hooks.on("deleteCombat", this._onCombatEnd.bind(this));
    Hooks.on("updateCombat", (combat, changed) => {
      if (!this.isPrimary) return;

      // Aktualizuj flagę w oparciu o aktualny status walki
      this._combatActive = combat.started;

      if (!this._combatActive) return;
      if (game.paused) return;
      // if (changed.round !== undefined) this._advanceWorldTime(6);
    });
  }

  _onCombatStart() {
    if (!this.isPrimary) return;
    this._combatActive = true;
  }

  _onCombatEnd() {
    if (!this.isPrimary) return;
    this._combatActive = false;
  }
}

// ---------- bootstrap ----------
Hooks.once("ready", async () => {
  game.pf2eRealTimeClock = new RealTimeClock();
  console.log("%cPF2e Real‑Time Clock | Initialized", "color: green");
  await renderWorldTimeHUD();
  Hooks.on("updateWorldTime", updateWorldTimeDisplay);
});


// ---------- Display world time ----------
async function renderWorldTimeHUD() {
  if (document.getElementById("pf2e-world-time-display")) return;

  const html = await renderTemplate("modules/lang-pl-addons-pf2e/templates/world-time-display.hbs");
  document.body.insertAdjacentHTML("beforeend", html);
  updateWorldTimeDisplay();
}

async function updateWorldTimeDisplay() {
  const div = document.getElementById("pf2e-world-time-display");
  if (!div) return;

  const show = game.settings.get(MODULE_ID, "showClockHUD");
  div.style.display = show ? "block" : "none";

  const wc = game.pf2e?.worldClock;
  if (!wc || !wc.worldTime) {
    div.textContent = "Czas PF2e niedostępny";
    return;
  }

  const dt = wc.worldTime; // Luxon DateTime
  const dateTheme = wc.dateTheme;

  // Oblicz poprawiony rok
  const yearOffset = CONFIG.PF2E.worldClock[dateTheme]?.yearOffset ?? 0;
  const year = dt.year + yearOffset;

  // Pobierz erę
  let era = "";
  switch (dateTheme) {
    case "AR":
    case "IC":
      era = game.i18n.localize(CONFIG.PF2E.worldClock[dateTheme].Era) || "";
      break;
    case "AD":
      era = dt.toFormat("G") || "";
      break;
    default:
      era = "";
  }

  const day = dt.day;

  // Nazwa miesiąca
  let month;
  switch (dateTheme) {
    case "AR":
    case "IC": {
      const months = CONFIG.PF2E.worldClock.AR.Months;
      const monthEnglish = dt.setLocale("en-US").monthLong;
      month = game.i18n.localize(months[monthEnglish]) || monthEnglish;
      break;
    }
    default:
      month = dt.monthLong;
  }

  // Nazwa dnia tygodnia
  let weekday;
  switch (dateTheme) {
    case "AR":
    case "IC": {
      const weekdays = CONFIG.PF2E.worldClock.AR.Weekdays;
      const weekdayEnglish = dt.setLocale("en-US").weekdayLong;
      weekday = game.i18n.localize(weekdays[weekdayEnglish]) || weekdayEnglish;
      break;
    }
    default:
      weekday = dt.weekdayLong;
  }

  const hour = String(dt.hour).padStart(2, "0");
  const minute = String(dt.minute).padStart(2, "0");
  const second = String(dt.second).padStart(2, "0");

  // Finalny format z erą i nowym układem
  const formatted = `${weekday}, ${day}. ${month} ${year} ${era} — ${hour}:${minute}:${second}`;

  div.textContent = `⏱️ ${formatted}`;
}

export { updateWorldTimeDisplay };
