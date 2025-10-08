const MODULE_ID = "lang-pl-addons-pf2e";
const MARKER_SRC = `modules/${MODULE_ID}/static/magic-circle-luminous.png`;

// Funkcja, która instaluje override
async function patchTurnMarker() {
    const TurnMarkerClass = foundry.canvas?.placeables?.tokens?.TokenTurnMarker;
    if (!TurnMarkerClass) {
        console.warn(`[${MODULE_ID}] TokenTurnMarker class not found — cannot override turn marker.`);
        return;
    }

    const originalDraw = TurnMarkerClass.prototype.draw;

    TurnMarkerClass.prototype.draw = async function (...args) {
        await originalDraw.apply(this, args);

        try {
            const texture = await PIXI.Assets.load(MARKER_SRC);
            if (!texture) return;

            if (this.mesh?.sprite) {
                this.mesh.sprite.texture = texture;
            } else if (this.mesh && "texture" in this.mesh) {
                this.mesh.texture = texture;
            } else {
                const sprite = new PIXI.Sprite(texture);
                sprite.anchor.set(0.5);
                this.addChild(sprite);
            }
        } catch (err) {
            console.warn(`[${MODULE_ID}] Nie udało się podmienić znacznika tury:`, err);
        }
    };

    console.log(`[${MODULE_ID}] Custom turn marker draw installed.`);
}

// Poczekaj aż canvas będzie gotowy, aby wszyscy gracze mogli zobaczyć marker
Hooks.once("canvasReady", () => {
    const enabled = game.settings.get(MODULE_ID, "enableCustomTurnMarker");
    if (!enabled) return;

    patchTurnMarker();
});
