/**
 * EventSystem Class
 * Centralized event management system for communication between game components
 * Provides methods for subscribing to and emitting events
 */
class EventSystem {
    /**
     * Create a new EventSystem
     * @param {Phaser.Game} game - The Phaser game instance
     */
    constructor(game) {
        /**
         * Reference to the Phaser game instance
         * @type {Phaser.Game}
         * @private
         */
        this._game = game;

        /**
         * Phaser event emitter used for the event system
         * @type {Phaser.Events.EventEmitter}
         * @private
         */
        this._emitter = new Phaser.Events.EventEmitter();

        /**
         * Debug mode flag
         * @type {boolean}
         * @private
         */
        this._debug = GAME_CONFIG.DEBUG;

        if (this._debug) {
            console.log('EventSystem initialized');
        }
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name from EVENTS constants
     * @param {function} callback - Function to call when event is emitted
     * @param {object} context - Context to bind the callback to
     * @returns {Phaser.Events.EventEmitter} - Event emitter for chaining
     */
    on(event, callback, context) {
        if (this._debug) {
            console.log(`EventSystem: Subscribing to ${event}`);
        }
        return this._emitter.on(event, callback, context);
    }

    /**
     * Subscribe to an event for a single occurrence
     * @param {string} event - Event name from EVENTS constants
     * @param {function} callback - Function to call when event is emitted
     * @param {object} context - Context to bind the callback to
     * @returns {Phaser.Events.EventEmitter} - Event emitter for chaining
     */
    once(event, callback, context) {
        if (this._debug) {
            console.log(`EventSystem: Subscribing once to ${event}`);
        }
        return this._emitter.once(event, callback, context);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name from EVENTS constants
     * @param {function} callback - Function to remove
     * @param {object} context - Context of the callback
     * @returns {Phaser.Events.EventEmitter} - Event emitter for chaining
     */
    off(event, callback, context) {
        if (this._debug) {
            console.log(`EventSystem: Unsubscribing from ${event}`);
        }
        return this._emitter.off(event, callback, context);
    }

    /**
     * Emit an event
     * @param {string} event - Event name from EVENTS constants
     * @param {...*} args - Arguments to pass to the event handlers
     * @returns {boolean} - True if the event had listeners, false otherwise
     */
    emit(event, ...args) {
        if (this._debug) {
            console.log(`EventSystem: Emitting ${event}`, ...args);
        }
        return this._emitter.emit(event, ...args);
    }

    /**
     * Remove all listeners for an event
     * @param {string} event - Event name from EVENTS constants
     * @returns {Phaser.Events.EventEmitter} - Event emitter for chaining
     */
    removeAllListeners(event) {
        if (this._debug) {
            console.log(`EventSystem: Removing all listeners for ${event}`);
        }
        return this._emitter.removeAllListeners(event);
    }

    /**
     * Get the number of listeners for an event
     * @param {string} event - Event name from EVENTS constants
     * @returns {number} - Number of listeners
     */
    listenerCount(event) {
        return this._emitter.listenerCount(event);
    }

    /**
     * Get the event emitter instance
     * @returns {Phaser.Events.EventEmitter} - The underlying event emitter
     */
    getEmitter() {
        return this._emitter;
    }

    /**
     * Shutdown the event system
     * Removes all event listeners
     */
    shutdown() {
        if (this._debug) {
            console.log('EventSystem: Shutting down');
        }
        this._emitter.removeAllListeners();
    }
}