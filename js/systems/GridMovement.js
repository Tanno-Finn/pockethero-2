/**
 * GridMovement System
 * Handles tile-based movement on a grid map
 * Manages collisions, movement animations, and path finding
 */
class GridMovement {
    /**
     * Create a new GridMovement system
     * @param {Phaser.Scene} scene - The scene this system belongs to
     * @param {Object} config - Configuration options
     * @param {number} config.tileSize - Size of tiles in pixels
     * @param {Object} config.collisionMap - Map of collision tiles
     */
    constructor(scene, config = {}) {
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
         * Size of tiles in pixels
         * @type {number}
         * @private
         */
        this._tileSize = config.tileSize || GAME_CONFIG.TILE_SIZE;

        /**
         * Map of collision tiles
         * @type {Object}
         * @private
         */
        this._collisionMap = config.collisionMap || {};

        /**
         * Map of entities on the grid
         * Key is "x,y" string, value is entity or array of entities
         * @type {Object}
         * @private
         */
        this._entityMap = {};

        /**
         * Current map data
         * @type {Object}
         * @private
         */
        this._currentMap = null;

        /**
         * Debug mode flag
         * @type {boolean}
         * @private
         */
        this._debug = GAME_CONFIG.DEBUG;

        /**
         * Debug graphics object for visualizing the grid
         * @type {Phaser.GameObjects.Graphics}
         * @private
         */
        this._debugGraphics = null;

        // Initialize debug graphics if in debug mode
        if (this._debug && GAME_CONFIG.SHOW_GRID) {
            this._debugGraphics = scene.add.graphics();
            this._drawDebugGrid();
        }
    }

    /**
     * Set the current map data
     * @param {Object} mapData - Map data object
     */
    setMap(mapData) {
        this._currentMap = mapData;
        this._collisionMap = {};

        // Set up collision map based on map data
        if (mapData && mapData.tilemap && mapData.tilemap.grid) {
            const collisionTiles = mapData.tilemap.collisions || [TILE_TYPES.WALL];

            for (let y = 0; y < mapData.height; y++) {
                for (let x = 0; x < mapData.width; x++) {
                    const tileType = mapData.tilemap.grid[y][x];

                    if (collisionTiles.includes(tileType)) {
                        this._setCollision(x, y, true);
                    }
                }
            }
        }

        // Redraw debug grid if in debug mode
        if (this._debug && GAME_CONFIG.SHOW_GRID) {
            this._drawDebugGrid();
        }

        if (this._debug) {
            console.log('GridMovement: Map set', mapData.id);
        }
    }

    /**
     * Add an entity to the grid
     * @param {Object} entity - Entity object with x, y properties
     */
    addEntity(entity) {
        const { x, y } = entity;
        const key = `${x},${y}`;

        if (!this._entityMap[key]) {
            this._entityMap[key] = entity;
        } else if (Array.isArray(this._entityMap[key])) {
            this._entityMap[key].push(entity);
        } else {
            // Convert to array if multiple entities on the same tile
            this._entityMap[key] = [this._entityMap[key], entity];
        }

        if (this._debug) {
            console.log(`GridMovement: Entity added at ${x},${y}`, entity);
        }
    }

    /**
     * Remove an entity from the grid
     * @param {Object} entity - Entity object with x, y properties
     */
    removeEntity(entity) {
        const { x, y } = entity;
        const key = `${x},${y}`;

        if (!this._entityMap[key]) {
            return;
        }

        if (Array.isArray(this._entityMap[key])) {
            const index = this._entityMap[key].indexOf(entity);

            if (index !== -1) {
                this._entityMap[key].splice(index, 1);

                if (this._entityMap[key].length === 1) {
                    // Convert back to single entity if only one remains
                    this._entityMap[key] = this._entityMap[key][0];
                } else if (this._entityMap[key].length === 0) {
                    // Remove key if no entities remain
                    delete this._entityMap[key];
                }
            }
        } else if (this._entityMap[key] === entity) {
            delete this._entityMap[key];
        }

        if (this._debug) {
            console.log(`GridMovement: Entity removed from ${x},${y}`, entity);
        }
    }

    /**
     * Update entity position on the grid
     * @param {Object} entity - Entity object
     * @param {number} newX - New X position
     * @param {number} newY - New Y position
     */
    updateEntityPosition(entity, newX, newY) {
        // Remove from old position
        this.removeEntity(entity);

        // Update entity position
        entity.x = newX;
        entity.y = newY;

        // Add to new position
        this.addEntity(entity);
    }

    /**
     * Check if a move is valid
     * @param {number} x - Starting X position
     * @param {number} y - Starting Y position
     * @param {Object} direction - Direction to move (from DIRECTIONS)
     * @returns {boolean} - True if move is valid, false otherwise
     */
    canMove(x, y, direction) {
        const newX = x + direction.x;
        const newY = y + direction.y;

        // Check map boundaries
        if (this._currentMap) {
            if (newX < 0 || newX >= this._currentMap.width ||
                newY < 0 || newY >= this._currentMap.height) {
                return false;
            }
        }

        // Check collision with map
        if (this._hasCollision(newX, newY)) {
            return false;
        }

        return true;
    }

