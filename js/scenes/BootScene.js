/**
 * BootScene
 * Initial scene for game setup and minimal asset loading
 * Handles basic initialization before main asset loading
 *
 * @extends Phaser.Scene
 */
class BootScene extends Phaser.Scene {
    /**
     * Create the Boot Scene
     */
    constructor() {
        super({
            key: SCENES.BOOT
        });
    }

    /**
     * Initialize the scene
     * @param {Object} data - Data passed from previous scene
     */
    init(data) {
        // Setup scene variables
        this.debug = GAME_CONFIG.DEBUG;

        if (this.debug) {
            console.log('BootScene: Initializing');
        }
    }

    /**
     * Preload essential assets needed for loading screen
     */
    preload() {
        // Create loading text
        const loadingText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'Loading...',
            {
                font: '20px Arial',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

        // Preload minimal data required for preload scene
        // In a real project, we would load a loading bar image here
        // Since we're using shapes only, we'll just use text
    }

    /**
     * Create game objects and setup scene
     */
    create() {
        if (this.debug) {
            console.log('BootScene: Setup complete');
        }

        // Initialize game settings
        this.initGameSettings();

        // Start the preload scene
        this.scene.start(SCENES.PRELOAD);
    }

    /**
     * Initialize game settings
     * @private
     */
    initGameSettings() {
        // Set up game scale
        this.scale.setGameSize(GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT);

        // Set up input
        this.input.keyboard.createCursorKeys();

        // Add event listeners
        this.events.on('shutdown', this.shutdown, this);

        if (this.debug) {
            console.log('BootScene: Game settings initialized');
        }
    }

    /**
     * Cleanup when scene is shutdown
     * @private
     */
    shutdown() {
        // Remove event listeners
        this.events.off('shutdown', this.shutdown, this);
    }
}