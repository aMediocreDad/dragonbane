# Change Log

## Version 1.1.0
- Weapons
    - New weapon feature: Unarmed. Unarmed weapons do not count towards weapons at hand.
    - All melee weapons can now Topple.
    - Toppling weapons get a Boon on Topple.
    - Fixed bug where pushing a weapon roll always resulted in the default action
- Character
    - Prevent having more than 3 weapons at hand after dragging and dropping on the inventory tab.
- Monsters and NPCs
    - Items can be created on the inventory tab.
- Miscellaneous
    - Removed error message when deleted token is referenced in chat message
    - Chat message text is always selectable
    - Fixed spelling error in introduction journal.
    - Changed how Death Rolls are updated.
    - Disheartened is now written in full in the chat log.
    - Condition labels on the character sheet will be clipped if too long.
    - Added Brazilian Portuguese localization

## Version 1.0.0
- General
    - Added custom 3D dice for Dice So Nice.
    - Removed repetition on background image.
- Characters
    - Enabled dragging items from Observable characters.
    - Checking Memento on an item unchecks existing Memento.
- Spells
    - Changed label from Distance to Range in spell list journal.
    - Fixed double damage on spell crit.
    - Fixed CTRL/SHIFT+spell draining all WP.
    
## Version 0.0.4
- Characters
    - Create items from the inventory tab on the character sheet.
    - Option to hide skill from Trained Skills.
- Monsters
    - Weapons on the monster sheet can be right-clicked.
    - Monster weapon damage can be used with targeting.
- Chat & Combat
    - Added option to deal damage ignoring armor.
    - Actions on chat cards are only visible for owners.
    - Added attribute name after condition when prompted to push a roll.
    - Fixed bug where WP was not refunded when choosing that option on a spell crit on a pushed roll.
- Items
    - Count on items renamed to Quantity.
    - Added tooltips to skill sheet.
    - Added input validation for spell damage.
    - Thrown weapons are always considered melee weapons, even if range >= 10.
- Journal
    - Added instructions on how to use YZE Combat.
- General
    - Fixed some localization issues.
