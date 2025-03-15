/**
 * UIBuilder Class
 * Utility for creating consistent UI elements
 * Provides methods for common UI patterns
 */
class UIBuilder {
    /**
     * Create a new UIBuilder
     * @param {Phaser.Scene} scene - The scene to create UI in
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
            console.log('UIBuilder: Initialized');
        }
    }

    /**
     * Create a button with text
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Button text
     * @param {Object} style - Button style
     * @param {Function} callback - Callback when button is clicked
     * @returns {Object} Button object with background and text
     */
    createButton(x, y, text, style, callback) {
        const width = style?.width || 200;
        const height = style?.height || 50;
        const backgroundColor = style?.backgroundColor || COLORS.UI.BUTTON;
        const hoverColor = style?.hoverColor || COLORS.UI.BUTTON_HOVER;
        const textColor = style?.textColor || COLORS.UI.TEXT;
        const fontSize = style?.fontSize || 16;

        // Create button background
        const button = this._scene.add.rectangle(
            x, y, width, height, backgroundColor
        ).setInteractive();

        // Add hover events
        button.on('pointerover', () => {
            button.fillColor = hoverColor;
        });

        button.on('pointerout', () => {
            button.fillColor = backgroundColor;
        });

        // Add click event
        if (callback) {
            button.on('pointerdown', callback);
        }

        // Add text
        const buttonText = this._scene.add.text(
            x, y, text, {
                font: `${fontSize}px Arial`,
                fill: textColor
            }
        ).setOrigin(0.5);

        return { background: button, text: buttonText };
    }

    /**
     * Create a panel with background
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Panel width
     * @param {number} height - Panel height
     * @param {Object} style - Panel style
     * @returns {Phaser.GameObjects.Container} Panel container
     */
    createPanel(x, y, width, height, style) {
        const backgroundColor = style?.backgroundColor || COLORS.UI.BACKGROUND;
        const borderColor = style?.borderColor || COLORS.UI.BORDER;
        const alpha = style?.alpha || 0.8;

        // Create container
        const panel = this._scene.add.container(x, y);

        // Create background
        const background = this._scene.add.rectangle(
            0, 0, width, height, backgroundColor, alpha
        ).setOrigin(0.5);

        // Add border if needed
        if (style?.showBorder) {
            const border = this._scene.add.rectangle(
                0, 0, width, height, borderColor
            ).setOrigin(0.5);
            border.setStrokeStyle(2, borderColor);
            panel.add(border);
        }

        // Add background to panel
        panel.add(background);

        return panel;
    }
}