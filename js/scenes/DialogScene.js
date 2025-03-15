/**
 * DialogScene
 * Handles NPC dialog and text display
 * Supports branching conversations and dialog choices
 *
 * @extends Phaser.Scene
 */
class DialogScene extends Phaser.Scene {
    /**
     * Create the Dialog Scene
     */
    constructor() {
        super({
            key: SCENES.DIALOG
        });
    }

    /**
     * Initialize the scene
     * @param {Object} data - Data passed from previous scene
     */
    init(data) {
        this.debug = GAME_CONFIG.DEBUG;

        if (this.debug) {
            console.log('DialogScene: Initializing with data', data);
        }

        // Get event system
        this.eventSystem = this.game.registry.get('eventSystem');

        // Store initialization data
        this.initData = data || {};

        // Dialog state
        this.dialogState = {
            dialogId: data.dialogId || null,
            npcId: data.npcId || null,
            currentNode: null,
            nodeIndex: 0,
            dialogNodes: [],
            choiceIndex: 0
        };

        // UI elements
        this.ui = {
            container: null,
            background: null,
            portrait: null,
            nameText: null,
            dialogText: null,
            choiceContainer: null,
            choiceTexts: [],
            continueIndicator: null
        };

        // Input handling properties
        this.inputEnabled = false;
        this.waitingForInput = false;

        // Text display properties
        this.textSpeed = 30; // Characters per second
        this.textEvent = null;
        this.currentDisplayedText = '';
        this.targetText = '';
        this.textComplete = false;
    }

    /**
     * Create game objects and setup scene
     */
    create() {
        // Setup dialog UI
        this.createDialogUI();

        // Setup input
        this.setupInput();

        // Load dialog data
        this.loadDialogData();

        // Register event listeners
        this.events.on('shutdown', this.shutdown, this);

        if (this.debug) {
            console.log('DialogScene: Setup complete');
        }
    }

    /**
     * Create dialog UI elements
     * @private
     */
    createDialogUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create container for all UI elements
        this.ui.container = this.add.container(0, 0);

        // Create semi-transparent background
        this.ui.background = this.add.rectangle(
            width / 2,
            height - 100,
            width - 40,
            180,
            0x000000,
            0.8
        ).setOrigin(0.5);
        this.ui.container.add(this.ui.background);

        // Create portrait area
        this.ui.portrait = this.add.rectangle(
            50,
            height - 100,
            100,
            100,
            0x333333
        ).setOrigin(0.5);
        this.ui.container.add(this.ui.portrait);

        // Create name text
        this.ui.nameText = this.add.text(
            105,
            height - 155,
            '',
            {
                font: '18px Arial',
                fill: '#ffffff',
                backgroundColor: '#333333',
                padding: { left: 10, right: 10, top: 5, bottom: 5 }
            }
        ).setOrigin(0, 0.5);
        this.ui.container.add(this.ui.nameText);

        // Create dialog text
        this.ui.dialogText = this.add.text(
            120,
            height - 110,
            '',
            {
                font: '16px Arial',
                fill: '#ffffff',
                wordWrap: { width: width - 180 }
            }
        ).setOrigin(0, 0);
        this.ui.container.add(this.ui.dialogText);

        // Create continue indicator
        this.ui.continueIndicator = this.add.triangle(
            width - 40,
            height - 30,
            0, -10,
            10, 0,
            -10, 0,
            0xffffff
        ).setOrigin(0.5);
        this.ui.container.add(this.ui.continueIndicator);

        // Hide continue indicator initially
        this.ui.continueIndicator.visible = false;

        // Create container for choice options
        this.ui.choiceContainer = this.add.container(0, 0);
        this.ui.choiceContainer.visible = false;
        this.ui.container.add(this.ui.choiceContainer);

