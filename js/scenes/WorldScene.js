/**
 * WorldScene
 * Main gameplay scene for exploration and world interaction
 * Handles map rendering, player movement, and NPC interactions
 *
 * @extends Phaser.Scene
 */
class WorldScene extends Phaser.Scene {
    /**
     * Create the World Scene
     */
    constructor() {
        super({
            key: SCENES.WORLD
        });
    }

    /**
     * Initialize the scene
     * @param {Object} data - Data passed from previous scene
     */
    init(data) {
        this.debug = GAME_CONFIG.DEBUG;

        if (this.debug) {
            console.log('WorldScene: Initializing');
        }

        // Get event system
        this.eventSystem = this.game.registry.get('eventSystem');

        // Player data from registry
        this.playerData = this.game.registry.get('playerData');

        // Setup scene properties
        this.entities = {
            player: null,
            npcs: []
        };

        // Input handling properties
        this.inputEnabled = true;
        this.inputCooldown = false;
        this.inputCooldownTime = 200; // ms

        // Movement properties
        this.movementDirection = null;

        // Current map
        this.currentMapId = data && data.mapId ? data.mapId : this.playerData.position.map;
    }

    /**
     * Preload assets for world scene
     */
    preload() {
        // No specific preloading needed as assets are loaded in PreloadScene
    }

    /**
     * Create game objects and setup scene
     */
    create() {
        // Create camera
        this.setupCamera();

        // Create grid movement system
        this.gridMovement = new GridMovement(this);

        // Load map
        this.loadMap(this.currentMapId);

        // Create player
        this.createPlayer();

        // Create NPCs
        this.createNPCs();

        // Set up input
        this.setupInput();

        // Register event listeners
        this.events.on('shutdown', this.shutdown, this);

        if (this.debug) {
            console.log('WorldScene: Setup complete');
        }
    }

    /**
     * Set up camera
     * @private
     */
    setupCamera() {
        const camera = this.cameras.main;

        // Set camera bounds
        camera.setBounds(0, 0, GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);

        // Set up camera fade effect for transitions
        camera.fadeIn(1000);
    }

    /**
     * Load map data and create map
     * @param {string} mapId - ID of map to load
     * @private
     */
    loadMap(mapId) {
        // Get map data from data manager
        const mapData = dataManager.get('maps', mapId);

        if (!mapData) {
            console.error(`Map not found: ${mapId}`);
            return;
        }

        if (this.debug) {
            console.log(`WorldScene: Loading map ${mapId}`, mapData);
        }

        // Store current map data
        this.currentMap = mapData;
        this.currentMapId = mapId;

        // Create map container
        this.mapContainer = this.add.container(0, 0);

        // Set camera bounds based on map size
        this.cameras.main.setBounds(
            0,
            0,
            mapData.width * GAME_CONFIG.TILE_SIZE,
            mapData.height * GAME_CONFIG.TILE_SIZE
        );

        // Create map background
        this.createMapBackground();

        // Create map tiles
        this.createMapTiles();

        // Update grid movement system with map data
        this.gridMovement.setMap(mapData);
    }

    /**
     * Create map background
     * @private
     */
    createMapBackground() {
        // Create a background rectangle
        const background = this.add.rectangle(
            0,
            0,
            this.currentMap.width * GAME_CONFIG.TILE_SIZE,
            this.currentMap.height * GAME_CONFIG.TILE_SIZE,
            0x87CEEB // Sky blue
        ).setOrigin(0);

        this.mapContainer.add(background);
    }

