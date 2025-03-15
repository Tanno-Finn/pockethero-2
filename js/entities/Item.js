/**
 * Item Class
 * Represents a game item with properties and effects
 */
class Item {
    /**
     * Create a new Item
     * @param {Object} data - Item data
     */
    constructor(data) {
        /**
         * Item ID
         * @type {string}
         */
        this.id = data.id;

        /**
         * Item name
         * @type {string}
         */
        this.name = data.name;

        /**
         * Item type
         * @type {string}
         */
        this.type = data.type;

        /**
         * Item description
         * @type {string}
         */
        this.description = data.description || '';

        /**
         * Item effect data
         * @type {Object}
         */
        this.effect = data.effect || {};

        /**
         * Whether item is key item
         * @type {boolean}
         */
        this.isKeyItem = data.isKeyItem || false;

        /**
         * Item price
         * @type {number}
         */
        this.price = data.price || 0;
    }

    /**
     * Get item description
     * @returns {string} Item description
     */
    getDescription() {
        return this.description;
    }

    /**
     * Check if item is usable in battle
     * @returns {boolean} Whether item is usable in battle
     */
    isUsableInBattle() {
        return this.type === ITEM_TYPES.POTION ||
            this.type === ITEM_TYPES.BALL ||
            this.type === ITEM_TYPES.BATTLE;
    }

    /**
     * Check if item is usable outside battle
     * @returns {boolean} Whether item is usable outside battle
     */
    isUsableOutsideBattle() {
        return this.type === ITEM_TYPES.POTION ||
            this.type === ITEM_TYPES.KEY ||
            this.type === ITEM_TYPES.EVOLUTION;
    }

    /**
     * Convert to a plain object
     * @returns {Object} Plain object representation of item
     */
    toObject() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            description: this.description,
            effect: this.effect,
            isKeyItem: this.isKeyItem,
            price: this.price
        };
    }
}