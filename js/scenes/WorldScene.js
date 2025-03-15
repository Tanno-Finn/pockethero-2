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

        // NPC movement timers
        this.npcMovementTimers = {};
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
        // Create a background rectangle for sky
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
            // Create empty decorations container to prevent errors
            this.decorations = this.add.container(0, 0);
            this.mapContainer.add(this.decorations);
            return;
        }

        const { grid } = this.currentMap.tilemap;
        const tileSize = GAME_CONFIG.TILE_SIZE;

        // Create graphics object for tiles
        const tiles = this.add.graphics();
        this.mapContainer.add(tiles);

        // Create decorative elements container
        this.decorations = this.add.container(0, 0);
        this.mapContainer.add(this.decorations);

        // Draw each tile
        for (let y = 0; y < this.currentMap.height; y++) {
            for (let x = 0; x < this.currentMap.width; x++) {
                // ... rest of the method
            }
        }
    }

    /**
     * Add decorative elements to tiles based on their type
     * @param {number} x - Tile X position
     * @param {number} y - Tile Y position
     * @param {number} tileType - Type of tile
     * @private
     */
    addTileDecoration(x, y, tileType) {
        const tileSize = GAME_CONFIG.TILE_SIZE;
        const centerX = x * tileSize + tileSize / 2;
        const centerY = y * tileSize + tileSize / 2;

        switch (tileType) {
            case TILE_TYPES.GRASS:
                // Add grass tufts
                if (Math.random() > 0.7) {
                    const grassTuft = this.add.graphics();
                    grassTuft.fillStyle(0x1a8c1a);

                    // Draw 3-5 small grass blades
                    const bladeCount = 3 + Math.floor(Math.random() * 3);
                    for (let i = 0; i < bladeCount; i++) {
                        const bladeX = centerX - 5 + Math.random() * 10;
                        const height = 4 + Math.random() * 4;
                        grassTuft.fillRect(bladeX, centerY - height/2, 1, height);
                    }

                    this.decorations.add(grassTuft);
                }
                break;

            case TILE_TYPES.WATER:
                // Add water ripple
                const ripple = this.add.circle(
                    centerX + (Math.random() * tileSize/2 - tileSize/4),
                    centerY + (Math.random() * tileSize/2 - tileSize/4),
                    1 + Math.random() * 2,
                    0xffffff,
                    0.3
                );
                this.decorations.add(ripple);

                // Animate ripple
                this.tweens.add({
                    targets: ripple,
                    radius: 4,
                    alpha: 0,
                    duration: 2000 + Math.random() * 1000,
                    repeat: -1,
                    repeatDelay: 1000 + Math.random() * 2000
                });
                break;

            case TILE_TYPES.WALL:
                // Add some texture/shading to walls
                const wallShading = this.add.graphics();
                wallShading.fillStyle(0x000000, 0.2);

                // Add random shading patterns
                if (Math.random() > 0.5) {
                    wallShading.fillRect(
                        x * tileSize + tileSize * 0.2,
                        y * tileSize + tileSize * 0.2,
                        tileSize * 0.3,
                        tileSize * 0.3
                    );
                } else {
                    wallShading.fillRect(
                        x * tileSize + tileSize * 0.5,
                        y * tileSize + tileSize * 0.5,
                        tileSize * 0.4,
                        tileSize * 0.4
                    );
                }

                this.decorations.add(wallShading);
                break;

            case TILE_TYPES.DOOR:
                // Add door knob
                const doorknob = this.add.circle(
                    x * tileSize + tileSize * 0.8,
                    y * tileSize + tileSize * 0.5,
                    2,
                    0xffcc00
                );
                this.decorations.add(doorknob);

                // Add door frame
                const doorFrame = this.add.graphics();
                doorFrame.lineStyle(1, 0x000000, 0.5);
                doorFrame.strokeRect(
                    x * tileSize + 2,
                    y * tileSize + 2,
                    tileSize - 4,
                    tileSize - 4
                );
                this.decorations.add(doorFrame);
                break;
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

        // Add an outline to make player more visible
        const playerOutline = this.add.circle(
            x * tileSize + tileSize / 2,
            y * tileSize + tileSize / 2,
            tileSize / 3 + 1,
            0x000000
        );
        playerOutline.setDepth(-1);

        // Add a simple face to the player
        const face = this.add.container(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2);

        // Eyes
        const leftEye = this.add.circle(-4, -2, 2, 0x000000);
        const rightEye = this.add.circle(4, -2, 2, 0x000000);

        // Smile
        const smile = this.add.arc(0, 4, 5, 190, 350, false, 0x000000, 1);

        face.add([leftEye, rightEye, smile]);
        face.setDepth(1);

        // Add player entity
        this.entities.player = {
            x,
            y,
            sprite: playerSprite,
            face: face,
            outline: playerOutline,
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
            // Determine NPC color based on type
            let npcColor = COLORS.NPC;
            switch (npcData.type) {
                case 'professor':
                    npcColor = 0x6495ED; // Cornflower blue
                    break;
                case 'mom':
                    npcColor = 0xFFB6C1; // Light pink
                    break;
                case 'neighbor':
                    npcColor = 0x98FB98; // Pale green
                    break;
                default:
                    npcColor = COLORS.NPC;
            }

            // Create NPC container
            const npcContainer = this.add.container(
                npcData.x * tileSize + tileSize / 2,
                npcData.y * tileSize + tileSize / 2
            );

            // Create NPC sprite body
            const npcSprite = this.add.rectangle(
                0, 0,
                tileSize * 0.8,
                tileSize * 0.8,
                npcColor
            );

            // Add an outline to make NPC more visible
            const npcOutline = this.add.rectangle(
                0, 0,
                tileSize * 0.8 + 2,
                tileSize * 0.8 + 2,
                0x000000
            );
            npcOutline.setDepth(-1);

            // Add visual details based on NPC type
            let npcDetails;
            switch (npcData.type) {
                case 'professor':
                    // Glasses and white coat
                    npcDetails = this.add.graphics();
                    npcDetails.lineStyle(1, 0x000000);
                    // Glasses
                    npcDetails.strokeCircle(-5, -5, 4);
                    npcDetails.strokeCircle(5, -5, 4);
                    // Lab coat
                    npcDetails.fillStyle(0xFFFFFF, 0.5);
                    npcDetails.fillRect(-10, 0, 20, 10);
                    break;

                case 'mom':
                    // Hair and apron
                    npcDetails = this.add.graphics();
                    // Hair
                    npcDetails.fillStyle(0x8B4513);
                    npcDetails.fillRect(-10, -15, 20, 10);
                    // Apron
                    npcDetails.fillStyle(0xFFFFFF, 0.5);
                    npcDetails.fillRect(-10, 0, 20, 5);
                    break;

                case 'neighbor':
                    // Hat and shovel
                    npcDetails = this.add.graphics();
                    // Hat
                    npcDetails.fillStyle(0x8B4513);
                    npcDetails.fillRect(-10, -15, 20, 5);
                    // Shovel
                    npcDetails.lineStyle(2, 0x8B4513);
                    npcDetails.lineBetween(10, -5, 15, 5);
                    break;

                default:
                    // Default simple face
                    npcDetails = this.add.graphics();
                    npcDetails.fillStyle(0x000000);
                    npcDetails.fillCircle(-5, -5, 2); // Left eye
                    npcDetails.fillCircle(5, -5, 2); // Right eye
                    npcDetails.lineStyle(1, 0x000000);
                    npcDetails.strokeCircle(0, 5, 3); // Mouth
            }

            // Add all elements to container
            npcContainer.add([npcOutline, npcSprite, npcDetails]);

            // Create NPC entity
            const npc = {
                id: npcData.id,
                x: npcData.x,
                y: npcData.y,
                type: ENTITY_TYPES.NPC,
                npcType: npcData.type,
                dialog: npcData.dialog,
                sprite: npcContainer,
                movement: npcData.movement || 'static',
                movementDirection: {x: 0, y: 0},
                movementTimer: null,
                patrolPoints: []
            };

            // Setup patrol points if movement type is patrol
            if (npc.movement === 'patrol') {
                // Create simple patrol route around starting position
                npc.patrolPoints = [
                    {x: npc.x, y: npc.y},
                    {x: npc.x + 2, y: npc.y},
                    {x: npc.x + 2, y: npc.y + 2},
                    {x: npc.x, y: npc.y + 2}
                ];
                npc.patrolIndex = 0;
            }

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

        // Make NPC face the player
        this.faceEntityTowardsPlayer(npc);

        // Start dialog scene
        this.scene.launch(SCENES.DIALOG, {
            dialogId: npc.dialog,
            npcId: npc.id
        });

        // Listen for dialog end
        this.eventSystem.once(EVENTS.DIALOG_END, this.handleDialogEnd, this);
    }

    /**
     * Make an entity face towards the player
     * @param {Object} entity - Entity to rotate
     * @private
     */
    faceEntityTowardsPlayer(entity) {
        const player = this.entities.player;

        // Calculate direction from entity to player
        const dx = player.x - entity.x;
        const dy = player.y - entity.y;

        // Temporary visual feedback
        if (entity.sprite && entity.sprite.setAlpha) {
            // Flash the NPC briefly
            this.tweens.add({
                targets: entity.sprite,
                alpha: 0.7,
                duration: 100,
                yoyo: true,
            });
        }
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

            // Move player face and outline with the sprite
            if (player.face) {
                player.face.x = player.sprite.x;
                player.face.y = player.sprite.y;
            }

            if (player.outline) {
                player.outline.x = player.sprite.x;
                player.outline.y = player.sprite.y;
            }

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

        // Add slight animation to grass/water tiles
        this.animateTerrainElements(time);
    }

    /**
     * Animate terrain elements like grass and water
     * @param {number} time - Current time
     * @private
     */
    animateTerrainElements(time) {
        // Check if decorations exist before accessing list property
        if (!this.decorations || !this.decorations.list) {
            return;
        }

        // Simple pulsing effect for grass and water elements
        this.decorations.list.forEach(decoration => {
            if (decoration.type === 'grass' || decoration.type === 'water') {
                decoration.alpha = 0.7 + Math.sin(time / 500) * 0.3;
            }
        });
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

            // Handle NPC movement based on type
            if (npc.movement === 'random') {
                this.updateRandomMovingNPC(npc, delta);
            } else if (npc.movement === 'patrol') {
                this.updatePatrollingNPC(npc, delta);
            }
        });
    }

    /**
     * Update a randomly moving NPC
     * @param {Object} npc - NPC entity
     * @param {number} delta - Time elapsed since last update
     * @private
     */
    updateRandomMovingNPC(npc, delta) {
        // Check if NPC has a movement timer
        if (!this.npcMovementTimers[npc.id]) {
            // Create new timer (2-5 seconds)
            this.npcMovementTimers[npc.id] = this.time.addEvent({
                delay: 2000 + Math.random() * 3000,
                callback: () => {
                    // Choose random direction
                    const directions = [
                        DIRECTIONS.UP,
                        DIRECTIONS.DOWN,
                        DIRECTIONS.LEFT,
                        DIRECTIONS.RIGHT,
                        {x: 0, y: 0} // Stay still
                    ];

                    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
                    npc.movementDirection = randomDirection;

                    // Try to move in that direction
                    if (randomDirection.x !== 0 || randomDirection.y !== 0) {
                        this.moveNPC(npc, randomDirection);
                    }
                },
                loop: true
            });
        }
    }

    /**
     * Update a patrolling NPC
     * @param {Object} npc - NPC entity
     * @param {number} delta - Time elapsed since last update
     * @private
     */
    updatePatrollingNPC(npc, delta) {
        // Skip if no patrol points
        if (!npc.patrolPoints || npc.patrolPoints.length === 0) {
            return;
        }

        // Check if NPC has a movement timer
        if (!this.npcMovementTimers[npc.id]) {
            // Create new timer (1.5 seconds per move)
            this.npcMovementTimers[npc.id] = this.time.addEvent({
                delay: 1500,
                callback: () => {
                    // Get current patrol point
                    const targetPoint = npc.patrolPoints[npc.patrolIndex];

                    // Calculate direction to move
                    if (npc.x < targetPoint.x) {
                        this.moveNPC(npc, DIRECTIONS.RIGHT);
                    } else if (npc.x > targetPoint.x) {
                        this.moveNPC(npc, DIRECTIONS.LEFT);
                    } else if (npc.y < targetPoint.y) {
                        this.moveNPC(npc, DIRECTIONS.DOWN);
                    } else if (npc.y > targetPoint.y) {
                        this.moveNPC(npc, DIRECTIONS.UP);
                    } else {
                        // Reached point, go to next one
                        npc.patrolIndex = (npc.patrolIndex + 1) % npc.patrolPoints.length;
                    }
                },
                loop: true
            });
        }
    }

    /**
     * Move an NPC in a direction
     * @param {Object} npc - NPC entity
     * @param {Object} direction - Direction to move
     * @returns {boolean} Whether the move was successful
     * @private
     */
    moveNPC(npc, direction) {
        // Try to move using grid movement system
        return this.gridMovement.moveEntity(npc, direction);
    }

    /**
     * Cleanup when scene is shutdown
     * @private
     */
    shutdown() {
        // Remove event listeners
        this.events.off('shutdown', this.shutdown, this);
        this.menuKey.off('down', this.openMenu);

        // Clear NPC movement timers
        Object.values(this.npcMovementTimers).forEach(timer => {
            if (timer) {
                timer.remove();
            }
        });
        this.npcMovementTimers = {};

        if (this.eventSystem) {
            this.eventSystem.off(EVENTS.DIALOG_END, this.handleDialogEnd);
            this.eventSystem.off(EVENTS.BATTLE_END, this.handleBattleEnd);
        }
    }
}