/**
 * AssetLoader Class
 * Handles loading of game assets with progress tracking
 * Provides utilities for different asset types
 */
class AssetLoader {
    /**
     * Create a new AssetLoader
     * @param {Phaser.Scene} scene - The scene to load assets into
     */
    constructor(scene) {
        /**
         * Reference to the scene
         * @type {Phaser.Scene}
         * @private
         */
        this._scene = scene;

        /**
         * Debug mode flag
         * @type {boolean}
         * @private
         */
        this._debug = GAME_CONFIG.DEBUG;

        if (this._debug) {
            console.log('AssetLoader: Initialized');
        }
    }

    /**
     * Load assets with progress tracking
     * @param {Object} assets - Assets to load
     * @param {Function} onComplete - Callback when loading is complete
     */
    loadAssets(assets, onComplete) {
        // Set up loading progress callback
        this._scene.load.on('progress', (value) => {
            if (this._debug) {
                console.log(`AssetLoader: Loading progress ${Math.floor(value * 100)}%`);
            }
        });

        // Handle completion
        this._scene.load.on('complete', () => {
            if (this._debug) {
                console.log('AssetLoader: Loading complete');
            }

            if (onComplete) {
                onComplete();
            }
        });

        // Start loading
        this._scene.load.start();
    }
}