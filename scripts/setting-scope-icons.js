/**
 * Pokazuje przy każdej pozycji w oknie Ustawień ikonę (🌎/👤) z FontAwesome.
 */

const MOD_ID = "lang-pl-addons-pf2e";

Hooks.on("renderSettingsConfig", (settings, htmlEl) => {
  if (!game.settings.get(MOD_ID, "showSettingScopeIcons")) return;

  const html = $(htmlEl);

  html.find(".form-group").each((_, group) => {
    const $group = $(group);

    const input = $group.find("input[name], select[name], textarea[name]").first();
    if (input.length) {
      const id = input.attr("name");
      const setting = game.settings.settings.get(id);
      if (setting) addScopeIcon($group, setting.scope ?? "client");
      return;
    }

    const button = $group.find("button[data-key]").first();
    if (button.length) {
      const key = button.data("key");
      const menu = game.settings.menus.get(key);
      if (menu) addScopeIcon($group, menu.restricted ? "world" : "client");
    }
  });
});

/**
 * @param {JQuery} group - .form-group
 * @param {"client" | "world"} scope
 */
/*<i class="fa-duotone fa-solid fa-user" style="--fa-primary-color: #ff8000; --fa-primary-opacity: 0.5; --fa-secondary-color: #ff8000; --fa-secondary-opacity: 1;"></i>
<i class="fa-duotone fa-solid fa-earth-americas" style="--fa-primary-color: #00ff00; --fa-primary-opacity: 0.8; --fa-secondary-color: #0080ff; --fa-secondary-opacity: 0.7;"></i>*/
function addScopeIcon(group, scope) {
  const iconHTML =
    scope === "world"
      ? `<i class="fa-duotone fa-solid fa-earth-americas" title="${game.i18n.localize("lang-pl-addons-pf2e.scope.world")}"></i>`
      : `<i class="fa-duotone fa-solid fa-user" title="${game.i18n.localize("lang-pl-addons-pf2e.scope.client")}"></i>`;

  const label = group.find("label").first();
  if (label.length && !label.find("i.fa-solid").length) {
    label.prepend(`${iconHTML} `);
  }
}
