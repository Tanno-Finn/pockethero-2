/**
 * MenuScene
 * Main menu interface for the game
 * Provides options to start game, view options, etc.
 *
 * @extends Phaser.Scene
 */
class MenuScene extends Phaser.Scene {
    /**
     * Create the Menu Scene
     */
    constructor() {
        super({
            key: SCENES.MENU
        });
    }

    /**
     * Initialize the scene
     * @param {Object} data - Data passed from previous scene
     */
    init(data) {
        this.debug = GAME_CONFIG.DEBUG;

        if (this.debug) {
            console.log('MenuScene: Initializing');
        }

        // Get event system
        this.eventSystem = this.game.registry.get('eventSystem');
    }

    /**
     * Create game objects and setup scene
     */
    create() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create background
        this.add.rectangle(width / 2, height / 2, width, height, COLORS.UI.BACKGROUND);

        // Create title
        this.add.text(
            width / 2,
            height * 0.2,
            'MonsterQuest',
            {
                font: '48px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5);

        // Create menu options
        this.createMenuOptions();

        // Setup input
        this.setupInput();

        // Register event listeners
        this.events.on('shutdown', this.shutdown, this);

        if (this.debug) {
            console.log('MenuScene: Setup complete');
        }
    }

    /**
     * Create menu options
     * @private
     */
    createMenuOptions() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Menu options
        const options = [
            { text: 'New Game', action: this.startNewGame.bind(this) },
            { text: 'Continue', action: this.continueGame.bind(this) },
            { text: 'Options', action: this.openOptions.bind(this) }
        ];

        // Create menu option buttons
        this.menuOptions = options.map((option, index) => {
            // Create button background
            const button = this.add.rectangle(
                width / 2,
                height * 0.4 + index * 70,
                300,
                50,
                COLORS.UI.BUTTON
            ).setInteractive();

            // Add hover effect
            button.on('pointerover', () => {
                button.fillColor = COLORS.UI.BUTTON_HOVER;
            });

            button.on('pointerout', () => {
                button.fillColor = COLORS.UI.BUTTON;
            });

            // Add click event
            button.on('pointerdown', option.action);

            // Add text
            const text = this.add.text(
                width / 2,
                height * 0.4 + index * 70,
                option.text,
                {
                    font: '24px Arial',
                    fill: '#ffffff'
                }
            ).setOrigin(0.5);

            return { button, text };
        });

        // Add version text
        this.add.text(
            width - 20,
            height - 20,
            'v0.1.0',
            {
                font: '16px Arial',
                fill: '#ffffff'
            }
        ).setOrigin(1);
    }

    /**
     * Setup input handlers
     * @private
     */
    setupInput() {
        // Add keyboard navigation
        this.cursorKeys = this.input.keyboard.createCursorKeys();
        this.selectedOption = 0;

        // Highlight initial option
        this.highlightOption(this.selectedOption);

        // Add keyboard events
        this.input.keyboard.on('keydown-UP', () => {
            this.selectPreviousOption();
        });

        this.input.keyboard.on('keydown-DOWN', () => {
            this.selectNextOption();
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            this.selectCurrentOption();
        });

        this.input.keyboard.on('keydown-SPACE', () => {
            this.selectCurrentOption();
        });
    }

    /**
     * Highlight a menu option
     * @param {number} index - Index of option to highlight
     * @private
     */
    highlightOption(index) {
        // Reset all buttons
        this.menuOptions.forEach(option => {
            option.button.fillColor = COLORS.UI.BUTTON;
        });

        // Highlight selected button
        this.menuOptions[index].button.fillColor = COLORS.UI.BUTTON_HOVER;
    }

    /**
     * Select previous menu option
     * @private
     */
    selectPreviousOption() {
        this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
        this.highlightOption(this.selectedOption);
    }

    /**
     * Select next menu option
     * @private
     */
    selectNextOption() {
        this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
        this.highlightOption(this.selectedOption);
    }

    /**
     * Select current menu option
     * @private
     */
    selectCurrentOption() {
        const option = this.menuOptions[this.selectedOption];
        option.button.emit('pointerdown');
    }

    /**
     * Start a new game
     * @private
     */
    startNewGame() {
        if (this.debug) {
            console.log('MenuScene: Starting new game');
        }

        // Initialize player data
        this.game.registry.set('playerData', {
            name: 'Player',
            position: { x: 5, y: 5, map: 'hometown' },
            party: [],
            inventory: [],
            progress: {
                badges: 0,
                quests: {}
            }
        });

        // Start the world scene
        this.scene.start(SCENES.WORLD);
    }

    /**
     * Continue existing game
     * @private
     */
    continueGame() {
        if (this.debug) {
            console.log('MenuScene: Continue game (Not implemented)');
        }

        // Show not implemented message
        this.showMessage('Continue feature not implemented yet');
    }

    /**
     * Open options menu
     * @private
     */
    openOptions() {
        if (this.debug) {
            console.log('MenuScene: Open options (Not implemented)');
        }

        // Show not implemented message
        this.showMessage('Options feature not implemented yet');
    }

    /**
     * Show a temporary message
     * @param {string} message - Message to display
     * @private
     */
    showMessage(message) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create message background
        const messageBg = this.add.rectangle(
            width / 2,
            height * 0.7,
            width * 0.8,
            80,
            0x000000,
            0.7
        );

        // Create message text
        const messageText = this.add.text(
            width / 2,
            height * 0.7,
            message,
            {
                font: '24px Arial',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Remove message after delay
        this.time.delayedCall(2000, () => {
            messageBg.destroy();
            messageText.destroy();
        });
    }

    /**
     * Update loop called every frame
     * @param {number} time - Current time
     * @param {number} delta - Time elapsed since last update
     */
    update(time, delta) {
        // Nothing to update in menu scene
    }

    /**
     * Cleanup when scene is shutdown
     * @private
     */
    shutdown() {
        // Remove event listeners
        this.events.off('shutdown', this.shutdown, this);
        this.input.keyboard.off('keydown-UP');
        this.input.keyboard.off('keydown-DOWN');
        this.input.keyboard.off('keydown-ENTER');
        this.input.keyboard.off('keydown-SPACE');

        // Clean up menu options
        this.menuOptions.forEach(option => {
            option.button.off('pointerover');
            option.button.off('pointerout');
            option.button.off('pointerdown');
        });
    }
}