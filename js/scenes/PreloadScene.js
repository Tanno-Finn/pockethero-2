/**
 * PreloadScene
 * Handles loading of all game assets with loading progress bar
 * Transitions to MenuScene when loading completes
 *
 * @extends Phaser.Scene
 */
class PreloadScene extends Phaser.Scene {
    /**
     * Create the Preload Scene
     */
    constructor() {
        super({
            key: SCENES.PRELOAD
        });
    }

    /**
     * Initialize the scene
     * @param {Object} data - Data passed from previous scene
     */
    init(data) {
        this.debug = GAME_CONFIG.DEBUG;

        if (this.debug) {
            console.log('PreloadScene: Initializing');
        }
    }

    /**
     * Preload all game assets
     */
    preload() {
        // Create loading progress indicators
        this.createLoadingUI();

        // Initialize DataManager for loading data files
        this.initDataManager();

        // Initialize event emitters
        this.initEvents();
    }

    /**
     * Create loading progress UI
     * @private
     */
    createLoadingUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create a loading background
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000);

        // Create a progress bar background
        const progressBarBg = this.add.rectangle(
            width / 2,
            height / 2,
            width * 0.8,
            30,
            0x666666
        );

        // Create progress bar
        const progressBar = this.add.rectangle(
            progressBarBg.x - progressBarBg.width / 2,
            progressBarBg.y,
            0,
            20,
            0x3498db
        ).setOrigin(0, 0.5);

        // Create loading text
        const loadingText = this.add.text(
            width / 2,
            height / 2 - 50,
            'Loading...',
            {
                font: '24px Arial',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

        // Create progress text
        const progressText = this.add.text(
            width / 2,
            height / 2 + 50,
            '0%',
            {
                font: '18px Arial',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

        // Add loading progress listeners
        this.load.on('progress', (value) => {
            // Update progress bar width
            progressBar.width = progressBarBg.width * value;

            // Update progress text
            progressText.setText(`${Math.floor(value * 100)}%`);
        });

        this.load.on('complete', () => {
            // Update loading text
            loadingText.setText('Loading Complete!');

            // Wait a moment before continuing
            this.time.delayedCall(1000, () => {
                // Store UI elements for cleanup
                this.loadingUI = {
                    progressBar,
                    progressBarBg,
                    loadingText,
                    progressText
                };
            });
        });
    }

    /**
     * Initialize the DataManager
     * @private
     */
    initDataManager() {
        // Initialize DataManager with this scene for loading
        dataManager.init(this).then(() => {
            if (this.debug) {
                console.log('PreloadScene: DataManager initialized');
            }

            // Continue to create method when loading is complete
            this.finishLoading();
        }).catch(error => {
            console.error('PreloadScene: DataManager initialization failed', error);

            // Show error message
            this.showError('Failed to load game data');
        });
    }

    /**
     * Initialize event emitters
     * @private
     */
    initEvents() {
        // Register event listeners
        this.events.on('shutdown', this.shutdown, this);
    }

    /**
     * Create game objects and setup scene
     */
    create() {
        if (this.debug) {
            console.log('PreloadScene: Setup complete');
        }

        // Note: Most of the loading is done in the preload method
        // This is just a placeholder for any additional setup
    }

    /**
     * Finish loading and transition to the next scene
     * @private
     */
    finishLoading() {
        if (this.debug) {
            console.log('PreloadScene: Loading complete');
        }

        // Clean up loading UI
        if (this.loadingUI) {
            Object.values(this.loadingUI).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
        }

        // Start the menu scene
        this.scene.start(SCENES.MENU);
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     * @private
     */
    showError(message) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create error background
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000);

        // Create error message
        this.add.text(
            width / 2,
            height / 2,
            `Error: ${message}`,
            {
                font: '24px Arial',
                fill: '#ff0000',
                align: 'center',
                wordWrap: { width: width * 0.8 }
            }
        ).setOrigin(0.5);

        // Create retry button
        const retryButton = this.add.rectangle(
            width / 2,
            height / 2 + 80,
            200,
            50,
            0x3498db
        ).setInteractive();

        // Add retry button text
        this.add.text(
            width / 2,
            height / 2 + 80,
            'Retry',
            {
                font: '20px Arial',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);

        // Add retry button event
        retryButton.on('pointerdown', () => {
            // Restart scene
            this.scene.restart();
        });
    }

    /**
     * Cleanup when scene is shutdown
     * @private
     */
    shutdown() {
        // Remove event listeners
        this.events.off('shutdown', this.shutdown, this);
        this.load.off('progress');
        this.load.off('complete');
    }
}