/**
 * DataManager Class
 * Handles loading and access to game data from JSON files
 * Provides validation and caching for game data
 */
class DataManager {
    /**
     * Create a new DataManager
     */
    constructor() {
        /**
         * Cache of loaded data by type and id
         * @type {Object}
         * @private
         */
        this._cache = {
            monsters: {},
            maps: {},
            npcs: {},
            items: {},
            abilities: {},
            dialogs: {},
            quests: {}
        };

        /**
         * Flag indicating whether data has been initialized
         * @type {boolean}
         * @private
         */
        this._initialized = false;

        /**
         * Debug mode flag
         * @type {boolean}
         * @private
         */
        this._debug = GAME_CONFIG.DEBUG;
    }

    /**
     * Initialize the data manager
     * @param {Phaser.Scene} scene - Scene to use for loading data
     * @returns {Promise} - Promise that resolves when initialization is complete
     */
    init(scene) {
        if (this._initialized) {
            console.warn('DataManager already initialized');
            return Promise.resolve();
        }

        if (this._debug) {
            console.log('DataManager: Initializing');
        }

        // Store reference to scene for loading
        this._scene = scene;

        // Data types to load
        const dataTypes = [
            'monsters',
            'maps',
            'npcs',
            'items',
            'abilities',
            'dialogs',
            'quests'
        ];

        // Create promise for each data type
        const promises = dataTypes.map(type => this._loadDataIndex(type));

        // Return promise that resolves when all data is loaded
        return Promise.all(promises)
            .then(() => {
                this._initialized = true;
                if (this._debug) {
                    console.log('DataManager: Initialization complete');
                }
            })
            .catch(error => {
                console.error('DataManager: Initialization failed', error);
            });
    }

    /**
     * Load index file for data type
     * @param {string} type - Data type to load
     * @returns {Promise} - Promise that resolves when data is loaded
     * @private
     */
    _loadDataIndex(type) {
        return new Promise((resolve, reject) => {
            // Load index file for data type
            this._scene.load.json(`${type}-index`, `data/${type}/index.json`);

            // Add completion handler
            this._scene.load.once('complete', () => {
                try {
                    // Get index data
                    const indexData = this._scene.cache.json.get(`${type}-index`);

                    if (!indexData || !indexData.entries) {
                        throw new Error(`Invalid index file for ${type}`);
                    }

                    // Load each entry in index
                    const entryPromises = indexData.entries.map(entry =>
                        this._loadDataEntry(type, entry)
                    );

                    Promise.all(entryPromises)
                        .then(() => resolve())
                        .catch(error => reject(error));
                } catch (error) {
                    reject(error);
                }
            });

            // Start loading
            this._scene.load.start();
        });
    }

    /**
     * Load a single data entry
     * @param {string} type - Data type
     * @param {string} entry - Entry id
     * @returns {Promise} - Promise that resolves when entry is loaded
     * @private
     */
    _loadDataEntry(type, entry) {
        return new Promise((resolve, reject) => {
            // Load data file
            this._scene.load.json(`${type}-${entry}`, `data/${type}/${entry}.json`);

            // Add completion handler
            this._scene.load.once('complete', () => {
                try {
                    // Get data and validate
                    const data = this._scene.cache.json.get(`${type}-${entry}`);

                    if (!data || !data.id) {
                        throw new Error(`Invalid data for ${type}/${entry}`);
                    }

                    // Validate data based on type
                    this._validateData(type, data);

                    // Cache data
                    this._cache[type][data.id] = data;

                    resolve();
                } catch (error) {
                    reject(error);
                }
            });

            // Start loading
            this._scene.load.start();
        });
    }

    /**
     * Validate data based on type
     * @param {string} type - Data type
     * @param {Object} data - Data to validate
     * @throws {Error} If data is invalid
     * @private
     */
    _validateData(type, data) {
        // Validate data based on type
        switch (type) {
            case 'monsters':
                if (!data.baseStats || !data.type || !data.abilities) {
                    throw new Error(`Invalid monster data: ${data.id}`);
                }
                break;

            case 'maps':
                if (!data.width || !data.height || !data.tilemap) {
                    throw new Error(`Invalid map data: ${data.id}`);
                }
                break;

            case 'npcs':
                if (!data.type || !data.dialog) {
                    throw new Error(`Invalid NPC data: ${data.id}`);
                }
                break;

            case 'items':
                if (!data.type || !data.effect) {
                    throw new Error(`Invalid item data: ${data.id}`);
                }
                break;

            case 'abilities':
                if (!data.type || !data.power) {
                    throw new Error(`Invalid ability data: ${data.id}`);
                }
                break;

            case 'dialogs':
                if (!data.text) {
                    throw new Error(`Invalid dialog data: ${data.id}`);
                }
                break;

            case 'quests':
                if (!data.objectives) {
                    throw new Error(`Invalid quest data: ${data.id}`);
                }
                break;

            default:
                throw new Error(`Unknown data type: ${type}`);
        }
    }

    /**
     * Get data for a specific type and id
     * @param {string} type - Data type (monsters, maps, npcs, etc.)
     * @param {string} id - Data id
     * @returns {Object|null} - Data object or null if not found
     */
    get(type, id) {
        if (!this._initialized) {
            console.warn('DataManager not initialized');
            return null;
        }

        if (!this._cache[type]) {
            console.warn(`Unknown data type: ${type}`);
            return null;
        }

        return this._cache[type][id] || null;
    }

    /**
     * Get all data for a specific type
     * @param {string} type - Data type (monsters, maps, npcs, etc.)
     * @returns {Object|null} - Object with all data of specified type
     */
    getAll(type) {
        if (!this._initialized) {
            console.warn('DataManager not initialized');
            return null;
        }

        if (!this._cache[type]) {
            console.warn(`Unknown data type: ${type}`);
            return null;
        }

        return this._cache[type];
    }

    /**
     * Get all ids for a specific type
     * @param {string} type - Data type (monsters, maps, npcs, etc.)
     * @returns {string[]|null} - Array of ids or null if type not found
     */
    getAllIds(type) {
        if (!this._initialized) {
            console.warn('DataManager not initialized');
            return null;
        }

        if (!this._cache[type]) {
            console.warn(`Unknown data type: ${type}`);
            return null;
        }

        return Object.keys(this._cache[type]);
    }

    /**
     * Check if a specific data entry exists
     * @param {string} type - Data type
     * @param {string} id - Data id
     * @returns {boolean} - True if data exists, false otherwise
     */
    exists(type, id) {
        if (!this._initialized) {
            console.warn('DataManager not initialized');
            return false;
        }

        if (!this._cache[type]) {
            return false;
        }

        return !!this._cache[type][id];
    }
}

// Create a global instance
const dataManager = new DataManager();