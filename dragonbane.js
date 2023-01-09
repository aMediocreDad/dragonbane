import { DoD } from "./modules/config.js";
import DoDItemSheet from "./modules/dod-item-sheet.js";
import DoDCharacterSheet from "./modules/dod-character-sheet.js";

Hooks.once("init", function() {
    console.log("DoD | Initializing Dragonbane System");
    
    CONFIG.DoD = DoD;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("DoD", DoDCharacterSheet, {makeDefault: true});

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("DoD", DoDItemSheet, {makeDefault: true});
});