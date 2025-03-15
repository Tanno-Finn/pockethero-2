/**
 * BattleScene
 * Handles battle sequences between player and wild/trainer monsters
 * Manages battle UI, animations, and battle flow
 *
 * @extends Phaser.Scene
 */
class BattleScene extends Phaser.Scene {
    /**
     * Create the Battle Scene
     */
    constructor() {
        super({
            key: SCENES.BATTLE
        });
    }

    /**
     * Initialize the scene
     * @param {Object} data - Data passed from previous scene
     */
    init(data) {
        this.debug = GAME_CONFIG.DEBUG;

        if (this.debug) {
            console.log('BattleScene: Initializing with data', data);
        }

        // Get event system
        this.eventSystem = this.game.registry.get('eventSystem');

        // Player data from registry
        this.playerData = this.game.registry.get('playerData');

        // Store initialization data
        this.initData = data || {};

        // Battle state
        this.battleState = {
            active: false,
            turn: 0,
            playerTeam: [],
            enemyTeam: [],
            currentAction: null,
            messageQueue: [],
            battleType: 'wild',
            battleEnded: false
        };

        // UI elements
        this.ui = {
            background: null,
            playerPlatform: null,
            enemyPlatform: null,
            playerMonsterSprite: null,
            enemyMonsterSprite: null,
            playerMonsterInfo: null,
            enemyMonsterInfo: null,
            actionMenu: null,
            abilityMenu: null,
            monsterMenu: null,
            messageBox: null,
            currentMessage: null
        };

        // Animation properties
        this.animations = {
            playerAttack: null,
            enemyAttack: null,
            playerDamage: null,
            enemyDamage: null,
            catchAttempt: null
        };

        // Input handling properties
        this.inputEnabled = false;

        // Selected menu options
        this.selectedAction = 0;
        this.selectedAbility = 0;
        this.selectedMonster = 0;
    }

    /**
     * Preload assets for battle scene
     */
    preload() {
        // Already preloaded in PreloadScene
    }

    /**
     * Create game objects and setup scene
     */
    create() {
        // Create battle system
        this.battleSystem = new BattleSystem(this);

        // Create monster system (get from battle system to reuse instance)
        this.monsterSystem = this.battleSystem.getMonsterSystem();

        // Setup battle UI
        this.createBattleUI();

        // Setup input
        this.setupInput();

        // Start battle
        this.startBattle();

        // Register event listeners
        this.events.on('shutdown', this.shutdown, this);

        if (this.debug) {
            console.log('BattleScene: Setup complete');
        }
    }

    /**
     * Create battle UI elements
     * @private
     */
    createBattleUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create battle background
        this.ui.background = this.add.rectangle(0, 0, width, height, 0x87CEEB).setOrigin(0);

        // Create battle platforms
        this.ui.enemyPlatform = this.add.ellipse(width * 0.25, height * 0.3, 160, 60, 0x555555);
        this.ui.playerPlatform = this.add.ellipse(width * 0.75, height * 0.6, 160, 60, 0x555555);

        // Create monster info boxes
        this.createMonsterInfoBoxes();

        // Create action menu (Fight, Bag, Monster, Run)
        this.createActionMenu();

        // Create ability menu (initially hidden)
        this.createAbilityMenu();

        // Create monster selection menu (initially hidden)
        this.createMonsterMenu();

