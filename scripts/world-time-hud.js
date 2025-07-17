import { MODULE_ID, DEFAULT_RATE } from "./settings.js";
import { registerClockPositionSettings } from "./settings.js";

Hooks.once("init", () => {
  registerClockPositionSettings();
});

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
  const clockEnabled = game.settings.get("lang-pl-addons-pf2e", "enableRealTimeClock");
  const hudEnabled = game.settings.get("lang-pl-addons-pf2e", "showClockHUD");

  if (clockEnabled) {
    game.pf2eRealTimeClock = new RealTimeClock();
    console.log("%cPF2e Real‑Time Clock | Initialized", "color: green");
    Hooks.on("updateWorldTime", updateWorldTimeDisplay);
  }

  if (hudEnabled) {
    await renderWorldTimeHUD();
  }
});

// ---------- Display world time ----------
async function renderWorldTimeHUD() {
  if (document.getElementById("pf2e-world-time-display")) return;

  const isGM = game.user.isGM;
  console.log("renderWorldTimeHUD: isGM =", isGM);

  const html = await renderTemplate("modules/lang-pl-addons-pf2e/templates/world-time-display.hbs", {
    isGM,
  });

  document.body.insertAdjacentHTML("beforeend", html);
  updateWorldTimeDisplay();

  if (isGM) {
    document.querySelectorAll(".time-adjust-btn").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const seconds = parseInt(event.currentTarget.dataset.adjust, 10);
        if (!isNaN(seconds)) {
          game.time.advance(seconds)
            .catch(err => console.warn(`${MODULE_ID} | Could not adjust time:`, err))
            .finally(() => updateWorldTimeDisplay());
        }
      });
    });
  }

  const position = game.settings.get(MODULE_ID, "clockPosition") || { top: 5, left: "50%" };
  const div = document.getElementById("pf2e-world-time-display");
  div.style.top = `${position.top}px`;

  if (typeof position.left === "number") {
    div.style.left = `${position.left}px`;
    div.style.transform = "";
  } else if (position.left === "50%") {
    div.style.left = "50%";
    div.style.transform = "translateX(-50%)";
  }

  makeDraggable(div);

}

function makeDraggable(element) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  element.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const left = e.clientX - offsetX;
    const top = e.clientY - offsetY;
    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  });

  document.addEventListener("mouseup", (e) => {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.userSelect = "";

    const newPosition = {
      top: parseInt(element.style.top, 10),
      left: element.style.left.endsWith("%")
        ? element.style.left
        : parseInt(element.style.left, 10),
    };

    game.settings.set(MODULE_ID, "clockPosition", newPosition);
  });
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

  const yearOffset = CONFIG.PF2E.worldClock[dateTheme]?.yearOffset ?? 0;
  const year = dt.year + yearOffset;

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

  const formatted = `${weekday}, ${day}. ${month} ${year} ${era} — ${hour}:${minute}:${second}`;

  const timeText = `${formatted}`;

  let timeSpan = div.querySelector(".time-text");
  if (!timeSpan) {
    timeSpan = document.createElement("span");
    timeSpan.className = "time-text";
    div.prepend(timeSpan);
  }
  timeSpan.textContent = timeText;
}

export { updateWorldTimeDisplay };