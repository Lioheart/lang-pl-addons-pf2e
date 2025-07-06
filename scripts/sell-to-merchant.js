Hooks.once("ready", () => {
    if (!game.settings.get("lang-pl-addons-pf2e", "enableSellToMerchant")) return;

    const LootSheet = CONFIG.Actor.sheetClasses.loot?.["pf2e.LootSheetPF2e"]?.cls;
    if (!LootSheet) return;

    const originalMoveItem = LootSheet.prototype.moveItemBetweenActors;

    LootSheet.prototype.moveItemBetweenActors = async function (event, item, targetActor) {
        let sourceActor = item.actor;
        if (!sourceActor && item.flags?.core?.sourceId) {
            try {
                const sourceItem = await fromUuid(item.flags.core.sourceId);
                sourceActor = sourceItem?.actor || null;
                item = sourceItem || item;
            } catch { }
        }
        if (!sourceActor || !targetActor) return originalMoveItem.call(this, event, item, targetActor);

        const isMerchant = targetActor.type === "loot" && targetActor.system?.lootSheetType === "Merchant";
        const isPlayer = sourceActor.hasPlayerOwner;
        const isPhysical = item.isOfType?.("physical") || false;
        if (!isMerchant || !isPlayer || !isPhysical) {
            return originalMoveItem.call(this, event, item, targetActor);
        }

        const price = item.system.price?.value || {};
        const coinRates = { pp: 1000, gp: 100, sp: 10, cp: 1 };
        let totalCp = 0;
        for (const [denom, rate] of Object.entries(coinRates)) {
            totalCp += (Number(price[denom]) || 0) * rate;
        }
        if (totalCp <= 0) {
            ui.notifications.warn(
                game.i18n.format("lang-pl-addons-pf2e.sell-to-merchant.warnNoPrice", { item: item.name })
            );
            return originalMoveItem.call(this, event, item, targetActor);
        }

        const isTreasure = (
            CONFIG.PF2E?.Item?.documentClasses?.treasure &&
            item instanceof CONFIG.PF2E.Item.documentClasses.treasure
        ) || item.type === "treasure";
        const unitCp = isTreasure ? totalCp : Math.max(1, Math.floor(totalCp / 2));

        const quantity = item.system.quantity || 1;
        const saleCp = unitCp * quantity;

        const coinsObj = splitCpToCoins(saleCp);
        const coinStr = new game.pf2e.Coins(coinsObj).toString();

        const confirmed = await foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize("lang-pl-addons-pf2e.sell-to-merchant.confirmTitle") },
            content: game.i18n.format(
                "lang-pl-addons-pf2e.sell-to-merchant.confirmContent",
                { item: item.name, quantity, coins: coinStr }
            )
        });
        if (!confirmed) return;

        await sourceActor.transferItemToActor(
            targetActor,
            item,
            quantity,
            undefined,
            true,
            false
        );


        await addCoinsFromCompendium(sourceActor, saleCp);

        const msg = game.i18n.format(
            "lang-pl-addons-pf2e.sell-to-merchant.chatMessage",
            {
                seller: sourceActor.name,
                quantity,
                item: item.name,
                coins: coinStr
            }
        );
        ui.notifications.info(msg);
        ChatMessage.create({ content: msg });
    };

    function splitCpToCoins(cpAmount) {
        const rates = { pp: 1000, gp: 100, sp: 10, cp: 1 };
        const out = {}; let rem = cpAmount;
        for (const [d, r] of Object.entries(rates)) {
            const c = Math.floor(rem / r);
            if (c > 0) {
                out[d] = c;
                rem -= c * r;
            }
        }
        return out;
    }

    async function addCoinsFromCompendium(actor, cp) {
        const uuids = {
            pp: "Compendium.pf2e.equipment-srd.Item.JuNPeK5Qm1w6wpb4",
            gp: "Compendium.pf2e.equipment-srd.Item.B6B7tBWJSqOBz5zz",
            sp: "Compendium.pf2e.equipment-srd.Item.5Ew82vBF9YfaiY9f",
            cp: "Compendium.pf2e.equipment-srd.Item.lzJ8AVhRcbFul5fh"
        };
        const parts = splitCpToCoins(cp);
        for (const [d, count] of Object.entries(parts)) {
            try {
                const doc = await fromUuid(uuids[d]);
                if (!doc) continue;
                const data = duplicate(doc.toObject());
                data.system ??= {};
                data.system.quantity = count;
                await addOrIncreaseItem(actor, data);
            } catch (e) {
                console.error("SellToMerchant addCoins error", e);
            }
        }
    }

    async function addOrIncreaseItem(actor, data) {
        const existing = actor.items.find(i => i.name === data.name && i.type === data.type);
        if (existing) {
            const cur = existing.system.quantity || 0;
            const add = data.system.quantity || 1;
            await existing.update({ "system.quantity": cur + add });
        } else {
            await actor.createEmbeddedDocuments("Item", [data]);
        }
    }
});