        // Initially hide the dialog
        this.ui.container.visible = false;
    }

    /**
     * Setup input handlers
     * @private
     */
    setupInput() {
        // Confirm key (Z and Space)
        this.confirmKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Choice navigation
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        // Add keyboard events
        this.input.keyboard.on('keydown-Z', this.handleConfirmKey, this);
        this.input.keyboard.on('keydown-SPACE', this.handleConfirmKey, this);
        this.input.keyboard.on('keydown-UP', this.handleUpKey, this);
        this.input.keyboard.on('keydown-DOWN', this.handleDownKey, this);

        // Initially disable input
        this.inputEnabled = false;
    }

    /**
     * Load dialog data
     * @private
     */
    loadDialogData() {
        // Get dialog data from data manager
        const dialogId = this.dialogState.dialogId;

        if (!dialogId) {
            this.endDialog();
            return;
        }

        const dialogData = dataManager.get('dialogs', dialogId);

        if (!dialogData) {
            console.error(`Dialog not found: ${dialogId}`);
            this.endDialog();
            return;
        }

        // Store dialog nodes
        this.dialogState.dialogNodes = dialogData.nodes || [];

        // Start dialog
        this.startDialog();
    }

    /**
     * Start dialog display
     * @private
     */
    startDialog() {
        // Skip if no dialog nodes
        if (this.dialogState.dialogNodes.length === 0) {
            this.endDialog();
            return;
        }

        // Show dialog container
        this.ui.container.visible = true;

        // Start with first node
        this.dialogState.nodeIndex = 0;
        this.showDialogNode(this.dialogState.nodeIndex);

        if (this.debug) {
            console.log('DialogScene: Dialog started');
        }
    }

    /**
     * Show a specific dialog node
     * @param {number} nodeIndex - Index of node to show
     * @private
     */
    showDialogNode(nodeIndex) {
        // Get node
        const node = this.dialogState.dialogNodes[nodeIndex];

        if (!node) {
            this.endDialog();
            return;
        }

        // Store current node
        this.dialogState.currentNode = node;

        // Set speaker name
        this.ui.nameText.setText(node.speaker || 'NPC');

        // Hide choices container
        this.ui.choiceContainer.visible = false;

        // Hide continue indicator
        this.ui.continueIndicator.visible = false;

        // Clear displayed text
        this.currentDisplayedText = '';
        this.ui.dialogText.setText('');

        // Set target text
        this.targetText = node.text || '';
        this.textComplete = false;

        // Start text animation
        this.animateText();

        if (this.debug) {
            console.log('DialogScene: Showing dialog node', node);
        }
    }

    /**
     * Animate text display letter by letter
     * @private
     */
    animateText() {
        // Clear any existing animation
        if (this.textEvent) {
            this.textEvent.remove();
            this.textEvent = null;
        }

        // Set initial text
        this.ui.dialogText.setText(this.currentDisplayedText);

        // Create timer for text animation
        this.textEvent = this.time.addEvent({
            delay: 1000 / this.textSpeed,
            callback: this.updateText,
            callbackScope: this,
            loop: true
        });
    }

    /**
     * Update animated text
     * @private
     */
    updateText() {
        if (this.currentDisplayedText.length < this.targetText.length) {
            // Add one character
            this.currentDisplayedText = this.targetText.substr(0, this.currentDisplayedText.length + 1);
            this.ui.dialogText.setText(this.currentDisplayedText);
        } else {
            // Text animation complete
            this.textComplete = true;

            // Stop animation timer
            if (this.textEvent) {
                this.textEvent.remove();
                this.textEvent = null;
            }

            // Handle node completion
            this.handleNodeComplete();
        }
    }

    /**
     * Handle dialog node completion
     * @private
     */
    handleNodeComplete() {
        const node = this.dialogState.currentNode;

        // Show continue indicator if not a choice node
        if (!node.choices || node.choices.length === 0) {
            this.ui.continueIndicator.visible = true;
            this.waitingForInput = true;
            this.inputEnabled = true;
        } else {
            // Show choices
            this.showChoices(node.choices);
        }
    }

    /**
     * Show choices for a dialog node
     * @param {Array} choices - Array of choice objects
     * @private
     */
    showChoices(choices) {
        // Clear existing choice texts
        this.ui.choiceTexts.forEach(text => {
            text.destroy();
        });
        this.ui.choiceTexts = [];

        // Create choice background
        const width = this.cameras.main.width;
        const choiceBg = this.add.rectangle(
            width / 2,
            350,
            300,
            30 * choices.length + 20,
            0x333333,
            0.9
        ).setOrigin(0.5);
        this.ui.choiceContainer.add(choiceBg);

        // Create choice texts
        choices.forEach((choice, index) => {
            const y = 350 - (choices.length * 15) + (index * 30);

            const text = this.add.text(
                width / 2,
                y,
                choice.text,
                {
                    font: '16px Arial',
                    fill: '#ffffff'
                }
            ).setOrigin(0.5);

            this.ui.choiceContainer.add(text);
            this.ui.choiceTexts.push(text);
        });

        // Show choices container
        this.ui.choiceContainer.visible = true;

        // Reset selected choice
        this.dialogState.choiceIndex = 0;
        this.highlightChoice(this.dialogState.choiceIndex);

        // Enable input
        this.inputEnabled = true;
        this.waitingForInput = true;
    }

    /**
     * Highlight a choice option
     * @param {number} index - Index of choice to highlight
     * @private
     */
    highlightChoice(index) {
        // Reset all choices
        this.ui.choiceTexts.forEach(text => {
            text.setStyle({
                font: '16px Arial',
                fill: '#ffffff'
            });
        });

        // Highlight selected choice
        if (this.ui.choiceTexts[index]) {
            this.ui.choiceTexts[index].setStyle({
                font: '16px Arial',
                fill: '#ffff00'
            });
        }
    }

    /**
     * Handle dialog advancement
     * @private
     */
    advanceDialog() {
        const node = this.dialogState.currentNode;

        // If text is still animating, complete it immediately
        if (!this.textComplete) {
            // Skip to end of text
            this.currentDisplayedText = this.targetText;
            this.ui.dialogText.setText(this.currentDisplayedText);

            // Stop animation timer
            if (this.textEvent) {
                this.textEvent.remove();
                this.textEvent = null;
            }

            // Mark as complete
            this.textComplete = true;

            // Handle node completion
            this.handleNodeComplete();
            return;
        }

        // If showing choices, handle choice selection
        if (node.choices && node.choices.length > 0) {
            const choice = node.choices[this.dialogState.choiceIndex];

            if (choice && choice.nextNode !== undefined) {
                // Go to specified node
                this.showDialogNode(choice.nextNode);
            } else {
                // End dialog if no next node specified
                this.endDialog();
            }
        } else {
            // No choices, go to next node or end dialog
            const nextNodeIndex = this.dialogState.nodeIndex + 1;

            if (node.nextNode !== undefined) {
                // Go to specified node
                this.showDialogNode(node.nextNode);
            } else if (nextNodeIndex < this.dialogState.dialogNodes.length) {
                // Go to next sequential node
                this.dialogState.nodeIndex = nextNodeIndex;
                this.showDialogNode(nextNodeIndex);
            } else {
                // End dialog if no more nodes
                this.endDialog();
            }
        }
    }

    /**
     * End dialog and return to previous scene
     * @private
     */
    endDialog() {
        // Hide dialog container
        this.ui.container.visible = false;

        // Disable input
        this.inputEnabled = false;
        this.waitingForInput = false;

        // Stop any text animation
        if (this.textEvent) {
            this.textEvent.remove();
            this.textEvent = null;
        }

        // Emit dialog end event
        if (this.eventSystem) {
            this.eventSystem.emit(EVENTS.DIALOG_END, {
                dialogId: this.dialogState.dialogId,
                npcId: this.dialogState.npcId
            });
        }

        // Stop scene
        this.scene.stop();

        if (this.debug) {
            console.log('DialogScene: Dialog ended');
        }
    }

    /**
     * Handle Confirm key press
     * @private
     */
    handleConfirmKey() {
        if (!this.inputEnabled || !this.waitingForInput) {
            return;
        }

        // Temporarily disable input to prevent rapid advancement
        this.inputEnabled = false;
        this.waitingForInput = false;

        // Re-enable input after a short delay
        this.time.delayedCall(100, () => {
            this.inputEnabled = true;
        });

        // Advance dialog
        this.advanceDialog();
    }

    /**
     * Handle Up key press
     * @private
     */
    handleUpKey() {
        if (!this.inputEnabled || !this.waitingForInput) {
            return;
        }

        const node = this.dialogState.currentNode;

        // Only handle key if showing choices
        if (node.choices && node.choices.length > 0) {
            // Move selection up
            this.dialogState.choiceIndex = (this.dialogState.choiceIndex - 1 + node.choices.length) % node.choices.length;
            this.highlightChoice(this.dialogState.choiceIndex);
        }
    }

    /**
     * Handle Down key press
     * @private
     */
    handleDownKey() {
        if (!this.inputEnabled || !this.waitingForInput) {
            return;
        }

        const node = this.dialogState.currentNode;

        // Only handle key if showing choices
        if (node.choices && node.choices.length > 0) {
            // Move selection down
            this.dialogState.choiceIndex = (this.dialogState.choiceIndex + 1) % node.choices.length;
            this.highlightChoice(this.dialogState.choiceIndex);
        }
    }

    /**
     * Update loop called every frame
     * @param {number} time - Current time
     * @param {number} delta - Time elapsed since last update
     */
    update(time, delta) {
        // Animate continue indicator
        if (this.ui.continueIndicator.visible) {
            this.ui.continueIndicator.y = this.cameras.main.height - 30 + Math.sin(time / 200) * 3;
        }
    }

    /**
     * Cleanup when scene is shutdown
     * @private
     */
    shutdown() {
        // Remove event listeners
        this.events.off('shutdown', this.shutdown, this);
        this.input.keyboard.off('keydown-Z', this.handleConfirmKey);
        this.input.keyboard.off('keydown-SPACE', this.handleConfirmKey);
        this.input.keyboard.off('keydown-UP', this.handleUpKey);
        this.input.keyboard.off('keydown-DOWN', this.handleDownKey);

        // Stop any text animation
        if (this.textEvent) {
            this.textEvent.remove();
            this.textEvent = null;
        }
    }
}