        // Create message box
        this.createMessageBox();
    }

    /**
     * Create monster info boxes
     * @private
     */
    createMonsterInfoBoxes() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create enemy monster info box
        this.ui.enemyMonsterInfo = this.add.container(width * 0.75, height * 0.2);

        // Enemy monster info background
        const enemyInfoBg = this.add.rectangle(0, 0, 250, 80, 0x333333, 0.8).setOrigin(0.5);
        this.ui.enemyMonsterInfo.add(enemyInfoBg);

        // Enemy monster name text
        this.ui.enemyMonsterName = this.add.text(-100, -30, 'Enemy Monster', {
            font: '18px Arial',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);
        this.ui.enemyMonsterInfo.add(this.ui.enemyMonsterName);

        // Enemy monster level text
        this.ui.enemyMonsterLevel = this.add.text(100, -30, 'Lv. 1', {
            font: '16px Arial',
            fill: '#ffffff'
        }).setOrigin(1, 0.5);
        this.ui.enemyMonsterInfo.add(this.ui.enemyMonsterLevel);

        // Enemy monster HP bar background
        const enemyHpBarBg = this.add.rectangle(0, 0, 200, 15, 0x666666).setOrigin(0.5);
        this.ui.enemyMonsterInfo.add(enemyHpBarBg);

        // Enemy monster HP bar
        this.ui.enemyMonsterHpBar = this.add.rectangle(-100, 0, 200, 15, 0x00ff00).setOrigin(0, 0.5);
        this.ui.enemyMonsterInfo.add(this.ui.enemyMonsterHpBar);

        // Enemy monster HP text
        this.ui.enemyMonsterHp = this.add.text(0, 20, 'HP', {
            font: '14px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.ui.enemyMonsterInfo.add(this.ui.enemyMonsterHp);

        // Create player monster info box
        this.ui.playerMonsterInfo = this.add.container(width * 0.25, height * 0.7);

        // Player monster info background
        const playerInfoBg = this.add.rectangle(0, 0, 250, 80, 0x333333, 0.8).setOrigin(0.5);
        this.ui.playerMonsterInfo.add(playerInfoBg);

        // Player monster name text
        this.ui.playerMonsterName = this.add.text(-100, -30, 'Player Monster', {
            font: '18px Arial',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);
        this.ui.playerMonsterInfo.add(this.ui.playerMonsterName);

        // Player monster level text
        this.ui.playerMonsterLevel = this.add.text(100, -30, 'Lv. 1', {
            font: '16px Arial',
            fill: '#ffffff'
        }).setOrigin(1, 0.5);
        this.ui.playerMonsterInfo.add(this.ui.playerMonsterLevel);

        // Player monster HP bar background
        const playerHpBarBg = this.add.rectangle(0, 0, 200, 15, 0x666666).setOrigin(0.5);
        this.ui.playerMonsterInfo.add(playerHpBarBg);

        // Player monster HP bar
        this.ui.playerMonsterHpBar = this.add.rectangle(-100, 0, 200, 15, 0x00ff00).setOrigin(0, 0.5);
        this.ui.playerMonsterInfo.add(this.ui.playerMonsterHpBar);

        // Player monster HP text
        this.ui.playerMonsterHp = this.add.text(0, 20, 'HP', {
            font: '14px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.ui.playerMonsterInfo.add(this.ui.playerMonsterHp);

        // Hide monster info until battle starts
        this.ui.enemyMonsterInfo.visible = false;
        this.ui.playerMonsterInfo.visible = false;
    }

    /**
     * Create action menu
     * @private
     */
    createActionMenu() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create action menu container
        this.ui.actionMenu = this.add.container(width * 0.75, height * 0.8);

        // Action menu background
        const actionMenuBg = this.add.rectangle(0, 0, 300, 150, 0x333333, 0.8).setOrigin(0.5);
        this.ui.actionMenu.add(actionMenuBg);

        // Action menu options
        const actionOptions = ['Fight', 'Bag', 'Monster', 'Run'];
        this.ui.actionButtons = [];

        // Create each action button
        actionOptions.forEach((option, index) => {
            const x = index % 2 === 0 ? -75 : 75;
            const y = index < 2 ? -35 : 35;

            // Button background
            const buttonBg = this.add.rectangle(x, y, 120, 50, COLORS.UI.BUTTON).setInteractive();
            this.ui.actionMenu.add(buttonBg);

            // Button text
            const buttonText = this.add.text(x, y, option, {
                font: '18px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5);
            this.ui.actionMenu.add(buttonText);

            // Store button reference
            this.ui.actionButtons.push({ bg: buttonBg, text: buttonText });

            // Add events
            buttonBg.on('pointerover', () => {
                this.selectedAction = index;
                this.highlightActionButton(index);
            });

            buttonBg.on('pointerdown', () => {
                this.handleActionSelection(index);
            });
        });

        // Hide action menu until needed
        this.ui.actionMenu.visible = false;
    }

    /**
     * Create ability menu
     * @private
     */
    createAbilityMenu() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create ability menu container
        this.ui.abilityMenu = this.add.container(width * 0.75, height * 0.8);

        // Ability menu background
        const abilityMenuBg = this.add.rectangle(0, 0, 300, 150, 0x333333, 0.8).setOrigin(0.5);
        this.ui.abilityMenu.add(abilityMenuBg);

        // Placeholder ability buttons (will be populated when battle starts)
        this.ui.abilityButtons = [];

        // Create back button
        const backButtonBg = this.add.rectangle(0, 60, 120, 30, 0x555555).setInteractive();
        this.ui.abilityMenu.add(backButtonBg);

        const backButtonText = this.add.text(0, 60, 'Back', {
            font: '16px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.ui.abilityMenu.add(backButtonText);

        // Add back button event
        backButtonBg.on('pointerdown', () => {
            this.showActionMenu();
        });

        // Hide ability menu until needed
        this.ui.abilityMenu.visible = false;
    }

    /**
     * Create monster selection menu
     * @private
     */
    createMonsterMenu() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create monster menu container
        this.ui.monsterMenu = this.add.container(width * 0.5, height * 0.5);

        // Monster menu background
        const monsterMenuBg = this.add.rectangle(0, 0, 400, 350, 0x333333, 0.8).setOrigin(0.5);
        this.ui.monsterMenu.add(monsterMenuBg);

        // Monster menu title
        const monsterMenuTitle = this.add.text(0, -150, 'Switch Monster', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.ui.monsterMenu.add(monsterMenuTitle);

        // Placeholder monster buttons (will be populated when battle starts)
        this.ui.monsterButtons = [];

        // Create back button
        const backButtonBg = this.add.rectangle(0, 150, 120, 30, 0x555555).setInteractive();
        this.ui.monsterMenu.add(backButtonBg);

        const backButtonText = this.add.text(0, 150, 'Back', {
            font: '16px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.ui.monsterMenu.add(backButtonText);

        // Add back button event
        backButtonBg.on('pointerdown', () => {
            this.showActionMenu();
        });

        // Hide monster menu until needed
        this.ui.monsterMenu.visible = false;
    }

    /**
     * Create message box
     * @private
     */
    createMessageBox() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create message box container
        this.ui.messageBox = this.add.container(width * 0.5, height * 0.5);

        // Message box background
        const messageBoxBg = this.add.rectangle(0, 0, width * 0.8, height * 0.2, 0x333333, 0.8).setOrigin(0.5);
        this.ui.messageBox.add(messageBoxBg);

        // Message text
        this.ui.messageText = this.add.text(0, 0, '', {
            font: '20px Arial',
            fill: '#ffffff',
            align: 'center',
            wordWrap: { width: width * 0.7 }
        }).setOrigin(0.5);
        this.ui.messageBox.add(this.ui.messageText);

        // Hide message box until needed
        this.ui.messageBox.visible = false;
    }

    /**
     * Setup input handlers
     * @private
     */
    setupInput() {
        // Add keyboard navigation
        this.cursors = this.input.keyboard.createCursorKeys();

        // Action keys
        this.confirmKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.cancelKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

        // Add keyboard event handlers
        this.input.keyboard.on('keydown-UP', this.handleUpKey, this);
        this.input.keyboard.on('keydown-DOWN', this.handleDownKey, this);
        this.input.keyboard.on('keydown-LEFT', this.handleLeftKey, this);
        this.input.keyboard.on('keydown-RIGHT', this.handleRightKey, this);
        this.input.keyboard.on('keydown-Z', this.handleConfirmKey, this);
        this.input.keyboard.on('keydown-X', this.handleCancelKey, this);

        // Disable input until battle starts
        this.inputEnabled = false;
    }

    /**
     * Start a battle
     * @private
     */
    startBattle() {
        // Get player team from player data
        let playerTeam = this.playerData.party || [];

        // If player has no monsters, create a default one
        if (playerTeam.length === 0) {
            const defaultMonster = this.monsterSystem.createMonster('monster-001', 5);
            playerTeam = [defaultMonster];

            // Update player data
            this.playerData.party = playerTeam;
        }

        // Create a random enemy monster for wild battles
        let enemyTeam = [];

        if (this.initData.enemy) {
            // Use provided enemy data
            enemyTeam = Array.isArray(this.initData.enemy) ? this.initData.enemy : [this.initData.enemy];
        } else {
            // Create a random enemy
            const monsterIds = ['monster-001', 'monster-004'];
            const randomMonsterId = monsterIds[Math.floor(Math.random() * monsterIds.length)];
            const randomLevel = Math.max(1, playerTeam[0].level - 2 + Math.floor(Math.random() * 5));

            const enemyMonster = this.monsterSystem.createMonster(randomMonsterId, randomLevel);
            enemyTeam = [enemyMonster];
        }

        // Determine battle type
        const battleType = this.initData.battleType || 'wild';

        // Start battle in battle system
        const battleState = this.battleSystem.startBattle({
            playerTeam: playerTeam,
            enemyTeam: enemyTeam,
            battleType: battleType,
            trainer: this.initData.trainer
        });

        // Store battle state
        this.battleState = battleState;

        // Create monster sprites
        this.createMonsterSprites();

        // Update monster info displays
        this.updateMonsterInfo();

        // Show message about battle start
        let startMessage = '';

        if (battleType === 'wild') {
            startMessage = `A wild ${battleState.activeEnemyMonster.name} appeared!`;
        } else if (battleType === 'trainer') {
            const trainerName = this.initData.trainer ? this.initData.trainer.name : 'Trainer';
            startMessage = `${trainerName} challenges you to a battle!`;
        }

        // Show start message and then action menu
        this.showMessage(startMessage, () => {
            this.showActionMenu();
        });

        if (this.debug) {
            console.log('BattleScene: Battle started', battleState);
        }
    }

    /**
     * Create monster sprites
     * @private
     */
    createMonsterSprites() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create enemy monster sprite
        const enemyMonster = this.battleState.activeEnemyMonster;

        if (enemyMonster) {
            // Remove existing sprite if any
            if (this.ui.enemyMonsterSprite) {
                this.ui.enemyMonsterSprite.destroy();
            }

            // Create enemy monster sprite
            this.ui.enemyMonsterSprite = this.monsterSystem.createMonsterSprite(
                enemyMonster,
                this.ui.enemyPlatform.x,
                this.ui.enemyPlatform.y - 40,
                2
            );
        }

        // Create player monster sprite
        const playerMonster = this.battleState.activePlayerMonster;

        if (playerMonster) {
            // Remove existing sprite if any
            if (this.ui.playerMonsterSprite) {
                this.ui.playerMonsterSprite.destroy();
            }

            // Create player monster sprite
            this.ui.playerMonsterSprite = this.monsterSystem.createMonsterSprite(
                playerMonster,
                this.ui.playerPlatform.x,
                this.ui.playerPlatform.y - 40,
                2
            );
        }

        // Show monster info displays
        this.ui.enemyMonsterInfo.visible = true;
        this.ui.playerMonsterInfo.visible = true;
    }

    /**
     * Update monster info displays
     * @private
     */
    updateMonsterInfo() {
        // Update enemy monster info
        const enemyMonster = this.battleState.activeEnemyMonster;

        if (enemyMonster) {
            this.ui.enemyMonsterName.setText(enemyMonster.name);
            this.ui.enemyMonsterLevel.setText(`Lv. ${enemyMonster.level}`);

            // Update HP bar
            const hpPercent = enemyMonster.currentHp / enemyMonster.stats.hp;
            this.ui.enemyMonsterHpBar.width = 200 * hpPercent;

            // Change color based on HP percentage
            if (hpPercent > 0.5) {
                this.ui.enemyMonsterHpBar.fillColor = 0x00ff00; // Green
            } else if (hpPercent > 0.25) {
                this.ui.enemyMonsterHpBar.fillColor = 0xffff00; // Yellow
            } else {
                this.ui.enemyMonsterHpBar.fillColor = 0xff0000; // Red
            }

            // Update HP text
            this.ui.enemyMonsterHp.setText(`${enemyMonster.currentHp}/${enemyMonster.stats.hp}`);
        }

        // Update player monster info
        const playerMonster = this.battleState.activePlayerMonster;

        if (playerMonster) {
            this.ui.playerMonsterName.setText(playerMonster.name);
            this.ui.playerMonsterLevel.setText(`Lv. ${playerMonster.level}`);

            // Update HP bar
            const hpPercent = playerMonster.currentHp / playerMonster.stats.hp;
            this.ui.playerMonsterHpBar.width = 200 * hpPercent;

            // Change color based on HP percentage
            if (hpPercent > 0.5) {
                this.ui.playerMonsterHpBar.fillColor = 0x00ff00; // Green
            } else if (hpPercent > 0.25) {
                this.ui.playerMonsterHpBar.fillColor = 0xffff00; // Yellow
            } else {
                this.ui.playerMonsterHpBar.fillColor = 0xff0000; // Red
            }

            // Update HP text
            this.ui.playerMonsterHp.setText(`${playerMonster.currentHp}/${playerMonster.stats.hp}`);
        }
    }

    /**
     * Show a message in the message box
     * @param {string} message - Message to display
     * @param {function} callback - Callback function when message is closed
     * @private
     */
    showMessage(message, callback) {
        // Hide all menus
        this.ui.actionMenu.visible = false;
        this.ui.abilityMenu.visible = false;
        this.ui.monsterMenu.visible = false;

        // Show message box
        this.ui.messageBox.visible = true;
        this.ui.messageText.setText(message);

        // Disable input during message display
        this.inputEnabled = false;

        // Setup confirmation to continue
        const handleMessageConfirm = () => {
            this.input.keyboard.off('keydown-Z', handleMessageConfirm);
            this.input.keyboard.off('keydown-SPACE', handleMessageConfirm);

            // Hide message box
            this.ui.messageBox.visible = false;

            // Call callback if provided
            if (callback) {
                callback();
            }
        };

        // Add temporary event listeners for confirmation
        this.input.keyboard.once('keydown-Z', handleMessageConfirm);
        this.input.keyboard.once('keydown-SPACE', handleMessageConfirm);
    }

    /**
     * Add a message to the queue
     * @param {string} message - Message to add
     * @private
     */
    queueMessage(message) {
        this.battleState.messageQueue.push(message);
    }

    /**
     * Process the next message in the queue
     * @param {function} callback - Callback function when all messages are processed
     * @private
     */
    processMessageQueue(callback) {
        if (this.battleState.messageQueue.length === 0) {
            // No messages left, call callback
            if (callback) {
                callback();
            }
            return;
        }

        // Get next message
        const message = this.battleState.messageQueue.shift();

        // Show message and process next when done
        this.showMessage(message, () => {
            this.processMessageQueue(callback);
        });
    }

    /**
     * Show the action menu
     * @private
     */
    showActionMenu() {
        // Hide other menus
        this.ui.abilityMenu.visible = false;
        this.ui.monsterMenu.visible = false;
        this.ui.messageBox.visible = false;

        // Show action menu
        this.ui.actionMenu.visible = true;

        // Highlight selected action
        this.highlightActionButton(this.selectedAction);

        // Enable input
        this.inputEnabled = true;
        this.currentMenu = 'action';
    }

    /**
     * Highlight an action button
     * @param {number} index - Index of button to highlight
     * @private
     */
    highlightActionButton(index) {
        // Reset all buttons
        this.ui.actionButtons.forEach(button => {
            button.bg.fillColor = COLORS.UI.BUTTON;
        });

        // Highlight selected button
        this.ui.actionButtons[index].bg.fillColor = COLORS.UI.BUTTON_HOVER;
    }

    /**
     * Handle action selection
     * @param {number} index - Index of selected action
     * @private
     */
    handleActionSelection(index) {
        switch (index) {
            case 0: // Fight
                this.showAbilityMenu();
                break;

            case 1: // Bag
                this.showMessage('You have no items!', () => {
                    this.showActionMenu();
                });
                break;

            case 2: // Monster
                this.showMonsterMenu();
                break;

            case 3: // Run
                this.handleRunAction();
                break;
        }
    }

    /**
     * Show ability menu with current monster's abilities
     * @private
     */
    showAbilityMenu() {
        // Get current monster's abilities
        const monster = this.battleState.activePlayerMonster;

        if (!monster || !monster.abilities || monster.abilities.length === 0) {
            this.showMessage('Your monster has no abilities!', () => {
                this.showActionMenu();
            });
            return;
        }

        // Clear existing ability buttons
        this.ui.abilityButtons.forEach(button => {
            button.bg.destroy();
            button.text.destroy();
        });
        this.ui.abilityButtons = [];

        // Create ability buttons
        monster.abilities.forEach((abilityId, index) => {
            const ability = this.monsterSystem.getAbility(abilityId);

            if (!ability) {
                return;
            }

            // Calculate button position
            const x = index % 2 === 0 ? -75 : 75;
            const y = index < 2 ? -35 : 5;

            // Create button background
            const buttonBg = this.add.rectangle(x, y, 120, 30, COLORS.UI.BUTTON).setInteractive();
            this.ui.abilityMenu.add(buttonBg);

            // Create button text
            const buttonText = this.add.text(x, y, ability.name, {
                font: '16px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5);
            this.ui.abilityMenu.add(buttonText);

            // Create type text
            const typeText = this.add.text(x, y + 15, ability.type, {
                font: '12px Arial',
                fill: '#ffffff'
            }).setOrigin(0.5);
            this.ui.abilityMenu.add(typeText);

            // Store button reference
            this.ui.abilityButtons.push({ bg: buttonBg, text: buttonText, typeText: typeText });

            // Add events
            buttonBg.on('pointerover', () => {
                this.selectedAbility = index;
                this.highlightAbilityButton(index);
            });

            buttonBg.on('pointerdown', () => {
                this.handleAbilitySelection(index);
            });
        });

        // Hide action menu
        this.ui.actionMenu.visible = false;
        this.ui.monsterMenu.visible = false;
        this.ui.messageBox.visible = false;

        // Show ability menu
        this.ui.abilityMenu.visible = true;

        // Highlight selected ability
        this.highlightAbilityButton(this.selectedAbility);

        // Update current menu
        this.inputEnabled = true;
        this.currentMenu = 'ability';
    }

    /**
     * Highlight an ability button
     * @param {number} index - Index of button to highlight
     * @private
     */
    highlightAbilityButton(index) {
        // Reset all buttons
        this.ui.abilityButtons.forEach(button => {
            button.bg.fillColor = COLORS.UI.BUTTON;
        });

        // Highlight selected button
        if (this.ui.abilityButtons[index]) {
            this.ui.abilityButtons[index].bg.fillColor = COLORS.UI.BUTTON_HOVER;
        }
    }

    /**
     * Handle ability selection
     * @param {number} index - Index of selected ability
     * @private
     */
    handleAbilitySelection(index) {
        const monster = this.battleState.activePlayerMonster;

        if (!monster || !monster.abilities || index >= monster.abilities.length) {
            return;
        }

        const abilityId = monster.abilities[index];

        // Disable input during action
        this.inputEnabled = false;

        // Hide menus
        this.ui.actionMenu.visible = false;
        this.ui.abilityMenu.visible = false;

        // Execute ability
        const action = {
            type: 'ability',
            abilityId: abilityId,
            targetId: this.battleState.activeEnemyMonster.id
        };

        // Show ability use message
        const ability = this.monsterSystem.getAbility(abilityId);
        this.showMessage(`${monster.name} used ${ability.name}!`, () => {
            // Execute action in battle system
            const result = this.battleSystem.executePlayerAction(action);

            // Handle result
            this.handleActionResult(result);
        });
    }

    /**
     * Show monster selection menu
     * @private
     */
    showMonsterMenu() {
        // Get player team
        const team = this.battleState.playerTeam;

        if (!team || team.length === 0) {
            this.showMessage('You have no monsters!', () => {
                this.showActionMenu();
            });
            return;
        }

        // Clear existing monster buttons
        this.ui.monsterButtons.forEach(button => {
            button.bg.destroy();
            button.text.destroy();
            button.levelText.destroy();
            button.hpText.destroy();
        });
        this.ui.monsterButtons = [];

        // Create monster buttons
        team.forEach((monster, index) => {
            // Skip active monster
            if (monster === this.battleState.activePlayerMonster) {
                return;
            }

            // Calculate button position
            const y = -100 + index * 50;

            // Create button background
            const buttonBg = this.add.rectangle(0, y, 350, 40, monster.currentHp > 0 ? COLORS.UI.BUTTON : 0x777777).setInteractive();
            this.ui.monsterMenu.add(buttonBg);

            // Create monster name text
            const nameText = this.add.text(-160, y, monster.name, {
                font: '16px Arial',
                fill: '#ffffff'
            }).setOrigin(0, 0.5);
            this.ui.monsterMenu.add(nameText);

            // Create level text
            const levelText = this.add.text(-60, y, `Lv. ${monster.level}`, {
                font: '14px Arial',
                fill: '#ffffff'
            }).setOrigin(0, 0.5);
            this.ui.monsterMenu.add(levelText);

            // Create HP text
            const hpText = this.add.text(40, y, `HP: ${monster.currentHp}/${monster.stats.hp}`, {
                font: '14px Arial',
                fill: '#ffffff'
            }).setOrigin(0, 0.5);
            this.ui.monsterMenu.add(hpText);

            // Store button reference
            this.ui.monsterButtons.push({
                bg: buttonBg,
                text: nameText,
                levelText: levelText,
                hpText: hpText,
                monster: monster,
                index: index
            });

            // Add events (only if monster has HP)
            if (monster.currentHp > 0) {
                buttonBg.on('pointerover', () => {
                    this.selectedMonster = index;
                    this.highlightMonsterButton(index);
                });

                buttonBg.on('pointerdown', () => {
                    this.handleMonsterSelection(index);
                });
            }
        });

        // Hide other menus
        this.ui.actionMenu.visible = false;
        this.ui.abilityMenu.visible = false;
        this.ui.messageBox.visible = false;

        // Show monster menu
        this.ui.monsterMenu.visible = true;

        // Highlight selected monster
        this.highlightMonsterButton(this.selectedMonster);

        // Update current menu
        this.inputEnabled = true;
        this.currentMenu = 'monster';
    }

    /**
     * Highlight a monster button
     * @param {number} index - Index of button to highlight
     * @private
     */
    highlightMonsterButton(index) {
        // Reset all buttons
        this.ui.monsterButtons.forEach(button => {
            if (button.monster.currentHp > 0) {
                button.bg.fillColor = COLORS.UI.BUTTON;
            }
        });

        // Find button with matching index
        const button = this.ui.monsterButtons.find(btn => btn.index === index);

        // Highlight selected button if found and monster has HP
        if (button && button.monster.currentHp > 0) {
            button.bg.fillColor = COLORS.UI.BUTTON_HOVER;
        }
    }

    /**
     * Handle monster selection
     * @param {number} index - Index of selected monster
     * @private
     */
    handleMonsterSelection(index) {
        // Find button with matching index
        const button = this.ui.monsterButtons.find(btn => btn.index === index);

        if (!button || button.monster.currentHp <= 0) {
            return;
        }

        const monster = button.monster;

        // Disable input during action
        this.inputEnabled = false;

        // Hide menus
        this.ui.actionMenu.visible = false;
        this.ui.monsterMenu.visible = false;

        // Execute switch action
        const action = {
            type: 'switch',
            switchIndex: index
        };

        // Show switch message
        this.showMessage(`Go, ${monster.name}!`, () => {
            // Execute action in battle system
            const result = this.battleSystem.executePlayerAction(action);

            // Update monster sprites
            this.createMonsterSprites();

            // Update monster info
            this.updateMonsterInfo();

            // Handle result
            this.handleActionResult(result);
        });
    }

    /**
     * Handle Run action
     * @private
     */
    handleRunAction() {
        // Disable input during action
        this.inputEnabled = false;

        // Hide menus
        this.ui.actionMenu.visible = false;

        // Execute run action
        const action = {
            type: 'run'
        };

        // Show run message
        this.showMessage('Trying to run...', () => {
            // Execute action in battle system
            const result = this.battleSystem.executePlayerAction(action);

            // Handle result
            this.handleActionResult(result);
        });
    }

    /**
     * Handle action result
     * @param {Object} result - Action result
     * @private
     */
    handleActionResult(result) {
        if (!result.success) {
            // Action failed
            this.showMessage(result.message || 'Action failed!', () => {
                this.showActionMenu();
            });
            return;
        }

        // Queue result messages
        this.battleState.messageQueue = [];

        // Add main result message
        if (result.message) {
            this.queueMessage(result.message);
        }

        // Add type effectiveness message if applicable
        if (result.typeEffectiveness > 1) {
            this.queueMessage("It's super effective!");
        } else if (result.typeEffectiveness < 1 && result.typeEffectiveness > 0) {
            this.queueMessage("It's not very effective...");
        } else if (result.typeEffectiveness === 0) {
            this.queueMessage("It has no effect!");
        }

        // Add fainted message if applicable
        if (result.damageResult && result.damageResult.fainted) {
            this.queueMessage(`${result.target} fainted!`);
        }

        // Add enemy action messages if applicable
        if (result.enemyAction) {
            if (result.enemyAction.message) {
                this.queueMessage(result.enemyAction.message);
            }

            // Add type effectiveness message for enemy action
            if (result.enemyAction.typeEffectiveness > 1) {
                this.queueMessage("It's super effective!");
            } else if (result.enemyAction.typeEffectiveness < 1 && result.enemyAction.typeEffectiveness > 0) {
                this.queueMessage("It's not very effective...");
            } else if (result.enemyAction.typeEffectiveness === 0) {
                this.queueMessage("It has no effect!");
            }

            // Add fainted message for enemy action
            if (result.enemyAction.damageResult && result.enemyAction.damageResult.fainted) {
                this.queueMessage(`${result.enemyAction.target} fainted!`);
            }
        }

        // Update monster info
        this.updateMonsterInfo();

        // Process message queue
        this.processMessageQueue(() => {
            // Check if battle has ended
            if (result.battleEnded || (result.enemyAction && result.enemyAction.battleEnded)) {
                // Handle battle end
                this.handleBattleEnd(result.battleResult || (result.enemyAction && result.enemyAction.battleResult));
            } else if (result.battleResult && result.battleResult.needSwitch) {
                // Show monster menu for forced switch
                this.showMessage('Choose your next monster!', () => {
                    this.showMonsterMenu();
                });
            } else {
                // Continue battle
                this.showActionMenu();
            }
        });
    }

    /**
     * Handle battle end
     * @param {Object} result - Battle result
     * @private
     */
    handleBattleEnd(result) {
        if (!result) {
            this.returnToWorld();
            return;
        }

        // Set battle as ended
        this.battleState.battleEnded = true;

        if (result.winner === 'player') {
            if (result.caught) {
                // Monster was caught
                this.showMessage(`You caught ${result.monster.name}!`, () => {
                    // Add to player's party if there's room
                    if (this.playerData.party.length < GAME_CONFIG.MAX_PARTY_SIZE) {
                        this.playerData.party.push(result.monster);
                        this.showMessage(`${result.monster.name} was added to your party!`, () => {
                            this.returnToWorld();
                        });
                    } else {
                        this.showMessage(`But your party is full! ${result.monster.name} was released.`, () => {
                            this.returnToWorld();
                        });
                    }
                });
            } else {
                // Regular victory
                this.showMessage('You won the battle!', () => {
                    // Check for evolution
                    if (result.canEvolve) {
                        this.handleEvolution(result.evolutionData);
                    } else {
                        this.returnToWorld();
                    }
                });
            }
        } else if (result.winner === 'enemy') {
            // Player lost
            this.showMessage('You lost the battle!', () => {
                this.returnToWorld();
            });
        } else if (result.escaped) {
            // Player escaped
            this.returnToWorld();
        }
    }

    /**
     * Handle monster evolution
     * @param {Object} evolutionData - Evolution data
     * @private
     */
    handleEvolution(evolutionData) {
        if (!evolutionData || !evolutionData.monster || !evolutionData.evolutionId) {
            this.returnToWorld();
            return;
        }

        // Show evolution message
        this.showMessage(`${evolutionData.monster.name} is evolving!`, () => {
            // Evolve monster
            const evolvedMonster = this.monsterSystem.evolveMonster(evolutionData.monster);

            // Update player's party
            const index = this.playerData.party.indexOf(evolutionData.monster);

            if (index !== -1) {
                this.playerData.party[index] = evolvedMonster;
            }

            // Show evolution complete message
            this.showMessage(`${evolutionData.monster.name} evolved into ${evolvedMonster.name}!`, () => {
                this.returnToWorld();
            });
        });
    }

    /**
     * Return to world scene
     * @private
     */
    returnToWorld() {
        // Disable input
        this.inputEnabled = false;

        // Emit battle end event
        if (this.eventSystem) {
            this.eventSystem.emit(EVENTS.BATTLE_END, this.battleState);
        }

        // Transition back to world scene
        this.cameras.main.fadeOut(500);

        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.stop();
            this.scene.resume(SCENES.WORLD);
        });
    }

    /**
     * Handle Up key press
     * @private
     */
    handleUpKey() {
        if (!this.inputEnabled) {
            return;
        }

        switch (this.currentMenu) {
            case 'action':
                // Move selection up in action menu
                if (this.selectedAction >= 2) {
                    this.selectedAction -= 2;
                    this.highlightActionButton(this.selectedAction);
                }
                break;

            case 'ability':
                // Move selection up in ability menu
                if (this.selectedAbility >= 2) {
                    this.selectedAbility -= 2;
                    this.highlightAbilityButton(this.selectedAbility);
                }
                break;

            case 'monster':
                // Move selection up in monster menu
                if (this.selectedMonster > 0) {
                    this.selectedMonster--;
                    this.highlightMonsterButton(this.selectedMonster);
                }
                break;
        }
    }

    /**
     * Handle Down key press
     * @private
     */
    handleDownKey() {
        if (!this.inputEnabled) {
            return;
        }

        switch (this.currentMenu) {
            case 'action':
                // Move selection down in action menu
                if (this.selectedAction < 2) {
                    this.selectedAction += 2;
                    this.highlightActionButton(this.selectedAction);
                }
                break;

            case 'ability':
                // Move selection down in ability menu
                if (this.selectedAbility < 2 && this.selectedAbility + 2 < this.ui.abilityButtons.length) {
                    this.selectedAbility += 2;
                    this.highlightAbilityButton(this.selectedAbility);
                }
                break;

            case 'monster':
                // Move selection down in monster menu
                if (this.selectedMonster < this.ui.monsterButtons.length - 1) {
                    this.selectedMonster++;
                    this.highlightMonsterButton(this.selectedMonster);
                }
                break;
        }
    }

    /**
     * Handle Left key press
     * @private
     */
    handleLeftKey() {
        if (!this.inputEnabled) {
            return;
        }

        switch (this.currentMenu) {
            case 'action':
                // Move selection left in action menu
                if (this.selectedAction % 2 === 1) {
                    this.selectedAction--;
                    this.highlightActionButton(this.selectedAction);
                }
                break;

            case 'ability':
                // Move selection left in ability menu
                if (this.selectedAbility % 2 === 1) {
                    this.selectedAbility--;
                    this.highlightAbilityButton(this.selectedAbility);
                }
                break;
        }
    }

    /**
     * Handle Right key press
     * @private
     */
    handleRightKey() {
        if (!this.inputEnabled) {
            return;
        }

        switch (this.currentMenu) {
            case 'action':
                // Move selection right in action menu
                if (this.selectedAction % 2 === 0) {
                    this.selectedAction++;
                    this.highlightActionButton(this.selectedAction);
                }
                break;

            case 'ability':
                // Move selection right in ability menu
                if (this.selectedAbility % 2 === 0 && this.selectedAbility + 1 < this.ui.abilityButtons.length) {
                    this.selectedAbility++;
                    this.highlightAbilityButton(this.selectedAbility);
                }
                break;
        }
    }

    /**
     * Handle Confirm key press
     * @private
     */
    handleConfirmKey() {
        if (!this.inputEnabled) {
            return;
        }

        switch (this.currentMenu) {
            case 'action':
                this.handleActionSelection(this.selectedAction);
                break;

            case 'ability':
                this.handleAbilitySelection(this.selectedAbility);
                break;

            case 'monster':
                const button = this.ui.monsterButtons.find(btn => btn.index === this.selectedMonster);

                if (button && button.monster.currentHp > 0) {
                    this.handleMonsterSelection(this.selectedMonster);
                }
                break;
        }
    }

    /**
     * Handle Cancel key press
     * @private
     */
    handleCancelKey() {
        if (!this.inputEnabled) {
            return;
        }

        switch (this.currentMenu) {
            case 'ability':
            case 'monster':
                this.showActionMenu();
                break;
        }
    }

    /**
     * Update loop called every frame
     * @param {number} time - Current time
     * @param {number} delta - Time elapsed since last update
     */
    update(time, delta) {
        // Nothing to update in battle scene
    }

    /**
     * Cleanup when scene is shutdown
     * @private
     */
    shutdown() {
        // Remove event listeners
        this.events.off('shutdown', this.shutdown, this);
        this.input.keyboard.off('keydown-UP', this.handleUpKey);
        this.input.keyboard.off('keydown-DOWN', this.handleDownKey);
        this.input.keyboard.off('keydown-LEFT', this.handleLeftKey);
        this.input.keyboard.off('keydown-RIGHT', this.handleRightKey);
        this.input.keyboard.off('keydown-Z', this.handleConfirmKey);
        this.input.keyboard.off('keydown-X', this.handleCancelKey);
    }
}