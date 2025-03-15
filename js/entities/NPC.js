/**
 * NPC Class
 * Represents a non-player character with movement and dialog
 */
class NPC {
    /**
     * Create a new NPC
     * @param {Phaser.Scene} scene - The scene this NPC belongs to
     * @param {number} x - X position in grid coordinates
     * @param {number} y - Y position in grid coordinates
     * @param {Object} config - NPC configuration
     */
    constructor(scene, x, y, config) {
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
         * NPC ID
         * @type {string}
         */
        this.id = config.id || 'npc';

        /**
         * NPC position
         * @type {Object}
         */
        this.position = {
            x: x || 0,
            y: y || 0
        };

        /**
         * NPC type
         * @type {string}
         */
        this.type = config.type || 'npc';

        /**
         * Dialog ID for this NPC
         * @type {string}
         */
        this.dialogId = config.dialog || null;

        /**
         * Movement pattern
         * @type {string}
         */
        this.movement = config.movement || 'static';

        /**
         * Patrol points if movement is patrol
         * @type {Array}
         */
        this.patrolPoints = config.patrolPoints || [];

        /**
         * Current patrol point index
         * @type {number}
         */
        this.patrolIndex = 0;

        /**
         * Debug mode flag
         * @type {boolean}
         * @private
         */
        this._debug = GAME_CONFIG.DEBUG;

        if (this._debug) {
            console.log(`NPC: Created ${this.id} at ${x},${y}`);
        }
    }

    /**
     * Update NPC position
     * @param {number} x - New X position
     * @param {number} y - New Y position
     */
    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
    }

    /**
     * Update NPC behavior
     * @param {number} delta - Time elapsed since last update
     */
    update(delta) {
        // Handle movement based on pattern
        switch (this.movement) {
            case 'static':
                // No movement
                break;

            case 'random':
                // Random movement happens externally
                break;

            case 'patrol':
                this.updatePatrol();
                break;
        }
    }

    /**
     * Update patrol movement
     * @private
     */
    updatePatrol() {
        // Skip if no patrol points
        if (!this.patrolPoints || this.patrolPoints.length === 0) {
            return;
        }

        // Get current target point
        const targetPoint = this.patrolPoints[this.patrolIndex];

        // Check if at target point
        if (this.position.x === targetPoint.x && this.position.y === targetPoint.y) {
            // Move to next point
            this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length;
        }
    }
}