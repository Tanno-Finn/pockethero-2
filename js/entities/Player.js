/**
 * Player Class
 * Represents the player character with stats, inventory, and party
 */
class Player {
    /**
     * Create a new Player
     * @param {Phaser.Scene} scene - The scene this player belongs to
     * @param {number} x - Initial X position in grid coordinates
     * @param {number} y - Initial Y position in grid coordinates
     */
    constructor(scene, x, y) {
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
         * Player position
         * @type {Object}
         */
        this.position = {
            x: x || 0,
            y: y || 0
        };

        /**
         * Player name
         * @type {string}
         */
        this.name = 'Player';

        /**
         * Player's monster party
         * @type {Array}
         */
        this.party = [];

        /**
         * Player inventory
         * @type {Array}
         */
        this.inventory = [];

        /**
         * Player progress
         * @type {Object}
         */
        this.progress = {
            badges: 0,
            quests: {}
        };

        /**
         * Debug mode flag
         * @type {boolean}
         * @private
         */
        this._debug = GAME_CONFIG.DEBUG;

        if (this._debug) {
            console.log(`Player: Created at ${x},${y}`);
        }
    }

    /**
     * Update player position
     * @param {number} x - New X position
     * @param {number} y - New Y position
     */
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;

        if (this._debug) {
            console.log(`Player: Moved to ${x},${y}`);
        }
    }

    /**
     * Add a monster to player's party
     * @param {Object} monster - Monster to add
     * @returns {boolean} Success of adding monster
     */
    addMonster(monster) {
        // Check party size
        if (this.party.length >= GAME_CONFIG.MAX_PARTY_SIZE) {
            return false;
        }

        // Add monster to party
        this.party.push(monster);

        // Emit event
        if (this._events) {
            this._events.emit(EVENTS.MONSTER_CAUGHT, monster);
        }

        return true;
    }

    /**
     * Save player data to game registry
     * @param {Phaser.Game} game - Phaser game instance
     */
    saveToRegistry(game) {
        game.registry.set('playerData', {
            name: this.name,
            position: this.position,
            party: this.party,
            inventory: this.inventory,
            progress: this.progress
        });
    }
}