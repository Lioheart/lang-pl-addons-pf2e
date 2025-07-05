/* ------------------------------------------------------------------------- */
/*  Add Property Rune Descriptions                                           */
/* ------------------------------------------------------------------------- */
import { registerSettings } from "./settings.js";

const MOD_ID = "lang-pl-addons-pf2e";
const FLAG_HASH = "runeHash";
const FLAG_ORIG = "runeOriginalDescription";
const START = "<!-- rune-descriptions-start -->";
const END = "<!-- rune-descriptions-end -->";

/* === MAP SLUG → UUID ==================================================== */
const UUID_RUNES = {
  "antimagic": "Compendium.pf2e.equipment-srd.Item.o02lg3k1RBoFXVFV",
  "ashen": "Compendium.pf2e.equipment-srd.Item.yMEDmJWDPv2i78WO",
  "assisting": "Compendium.pf2e.equipment-srd.Item.Rm2cojERpLEWB9B3",
  "astral": "Compendium.pf2e.equipment-srd.Item.6llILJtsTPgtYXgx",
  "authorized": "Compendium.pf2e.equipment-srd.Item.tEXUCp02ylyoJoyP",
  "bane": "Compendium.pf2e.equipment-srd.Item.hnbbqvzYDyhDiJnf",
  "brilliant": "Compendium.pf2e.equipment-srd.Item.LbdnZFlyLFdAE617",
  "corrosive": "Compendium.pf2e.equipment-srd.Item.Wm0X7Pfd1bfocPSv",
  "dancing": "Compendium.pf2e.equipment-srd.Item.DCPsilr8wbPXxTUv", // old - UUID change to new
  "deathless": "Compendium.pf2e.equipment-srd.Item.kOEZCUTCPCqCFoJf",
  "disrupting": "Compendium.pf2e.equipment-srd.Item.LwQb7ryTC8FlOXgX", // old - UUID change to new
  "extending": "Compendium.pf2e.equipment-srd.Item.bJORQsO9E1JCJh6i",
  "fearsome": "Compendium.pf2e.equipment-srd.Item.P6v2AtJw7AUwaDzf",
  "fireResistant": "Compendium.pf2e.equipment-srd.Item.Lw3B9DpnyrpXD9Di",
  "electricityResistant": "Compendium.pf2e.equipment-srd.Item.Lw3B9DpnyrpXD9Di",
  "acidResistant": "Compendium.pf2e.equipment-srd.Item.Lw3B9DpnyrpXD9Di",
  "coldResistant": "Compendium.pf2e.equipment-srd.Item.Lw3B9DpnyrpXD9Di",
  "flaming": "Compendium.pf2e.equipment-srd.Item.XszNvxnymWYRaoTp",
  "fortification": "Compendium.pf2e.equipment-srd.Item.8buhFcGwuaJRrp0y",
  "frost": "Compendium.pf2e.equipment-srd.Item.M5M1WJ5KzbYfRGsY",
  "ghostTouch": "Compendium.pf2e.equipment-srd.Item.JQdwHECogcTzdd8R",
  "glamered": "Compendium.pf2e.equipment-srd.Item.iTxqImupNnm8gvoe", // old - UUID change to new
  "greaterAcidResistant": "Compendium.pf2e.equipment-srd.Item.9CAWAKkZE7dr4FlJ",
  "greaterFireResistant": "Compendium.pf2e.equipment-srd.Item.9CAWAKkZE7dr4FlJ",
  "greaterElectricityResistant": "Compendium.pf2e.equipment-srd.Item.9CAWAKkZE7dr4FlJ",
  "greaterColdResistant": "Compendium.pf2e.equipment-srd.Item.9CAWAKkZE7dr4FlJ",
  "greaterBrilliant": "Compendium.pf2e.equipment-srd.Item.n8MonEa4ZBdvEovc",
  "greaterCorrosive": "Compendium.pf2e.equipment-srd.Item.vQUIUAFOTOWj3ohh",
  "greaterCrushing": "Compendium.pf2e.equipment-srd.Item.t6SSQYruLsDWj5Tl",
  "greaterDisrupting": "Compendium.pf2e.equipment-srd.Item.oVrVzML63VFvVfKk", // old - UUID change to new
  "greaterExtending": "Compendium.pf2e.equipment-srd.Item.WHwprq9Xym2DOr2x",
  "greaterFearsome": "Compendium.pf2e.equipment-srd.Item.uz3JCjRvkE44jxMd",
  "greaterFlaming": "Compendium.pf2e.equipment-srd.Item.RSZwUlCzUX7Nb4UA",
  "greaterFortification": "Compendium.pf2e.equipment-srd.Item.ujWnpVMkbTljMGN9",
  "greaterFrost": "Compendium.pf2e.equipment-srd.Item.Sexud7FdxIrg50vU",
  "greaterImpactful": "Compendium.pf2e.equipment-srd.Item.ri9QkRCD6cAbQ6t3",
  "greaterInvisibility": "Compendium.pf2e.equipment-srd.Item.bxz885LMjLCkpDq3",
  "greaterReady": "Compendium.pf2e.equipment-srd.Item.fumxKes1z2hLN2U7",
  "greaterShock": "Compendium.pf2e.equipment-srd.Item.TEa1oKZbwsOvC6TZ",
  "greaterSlick": "Compendium.pf2e.equipment-srd.Item.LiJMupjynmkM5Mld",
  "greaterThundering": "Compendium.pf2e.equipment-srd.Item.Lb7F2BR9X9TF1vjX",
  "grievous": "Compendium.pf2e.equipment-srd.Item.qUnDHEXteUQGE8yp",
  "hauling": "Compendium.pf2e.equipment-srd.Item.2ovu1AioLLff9p8w",
  "holy": "Compendium.pf2e.equipment-srd.Item.DH0kB9Wbr5pDeunX",
  "impactful": "Compendium.pf2e.equipment-srd.Item.H9qYN48voa2ZDy3i",
  "invisibility": "Compendium.pf2e.equipment-srd.Item.VDudQ4x2ozosAbTb",
  "keen": "Compendium.pf2e.equipment-srd.Item.hg3IogR8ue2IWwgS",
  "raiment": "Compendium.pf2e.equipment-srd.Item.iTxqImupNnm8gvoe",
  "returning": "Compendium.pf2e.equipment-srd.Item.qlunQzfnzPQpMG6U",
  "shifting": "Compendium.pf2e.equipment-srd.Item.roeYtwlIe65BPMJ1",
  "shock": "Compendium.pf2e.equipment-srd.Item.NVst7e69agGG9Qwd",
  "shockwave": "Compendium.pf2e.equipment-srd.Item.QNaCujl2faKRyLD1",
  "speed": "Compendium.pf2e.equipment-srd.Item.KnZL0xPWDzQx9vWQ", // old - UUID change to new
  "spellStoring": "Compendium.pf2e.equipment-srd.Item.payq4TwkN2BRF6fs", // old - UUID change to new
  "thundering": "Compendium.pf2e.equipment-srd.Item.dTxbaa7HSiJbIuNN",
  "underwater": "Compendium.pf2e.equipment-srd.Item.5QKAoWrpSetjHVJs",
  "unholy": "Compendium.pf2e.equipment-srd.Item.gmMrJREf4JSHd2dZ",
  "vorpal": "Compendium.pf2e.equipment-srd.Item.6xaxxKfvXED6LfIY",
  "wounding": "Compendium.pf2e.equipment-srd.Item.fo6Yhq5mbQXsnZs0",
  "flickering": "Compendium.pf2e.equipment-srd.Item.p6RmUi2zCSmjd737",
  "bolkasBlessing": "Compendium.pf2e.equipment-srd.Item.fqnjZzwBi9GH4CXO",
  "ancestralEchoing": "Compendium.pf2e.equipment-srd.Item.oL8G6OqITPJ5Fd6A",
  "energizing": "Compendium.pf2e.equipment-srd.Item.Qqh586pudsEqITUk",
  "flurrying": "Compendium.pf2e.equipment-srd.Item.GNX0BNOoCSOYPedi",
  "greaterBolkasBlessing": "Compendium.pf2e.equipment-srd.Item.mcBXIHJGVQrbDLxi",
  "greaterKolssOath": "Compendium.pf2e.equipment-srd.Item.BuQsMeD7IP4mvDCQ",
  "greaterTruddsStrength": "Compendium.pf2e.equipment-srd.Item.wvo5Qaj5qn7jFHaA",
  "hooked": "Compendium.pf2e.equipment-srd.Item.S9eytXwDMdwdSh2z",
  "fanged": "Compendium.pf2e.equipment-srd.Item.pcGdJvwun0tjrUTz",
  "kolssOath": "Compendium.pf2e.equipment-srd.Item.tvFMexALNZ70NVwh",
  "nightmare": "Compendium.pf2e.equipment-srd.Item.TRUl7Iro5aKtqFMA",
  "bloodbane": "Compendium.pf2e.equipment-srd.Item.C9wOlvuVCjVbz1YQ",
  "bloodthirsty": "Compendium.pf2e.equipment-srd.Item.AgDNThyJHtsp1Vjt",
  "merciful": "Compendium.pf2e.equipment-srd.Item.r28DjJEjF6jvCcfb",
  "crushing": "Compendium.pf2e.equipment-srd.Item.JY8X4RSfg6xIqAC9",
  "hopeful": "Compendium.pf2e.equipment-srd.Item.NCE7g1U3q3RYwCY2",
  "coating": "Compendium.pf2e.equipment-srd.Item.y9RUbQec9zGeqqcE",
  "impossible": "Compendium.pf2e.equipment-srd.Item.uU4VC8OlhDHslT4i",
  "kinWarding": "Compendium.pf2e.equipment-srd.Item.7vwcuBIe4BNS5uuE",
  "serrating": "Compendium.pf2e.equipment-srd.Item.SV7W0lC2d8mfYuhy",
  "animated": "Compendium.pf2e.equipment-srd.Item.DCPsilr8wbPXxTUv",
  "pacifying": "Compendium.pf2e.equipment-srd.Item.R8I13CDRzvpVXOVe",
  "giantKilling": "Compendium.pf2e.equipment-srd.Item.EjV3Pb13DLzGTCcY",
  "majorRooting": "Compendium.pf2e.equipment-srd.Item.h4n9PdQrOkCrJ9sY",
  "majorFanged": "Compendium.pf2e.equipment-srd.Item.qL1S3vGfv8Dh5yAE",
  "trueRooting": "Compendium.pf2e.equipment-srd.Item.aXqCFjLSSjC3a1Mq",
  "cunning": "Compendium.pf2e.equipment-srd.Item.T4gTHDKJ0HI10p3y",
  "conducting": "Compendium.pf2e.equipment-srd.Item.cHCaDiKel0qAIQmC",
  "called": "Compendium.pf2e.equipment-srd.Item.QHc7AnKoMpcqsI2d",
  "SpellReservoir": "Compendium.pf2e.equipment-srd.Item.payq4TwkN2BRF6fs",
  "swarming": "Compendium.pf2e.equipment-srd.Item.z8nKK4rSUGQVT2t9",
  "decaying": "Compendium.pf2e.equipment-srd.Item.fyiW23MFe8p06KL5",
  "quickstrike": "Compendium.pf2e.equipment-srd.Item.KnZL0xPWDzQx9vWQ",
  "deathdrinking": "Compendium.pf2e.equipment-srd.Item.4DXupoMmwenFn4Kc",
  "truddsStrength": "Compendium.pf2e.equipment-srd.Item.I8XecIUYhwagAnXv",
  "greaterAstral": "Compendium.pf2e.equipment-srd.Item.hebf5k3cd7LO6luX",
  "greaterGiantKilling": "Compendium.pf2e.equipment-srd.Item.CxadMTEjnuXyqmcQ",
  "greaterAshen": "Compendium.pf2e.equipment-srd.Item.lo5QOMA9VAUwUVl7",
  "greaterHauling": "Compendium.pf2e.equipment-srd.Item.o0XXVVymB8kluwLK",
  "greaterDecaying": "Compendium.pf2e.equipment-srd.Item.HGsA5gXtaAA65n9e",
  "greaterRooting": "Compendium.pf2e.equipment-srd.Item.T5KifnxLN3vWuUJa",
  "greaterAnchoring": "Compendium.pf2e.equipment-srd.Item.kY41VIXUSEJYEznp",
  "greaterBloodbane": "Compendium.pf2e.equipment-srd.Item.zEys8FeMMAwTqwgW",
  "greaterVitalizing": "Compendium.pf2e.equipment-srd.Item.oVrVzML63VFvVfKk",
  "greaterFanged": "Compendium.pf2e.equipment-srd.Item.cvb47A6K1w7RfNiv",
  "vitalizing": "Compendium.pf2e.equipment-srd.Item.LwQb7ryTC8FlOXgX",
  "demolishing": "Compendium.pf2e.equipment-srd.Item.i9hF185TRK0cH8B4",
  "rooting": "Compendium.pf2e.equipment-srd.Item.yGgsoSA8EaaEsYZn",
  "anchoring": "Compendium.pf2e.equipment-srd.Item.SuKERInt6Z3I3bCa",
  "earthbinding": "Compendium.pf2e.equipment-srd.Item.OClYfRHzoynib6wX",
  "energyAdaptive": "Compendium.pf2e.equipment-srd.Item.DAWaXFtevHLUJxHB",
  "shadow": "Compendium.pf2e.equipment-srd.Item.kEy7Uc1VisizGgtf",
  "ethereal": "Compendium.pf2e.equipment-srd.Item.q70WXJO1rswduHuT",
  "rockBraced": "Compendium.pf2e.equipment-srd.Item.1n22FbWdDNC7tLT6",
  "ready": "Compendium.pf2e.equipment-srd.Item.QNPwzwKervKpk6YO",
  "swallowSpike": "Compendium.pf2e.equipment-srd.Item.BKjwg0TEGioiYpz1",
  "magnetizing": "Compendium.pf2e.equipment-srd.Item.jrjwukkie7Y7wkxu",
  "lesserDread": "Compendium.pf2e.equipment-srd.Item.gSSibF07emWGpGKw",
  "advancing": "Compendium.pf2e.equipment-srd.Item.45zjE7pj6FUHuz3K",
  "immovable": "Compendium.pf2e.equipment-srd.Item.n8nLwFR4VFFmAny5",
  "implacable": "Compendium.pf2e.equipment-srd.Item.XkjOK05Gw0o3iycr",
  "malleable": "Compendium.pf2e.equipment-srd.Item.eHfL8Apfx4fxGksT",
  "majorShadow": "Compendium.pf2e.equipment-srd.Item.2FjdEflsVldnuebM",
  "majorQuenching": "Compendium.pf2e.equipment-srd.Item.3rlu75EjB2SVAuOI",
  "majorStanching": "Compendium.pf2e.equipment-srd.Item.ZTdRDRew1B0zTGiU",
  "majorSlick": "Compendium.pf2e.equipment-srd.Item.9imz3VgBXCg13RfT",
  "majorSwallowSpike": "Compendium.pf2e.equipment-srd.Item.RRFyASbHcdclympe",
  "trueQuenching": "Compendium.pf2e.equipment-srd.Item.hGZNrPMdxsabNFLx",
  "trueStanching": "Compendium.pf2e.equipment-srd.Item.dLYifig01WulSNVF",
  "portable": "Compendium.pf2e.equipment-srd.Item.VYXAdLJdF0XSeX5m",
  "gliding": "Compendium.pf2e.equipment-srd.Item.A2Z7Mh8A59wZb5vv",
  "slick": "Compendium.pf2e.equipment-srd.Item.uQOaRpfkUFVYD0Gx",
  "moderateDread": "Compendium.pf2e.equipment-srd.Item.4cbe0WVSHn1FxygQ",
  "quenching": "Compendium.pf2e.equipment-srd.Item.tpkkAtlMIOL8TnW6",
  "soaring": "Compendium.pf2e.equipment-srd.Item.CJtn848AL7Q0Lxf2",
  "winged": "Compendium.pf2e.equipment-srd.Item.ds7j3D8IIyxWd2XI",
  "greaterShadow": "Compendium.pf2e.equipment-srd.Item.bSm0Hki8N2L50OZw",
  "greaterAdvancing": "Compendium.pf2e.equipment-srd.Item.1neYjXMc4srH7KQ0",
  "greaterQuenching": "Compendium.pf2e.equipment-srd.Item.HhtZl2pr7xChKu2c",
  "greaterWinged": "Compendium.pf2e.equipment-srd.Item.Ztb4xv4UGZbF32TE",
  "greaterStanching": "Compendium.pf2e.equipment-srd.Item.ioLWDzXp2dG7ZMHf",
  "greaterDread": "Compendium.pf2e.equipment-srd.Item.6PW3zAn8fWW3IYA0",
  "greaterSwallowSpike": "Compendium.pf2e.equipment-srd.Item.ciykvIC4SFFxIfUw",
  "aimAiding": "Compendium.pf2e.equipment-srd.Item.mKlUg7SWC5LcOqaj",
  "stanching": "Compendium.pf2e.equipment-srd.Item.NJtIwMIzjdRqupAM",
  "bitter": "Compendium.pf2e.equipment-srd.Item.nGZPhGpCxM8U1JXv",
  "sinisterKnight": "Compendium.pf2e.equipment-srd.Item.QDYPr19De3TBIysx",
  "misleading": "Compendium.pf2e.equipment-srd.Item.68rHNRZmlnyaUbBF",
  "sizeChanging": "Compendium.pf2e.equipment-srd.Item.Z5FvYWLEpWVo3PUF"
}
/* ======================================================================== */
Hooks.once("init", registerSettings);