    /**
     * Move an entity in a direction
     * @param {Object} entity - Entity object with x, y properties
     * @param {Object} direction - Direction to move (from DIRECTIONS)
     * @returns {boolean} - True if move was successful, false otherwise
     */
    moveEntity(entity, direction) {
        if (!entity || !direction) {
            return false;
        }

        const { x, y } = entity;

        // Check if move is valid
        if (!this.canMove(x, y, direction)) {
            return false;
        }

        const newX = x + direction.x;
        const newY = y + direction.y;

        // Update entity position on the grid
        this.updateEntityPosition(entity, newX, newY);

        // Move entity sprite to new position
        if (entity.sprite) {
            this._animateMove(entity, newX, newY);
        }

        // Trigger move event
        if (this._events) {
            this._events.emit(EVENTS.PLAYER_MOVE, entity, { x: newX, y: newY, prevX: x, prevY: y });
        }

        return true;
    }

    /**
     * Animate entity movement
     * @param {Object} entity - Entity object
     * @param {number} newX - New X position
     * @param {number} newY - New Y position
     * @private
     */
    _animateMove(entity, newX, newY) {
        // Calculate pixel position
        const pixelX = newX * this._tileSize + this._tileSize / 2;
        const pixelY = newY * this._tileSize + this._tileSize / 2;

        // Make sure we're targeting the correct object for tweening
        const target = entity.sprite;

        if (!target) {
            return;
        }

        // Tween to new position
        this._scene.tweens.add({
            targets: target,
            x: pixelX,
            y: pixelY,
            duration: 200,
            ease: 'Linear'
        });
    }

    /**
     * Get entities at a specific position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Object|Object[]|null} - Entity, array of entities, or null if none
     */
    getEntitiesAt(x, y) {
        const key = `${x},${y}`;
        return this._entityMap[key] || null;
    }

    /**
     * Get the tile type at a specific position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {number|null} - Tile type or null if out of bounds
     */
    getTileAt(x, y) {
        if (!this._currentMap || !this._currentMap.tilemap || !this._currentMap.tilemap.grid) {
            return null;
        }

        if (x < 0 || x >= this._currentMap.width || y < 0 || y >= this._currentMap.height) {
            return null;
        }

        return this._currentMap.tilemap.grid[y][x];
    }

    /**
     * Check if a position has collision
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {boolean} - True if position has collision, false otherwise
     * @private
     */
    _hasCollision(x, y) {
        return this._collisionMap[`${x},${y}`] === true;
    }

    /**
     * Set collision for a position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} hasCollision - Whether position has collision
     * @private
     */
    _setCollision(x, y, hasCollision) {
        this._collisionMap[`${x},${y}`] = hasCollision;
    }

    /**
     * Draw debug grid
     * @private
     */
    _drawDebugGrid() {
        if (!this._debugGraphics || !this._currentMap) {
            return;
        }

        this._debugGraphics.clear();

        const { width, height } = this._currentMap;

        // Draw grid lines
        this._debugGraphics.lineStyle(1, 0xffffff, 0.3);

        // Vertical lines
        for (let x = 0; x <= width; x++) {
            this._debugGraphics.beginPath();
            this._debugGraphics.moveTo(x * this._tileSize, 0);
            this._debugGraphics.lineTo(x * this._tileSize, height * this._tileSize);
            this._debugGraphics.closePath();
            this._debugGraphics.strokePath();
        }

        // Horizontal lines
        for (let y = 0; y <= height; y++) {
            this._debugGraphics.beginPath();
            this._debugGraphics.moveTo(0, y * this._tileSize);
            this._debugGraphics.lineTo(width * this._tileSize, y * this._tileSize);
            this._debugGraphics.closePath();
            this._debugGraphics.strokePath();
        }

        // Draw collision tiles
        this._debugGraphics.fillStyle(0xff0000, 0.3);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (this._hasCollision(x, y)) {
                    this._debugGraphics.fillRect(
                        x * this._tileSize,
                        y * this._tileSize,
                        this._tileSize,
                        this._tileSize
                    );
                }
            }
        }
    }

    /**
     * Check if a position is an encounter zone
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {boolean} - True if position is an encounter zone
     */
    isEncounterZone(x, y) {
        const tileType = this.getTileAt(x, y);

        if (!tileType) {
            return false;
        }

        // Check if tile type is in encounter zones
        if (this._currentMap && this._currentMap.tilemap && this._currentMap.tilemap.encounters) {
            return this._currentMap.tilemap.encounters.includes(tileType);
        }

        // Default: grass tiles are encounter zones
        return tileType === TILE_TYPES.GRASS;
    }

    /**
     * Check for random encounter
     * @returns {boolean} - True if encounter triggered
     */
    checkEncounter() {
        // Skip if not in encounter zone
        if (!this._currentMap || !this._currentMap.encounters) {
            return false;
        }

        // Random check based on encounter rate
        return Math.random() < GAME_CONFIG.ENCOUNTER_RATE;
    }
}