/**
 * InventorySystem Class
 * Handles player inventory management including items and their effects
 */
class InventorySystem {
    /**
     * Create a new InventorySystem
     * @param {Phaser.Scene} scene - The scene this system belongs to
     */
    constructor(scene) {
        /**
         * Reference to the scene
         * @type {Phaser.Scene}
         * @private
         */
        this._scene = scene;

        /**
         * The event system
         * @type {EventSystem}
         * @private
         */
        this._events = scene.game.registry.get('eventSystem');

        /**
         * Inventory items
         * @type {Array}
         * @private
         */
        this._items = [];

        /**
         * Item capacity
         * @type {number}
         * @private
         */
        this._capacity = 20;

        /**
         * Debug mode flag
         * @type {boolean}
         * @private
         */
        this._debug = GAME_CONFIG.DEBUG;

        if (this._debug) {
            console.log('InventorySystem: Initialized');
        }
    }

    /**
     * Add an item to the inventory
     * @param {string} itemId - Item ID to add
     * @param {number} quantity - Quantity to add (default: 1)
     * @returns {boolean} Success of adding item
     */
    addItem(itemId, quantity = 1) {
        // Get item data
        const itemData = dataManager.get('items', itemId);

        if (!itemData) {
            console.error(`Item not found: ${itemId}`);
            return false;
        }

        // Check if item already exists in inventory
        const existingItem = this._items.find(item => item.id === itemId);

        if (existingItem) {
            // Update quantity
            existingItem.quantity += quantity;
        } else {
            // Check capacity
            if (this._items.length >= this._capacity) {
                if (this._debug) {
                    console.log('InventorySystem: Inventory full');
                }
                return false;
            }

            // Add new item
            this._items.push({
                id: itemId,
                name: itemData.name,
                quantity: quantity,
                type: itemData.type
            });
        }

        // Emit event
        if (this._events) {
            this._events.emit(EVENTS.ITEM_ACQUIRED, itemId, quantity);
        }

        if (this._debug) {
            console.log(`InventorySystem: Added ${quantity} ${itemData.name}`);
        }

        return true;
    }

    /**
     * Get all items in inventory
     * @returns {Array} All inventory items
     */
    getAllItems() {
        return [...this._items];
    }

    /**
     * Use an item
     * @param {string} itemId - Item ID to use
     * @param {string} targetId - Target for item (if applicable)
     * @returns {Object} Result of using item
     */
    useItem(itemId, targetId) {
        // Find item in inventory
        const itemIndex = this._items.findIndex(item => item.id === itemId);

        if (itemIndex === -1) {
            return { success: false, message: 'Item not found in inventory' };
        }

        // Get item data
        const itemData = dataManager.get('items', itemId);

        if (!itemData) {
            return { success: false, message: 'Item data not found' };
        }

        // Reduce quantity
        this._items[itemIndex].quantity--;

        // Remove item if quantity is zero
        if (this._items[itemIndex].quantity <= 0) {
            this._items.splice(itemIndex, 1);
        }

        // Emit event
        if (this._events) {
            this._events.emit(EVENTS.ITEM_USED, itemId, targetId);
        }

        if (this._debug) {
            console.log(`InventorySystem: Used ${itemData.name}`);
        }

        return { success: true, message: `Used ${itemData.name}` };
    }
}