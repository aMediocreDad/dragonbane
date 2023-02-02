import DoD_Utility from "./utility.js";
import { DoD } from "./config.js";

export class DoDActor extends Actor {

    /** @override */
    /*
    getData() {
        const context = super.getData();
        const gear = [];

        for (let i of context.items) {
            i.img = i.img || DEFAULT_TOKEN;
            gear.push(i);
        }
        context.gear = gear;

        return context;
    }
    */

    /** @override */
    async _preCreate(data, options, user) {

        await super._preCreate(data, options, user);
    
        // If the created actor has items (only applicable to duplicated actors) bypass the new actor creation logic
        if (!data.items?.length)
        {
            let baseSkills = await DoD_Utility.getBaseSkills();
            if (baseSkills) {}
                data.items = baseSkills;
                this.updateSource(data);
        }
    }
    
    /** @override */
    prepareData() {
        // Prepare data for the actor. Calling the super version of this executes
        // the following, in order: data reset (to clear active effects),
        // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
        // prepareDerivedData().
        super.prepareData();
    }

    /** @override */
    prepareBaseData() {
        super.prepareBaseData();

        // prepare skills
        this._prepareSkills();
        this._prepareBaseChances();
        this._prepareKin();
    }

    prepareEmbeddedDocuments() {
        super.prepareEmbeddedDocuments();
        
        if (this.type == 'character') return this._prepareEquippedItems();
    }

    prepareDerivedData() {
        super.prepareDerivedData();

        switch(this.type)
        {
            case "character":
                this._prepareCharacterData();
                break;
            case "npc":
                this._prepareNpcData();
                break;
            case "monster":
                this._prepareMonsterData();
                break;
        }
    }

    getSkill(name) {
        let a = name.toLowerCase();
        return this.system.skills?.find(skill => skill.name.toLowerCase() === a);
    }

    _prepareCharacterData() {
        this._prepareActorStats();
        this._prepareCharacterStats();
        this._prepareSpellValues();
    }

    _prepareNpcData() {
    }

    _prepareMonsterData() {
    }

    _prepareEquippedItems() {
        let armor = null;
        let helmet = null;

        for (let item of this.items.contents) {
            if (item.type == 'armor' && item.system.worn) {
                if (armor) {
                    // Already wearing armor
                    item.update({ ["system.worn"]: false });
                } else {
                    armor = item;
                }
            }
            if (item.type == 'helmet' && item.system.worn) {
                if (helmet) {
                    // Already wearing helmet
                    item.update({ ["system.worn"]: false });
                } else {
                    helmet = item;
                }
            }
        }
        this.system.equippedArmor = armor;
        this.system.equippedHelmet = helmet;        
    }

    _prepareSkills() {

        this.system.skills = [];
        this.system.coreSkills = [];
        this.system.weaponSkills = [];
        this.system.magicSkills = [];
        this.system.secondarySkills = [];
        
        for (let item of this.items.contents) {
            if (item.type == 'skill') {
                let skill = item;
                this.system.skills.push(skill);
                if (skill.system.skillType == 'core') {
                    this.system.coreSkills.push(skill);
                }  else if (skill.system.skillType == 'weapon') {
                    this.system.weaponSkills.push(skill);
                } else if (skill.system.skillType == 'magic') {
                    // schools of magic are secondary skills
                    this.system.magicSkills.push(skill);
                    this.system.secondarySkills.push(skill);
                } else {
                    this.system.secondarySkills.push(skill);
                }
            }
        }
    }