    /**
     * Create map tiles based on tilemap data
     * @private
     */
    createMapTiles() {
        if (!this.currentMap || !this.currentMap.tilemap || !this.currentMap.tilemap.grid) {
            console.error('Invalid map data, missing tilemap or grid');
            return;
        }

        const { grid } = this.currentMap.tilemap;
        const tileSize = GAME_CONFIG.TILE_SIZE;

        // Create graphics object for tiles
        const tiles = this.add.graphics();
        this.mapContainer.add(tiles);

        // Draw each tile
        for (let y = 0; y < this.currentMap.height; y++) {
            for (let x = 0; x < this.currentMap.width; x++) {
                // Get tile type
                const tileType = grid[y][x];

                // Get tile color based on type
                let tileColor;
                switch (tileType) {
                    case TILE_TYPES.FLOOR:
                        tileColor = COLORS.TILE.FLOOR;
                        break;
                    case TILE_TYPES.WALL:
                        tileColor = COLORS.TILE.WALL;
                        break;
                    case TILE_TYPES.GRASS:
                        tileColor = COLORS.TILE.GRASS;
                        break;
                    case TILE_TYPES.WATER:
                        tileColor = COLORS.TILE.WATER;
                        break;
                    case TILE_TYPES.DOOR:
                        tileColor = COLORS.TILE.DOOR;
                        break;
                    default:
                        tileColor = COLORS.TILE.FLOOR;
                }

                // Draw tile
                tiles.fillStyle(tileColor);
                tiles.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

                // Draw tile border
                tiles.lineStyle(1, 0x000000, 0.3);
                tiles.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }

    /**
     * Create the player character
     * @private
     */
    createPlayer() {
        // Get player position from data
        const { x, y } = this.playerData.position;
        const tileSize = GAME_CONFIG.TILE_SIZE;

        // Create player sprite as a blue circle
        const playerSprite = this.add.circle(
            x * tileSize + tileSize / 2,
            y * tileSize + tileSize / 2,
            tileSize / 3,
            COLORS.PLAYER
        );

        // Add player entity
        this.entities.player = {
            x,
            y,
            sprite: playerSprite,
            type: ENTITY_TYPES.PLAYER
        };

        // Add player to grid movement system
        this.gridMovement.addEntity(this.entities.player);

        // Make camera follow player
        this.cameras.main.startFollow(playerSprite, true);

        if (this.debug) {
            console.log('WorldScene: Player created at', x, y);
        }
    }

    /**
     * Create NPCs based on map data
     * @private
     */
    createNPCs() {
        if (!this.currentMap || !this.currentMap.npcs) {
            return;
        }

        const tileSize = GAME_CONFIG.TILE_SIZE;

        // Create each NPC from map data
        this.currentMap.npcs.forEach(npcData => {
            // Create NPC sprite as a red square
            const npcSprite = this.add.rectangle(
                npcData.x * tileSize + tileSize / 2,
                npcData.y * tileSize + tileSize / 2,
                tileSize * 0.8,
                tileSize * 0.8,
                COLORS.NPC
            );

            // Create NPC entity
            const npc = {
                id: npcData.id,
                x: npcData.x,
                y: npcData.y,
                type: ENTITY_TYPES.NPC,
                npcType: npcData.type,
                dialog: npcData.dialog,
                sprite: npcSprite,
                movement: npcData.movement || 'static'
            };

            // Add NPC to entities
            this.entities.npcs.push(npc);

            // Add NPC to grid movement system
            this.gridMovement.addEntity(npc);

            if (this.debug) {
                console.log(`WorldScene: NPC created at ${npc.x},${npc.y}`, npc);
            }
        });
    }

    /**
     * Set up input handling
     * @private
     */
    setupInput() {
        // Create cursor keys
        this.cursors = this.input.keyboard.createCursorKeys();

        // Create interaction key (space)
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Create menu key (ESC)
        this.menuKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // Add keyboard events
        this.menuKey.on('down', this.openMenu, this);
    }

    /**
     * Open the game menu
     * @private
     */
    openMenu() {
        if (!this.inputEnabled) {
            return;
        }

        if (this.debug) {
            console.log('WorldScene: Opening menu');
        }

        // Emit menu open event
        if (this.eventSystem) {
            this.eventSystem.emit(EVENTS.MENU_OPEN);
        }

        // Pause this scene and start menu scene
        this.scene.pause();
        this.scene.launch(SCENES.MENU);
    }

    /**
     * Handle player interaction with entities
     * @private
     */
    handleInteraction() {
        if (!this.inputEnabled) {
            return;
        }

        const player = this.entities.player;

        // Check all four directions
        const directions = [
            DIRECTIONS.UP,
            DIRECTIONS.DOWN,
            DIRECTIONS.LEFT,
            DIRECTIONS.RIGHT
        ];

        // Check for entities in adjacent tiles
        for (const direction of directions) {
            const checkX = player.x + direction.x;
            const checkY = player.y + direction.y;

            // Get entities at position
            const entities = this.gridMovement.getEntitiesAt(checkX, checkY);

            if (entities) {
                // Get all entities as array
                const entityArray = Array.isArray(entities) ? entities : [entities];

                // Check each entity
                for (const entity of entityArray) {
                    if (entity.type === ENTITY_TYPES.NPC) {
                        // Interact with NPC
                        this.interactWithNPC(entity);
                        return;
                    }
                }
            }
        }

        // No entity found to interact with
        if (this.debug) {
            console.log('WorldScene: No entity to interact with');
        }
    }

    /**
     * Interact with an NPC
     * @param {Object} npc - NPC entity to interact with
     * @private
     */
    interactWithNPC(npc) {
        if (this.debug) {
            console.log('WorldScene: Interacting with NPC', npc);
        }

        // Disable input during interaction
        this.inputEnabled = false;

        // Start dialog scene
        this.scene.launch(SCENES.DIALOG, {
            dialogId: npc.dialog,
            npcId: npc.id
        });

        // Listen for dialog end
        this.eventSystem.once(EVENTS.DIALOG_END, this.handleDialogEnd, this);
    }

    /**
     * Handle dialog end
     * @private
     */
    handleDialogEnd() {
        // Re-enable input
        this.inputEnabled = true;
    }

    /**
     * Move player in a direction
     * @param {Object} direction - Direction to move (from DIRECTIONS)
     * @returns {boolean} - True if move was successful
     * @private
     */
    movePlayer(direction) {
        // Skip if input is not enabled
        if (!this.inputEnabled || this.inputCooldown) {
            return false;
        }

        const player = this.entities.player;

        // Attempt to move player
        const moved = this.gridMovement.moveEntity(player, direction);

        if (moved) {
            // Update player data
            this.playerData.position.x = player.x;
            this.playerData.position.y = player.y;

            // Set input cooldown
            this.inputCooldown = true;
            this.time.delayedCall(this.inputCooldownTime, () => {
                this.inputCooldown = false;
            });

            // Check for random encounter if in encounter zone
            if (this.gridMovement.isEncounterZone(player.x, player.y)) {
                this.checkRandomEncounter();
            }
        }

        return moved;
    }

    /**
     * Check for random encounter
     * @private
     */
    checkRandomEncounter() {
        // Skip if not in encounter zone
        if (!this.gridMovement.isEncounterZone(
            this.entities.player.x,
            this.entities.player.y
        )) {
            return;
        }

        // Check for encounter
        if (this.gridMovement.checkEncounter()) {
            // Trigger battle
            this.startBattle();
        }
    }

    /**
     * Start a battle
     * @private
     */
    startBattle() {
        if (this.debug) {
            console.log('WorldScene: Starting battle');
        }

        // Disable input
        this.inputEnabled = false;

        // Fade out camera
        this.cameras.main.fadeOut(500);

        // Wait for fade out
        this.cameras.main.once('camerafadeoutcomplete', () => {
            // Emit battle start event
            if (this.eventSystem) {
                this.eventSystem.emit(EVENTS.BATTLE_START);
            }

            // Start battle scene
            this.scene.pause();
            this.scene.launch(SCENES.BATTLE, {
                location: this.currentMapId,
                playerPosition: {
                    x: this.entities.player.x,
                    y: this.entities.player.y
                }
            });

            // Listen for battle end
            this.eventSystem.once(EVENTS.BATTLE_END, this.handleBattleEnd, this);
        });
    }

    /**
     * Handle battle end
     * @param {Object} result - Battle result data
     * @private
     */
    handleBattleEnd(result) {
        // Resume scene
        this.scene.resume();

        // Fade in camera
        this.cameras.main.fadeIn(500);

        // Re-enable input after fade in
        this.cameras.main.once('camerafadeincomplete', () => {
            this.inputEnabled = true;
        });

        if (this.debug) {
            console.log('WorldScene: Battle ended', result);
        }
    }

    /**
     * Update loop called every frame
     * @param {number} time - Current time
     * @param {number} delta - Time elapsed since last update
     */
    update(time, delta) {
        // Handle player input
        this.handleInput();

        // Update NPCs
        this.updateNPCs(delta);
    }

    /**
     * Handle player input
     * @private
     */
    handleInput() {
        // Skip if input is not enabled
        if (!this.inputEnabled) {
            return;
        }

        // Handle movement input
        if (this.cursors.up.isDown) {
            this.movePlayer(DIRECTIONS.UP);
        } else if (this.cursors.down.isDown) {
            this.movePlayer(DIRECTIONS.DOWN);
        } else if (this.cursors.left.isDown) {
            this.movePlayer(DIRECTIONS.LEFT);
        } else if (this.cursors.right.isDown) {
            this.movePlayer(DIRECTIONS.RIGHT);
        }

        // Handle interaction input
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            this.handleInteraction();
        }
    }

    /**
     * Update NPCs
     * @param {number} delta - Time elapsed since last update
     * @private
     */
    updateNPCs(delta) {
        // Update each NPC
        this.entities.npcs.forEach(npc => {
            if (npc.movement === 'static') {
                // Static NPCs don't move
                return;
            }

            // Simple NPC movement logic based on movement type
            // Will be expanded in future implementations
        });
    }

    /**
     * Cleanup when scene is shutdown
     * @private
     */
    shutdown() {
        // Remove event listeners
        this.events.off('shutdown', this.shutdown, this);
        this.menuKey.off('down', this.openMenu);

        if (this.eventSystem) {
            this.eventSystem.off(EVENTS.DIALOG_END, this.handleDialogEnd);
            this.eventSystem.off(EVENTS.BATTLE_END, this.handleBattleEnd);
        }
    }
}