Hooks.on("renderItemSheetPF2e", async (sheet) => {
  const item = sheet.document;

  const runes = item.system?.runes?.property ?? [];
  const hash = runes.slice().sort().join("|");

  const storedHash = await item.getFlag(MOD_ID, FLAG_HASH) || "";

  if (hash === storedHash) return;

  let originalDesc = await item.getFlag(MOD_ID, FLAG_ORIG);
  if (!originalDesc) {
    const current = item.system.description.value || "";
    originalDesc = current.replace(new RegExp(`${START}[\\s\\S]*?${END}`, "g"), "").trim();
    await item.setFlag(MOD_ID, FLAG_ORIG, originalDesc);
  }

  if (runes.length === 0) {
    await item.update({ "system.description.value": originalDesc });
    await item.unsetFlag(MOD_ID, FLAG_HASH);
    console.log(`[${MOD_ID}] Removed the rune section from: ${item.name}`);
    return;
  }

  const fragments = [];
  const missingRunes = [];

  for (const slug of runes) {
    const uuid = UUID_RUNES[slug];
    if (!uuid) {
      missingRunes.push(slug);
      continue;
    }

    const doc = await fromUuid(uuid);
    if (!doc) {
      missingRunes.push(slug);
      continue;
    }

    const desc = doc.system?.description?.value ?? "";
    fragments.push(`<hr><h3>${doc.name}</h3>${desc}`);
  }

  if (missingRunes.length > 0) {
    if (game.user.isGM) {
      ui.notifications.warn(`No description for rune: ${missingRunes.join(", ")}`);
    }
    await item.update({ "system.description.value": originalDesc });
    await item.unsetFlag(MOD_ID, FLAG_HASH);
    return;
  }

  const title = game.i18n.localize("lang-pl-addons-pf2e.runeDescriptionsTitle");
  const newBlock = `${START}<h3>${title}</h3>${fragments.join("")}${END}`;
  const finalDesc = originalDesc ? `${originalDesc}\n<hr>\n${newBlock}` : newBlock;

  await item.update({ "system.description.value": finalDesc });
  await item.setFlag(MOD_ID, FLAG_HASH, hash);

  console.log(`[${MOD_ID}] Updated descriptions of runes in: ${item.name}`);
});