    _prepareCharacterStats() {
        // Damage Bonus
        let damageBonusAGL = DoD_Utility.calculateDamageBonus(this.system.attributes.agl.value);
        let damageBonusSTR = DoD_Utility.calculateDamageBonus(this.system.attributes.str.value);
        this.update({ 
            ["system.damageBonus.agl"]: damageBonusAGL,
            ["system.damageBonus.str"]: damageBonusSTR });

        // Will Points
        let maxWillPoints = this.system.attributes.wil.value;
        if (this.system.willPoints.max != maxWillPoints) {
            // Attribute changed - keep spent amount (damage) and update max value
            let damage = this.system.willPoints.max - this.system.willPoints.value;
            if (damage < 0) {
                damage = 0;
            } else if (damage > maxWillPoints) {
                damage = maxWillPoints;
            }
            this.update({ 
                ["system.willPoints.max"]: maxWillPoints,
                ["system.willPoints.value"]: maxWillPoints - damage });
        }
        
        // Hit Points
        let maxHitPoints = this.system.attributes.con.value;
        if (this.system.hitPoints.max != maxHitPoints) {
            // Attribute changed - keep damage and update max value
            let damage = this.system.hitPoints.max - this.system.hitPoints.value;
            if (damage < 0) {
                damage = 0;
            } else if (damage > maxHitPoints) {
                damage = maxHitPoints;
            }
            this.update({
                ["system.hitPoints.max"]: maxHitPoints,
                ["system.hitPoints.value"]: maxHitPoints - damage });
        }

        // Movement
        let baseMovement = Number(this.system.kin ? this.system.kin.system.movement : 10);
        let movementModifier =  DoD_Utility.calculateMovementModifier(this.system.attributes.agl.value);
        this.update({ ["system.movement"]: baseMovement + movementModifier });
    }

    _prepareActorStats() {

    }

    _getAttributeValueFromName(name) {
        let attribute = this.system.attributes[name.toLowerCase()];
        if (attribute) return attribute.value;
        return 0;
    }

    _prepareBaseChances() {
        for (let item of this.items.contents) {
            if (item.type == "skill") {
                let skill = item;
                let name = skill.system.attribute;
                let value = this._getAttributeValueFromName(name);
                skill.baseChance = DoD_Utility.calculateBaseChance(value);
                if ((skill.system.skillType == "core" || skill.system.skillType == "weapon") && skill.system.value < skill.baseChance) {
                    skill.system.value = skill.baseChance;
                }
            }
        }
    }

    findAbility(abilityName) {
        let name = abilityName.toLowerCase();
        return this.items.find(item => item.type == "ability" && item.name.toLowerCase() == name);
    }

    async removeKin() {
        let ids = [];
        //  kin items
        this.items.contents.forEach(i => {
            if (i.type == "kin") ids.push(i.id)
        });
        //  kin ability items
        this.items.contents.forEach(i => {
            if (i.type == "ability" && i.system.abilityType == "kin") ids.push(i.id)
        });
        // delete items and clear kin
        await this.deleteEmbeddedDocuments("Item", ids);
        this.system.kin = null;
    }

    async addKinAbilities() {
        let kin = this.system.kin;

        if (kin && kin.system.abilities.length) {
            let abilities = DoD_Utility.splitAndTrimString(kin.system.abilities);
            let itemData = [];

            for(const abilityName of abilities) {
                // Make sure kin ability exist
                let kinAbility = this.findAbility(abilityName);
                if (!kinAbility) {
                    kinAbility = await DoD_Utility.findAbility(abilityName);
                    if (kinAbility) {
                        itemData.push(kinAbility.toObject());
                    } else {
                        DoD_Utility.WARNING("DoD.WARNING.kinAbility", {ability: abilityName});
                    }
                }
            }
            await this.createEmbeddedDocuments("Item", itemData);
        }
    }

    _prepareKin() {
        this.system.kin = this.items.find(item => item.type == "kin");
    }

    _prepareSpellValues() {
        let magicSchools = new Map;
        let maxValue = 0;

        // find skill values for schools of magic
        for (let item of this.items.contents) {
            if (item.type == "skill" && item.system.skillType == "magic") {
                let skill = item;
                magicSchools.set(skill.name, skill.system.value);
                if (skill.system.value > maxValue) {
                    maxValue = skill.system.value;
                }
            }
        }

        // set the skill value of general spells to max of all magic schools
        let generalSchool = "DoD.spell.general";
        magicSchools.set(generalSchool, maxValue);

        let generalSchoolLocalized = game.i18n.localize(generalSchool);

        for (let item of this.items.contents) {
            if (item.type == "spell") {
                let spell = item;

                // replace general spells school name with localized string if it matches
                if (spell.system.school == generalSchoolLocalized) {
                    spell.system.school = generalSchool;
                    spell.update({ ["system.school"]: generalSchool});
                }

                // set skill values for spell corresponding to school
                if (magicSchools.has(spell.system.school)) {
                    spell.value = magicSchools.get(spell.system.school);
                } else {
                    spell.value = 0;
                }
            }
        }
    }
}