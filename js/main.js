/**
 * Main Game Configuration and Initialization
 * Sets up the Phaser game instance and scene configuration
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize game configuration
    const config = {
        type: Phaser.AUTO,
        width: GAME_CONFIG.WIDTH,
        height: GAME_CONFIG.HEIGHT,
        parent: 'game-container',
        backgroundColor: '#000000',
        pixelArt: true,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: GAME_CONFIG.DEBUG
            }
        },
        scene: [
            BootScene,
            PreloadScene,
            WorldScene,
            BattleScene,
            MenuScene,
            DialogScene
        ]
    };

    // Create the game instance
    const game = new Phaser.Game(config);

    // Add game instance to window for debug purposes if in debug mode
    if (GAME_CONFIG.DEBUG) {
        window.game = game;
    }

    /**
     * Global game state accessible to all scenes
     * Used to share data between scenes
     */
    game.registry.set('playerData', {
        name: 'Player',
        position: { x: 5, y: 5, map: 'hometown' },
        party: [],
        inventory: [],
        progress: {
            badges: 0,
            quests: {}
        }
    });

    /**
     * Event system initialization
     * Creates a global event emitter for cross-scene communication
     */
    game.events.once('boot', function() {
        game.registry.set('eventSystem', new EventSystem(game));
        console.log('MonsterQuest started - Game initialized');
    });
});