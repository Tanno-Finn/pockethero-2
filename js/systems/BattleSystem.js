/**
 * BattleSystem Class
 * Handles battle mechanics including turns, damage calculation,
 * and battle flow
 */
class BattleSystem {
    /**
     * Create a new BattleSystem
     * @param {Phaser.Scene} scene - The scene this system belongs to
     */
    constructor(scene) {
        /**
         * Reference to the scene
         * @type {Phaser.Scene}
         * @private
         */
        this._scene = scene;

        /**
         * Reference to MonsterSystem
         * @type {MonsterSystem}
         * @private
         */
        this._monsterSystem = new MonsterSystem(scene);

        /**
         * The event system
         * @type {EventSystem}
         * @private
         */
        this._events = scene.game.registry.get('eventSystem');

        /**
         * Current battle state
         * @type {Object}
         * @private
         */
        this._battleState = {
            active: false,
            turn: 0,
            playerTeam: [],
            enemyTeam: [],
            activePlayerMonster: null,
            activeEnemyMonster: null,
            battleType: 'wild', // 'wild' or 'trainer'
            weather: null,
            field: null
        };

        /**
         * Type effectiveness chart for damage calculations
         * @type {Object}
         * @private
         */
        this._typeChart = {
            normal: {
                normal: 1, fire: 1, water: 1, grass: 1, electric: 1,
                ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1,
                psychic: 1, bug: 1, rock: 0.5, ghost: 0, dragon: 1
            },
            fire: {
                normal: 1, fire: 0.5, water: 0.5, grass: 2, electric: 1,
                ice: 2, fighting: 1, poison: 1, ground: 1, flying: 1,
                psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 0.5
            },
            water: {
                normal: 1, fire: 2, water: 0.5, grass: 0.5, electric: 1,
                ice: 1, fighting: 1, poison: 1, ground: 2, flying: 1,
                psychic: 1, bug: 1, rock: 2, ghost: 1, dragon: 0.5
            },
            grass: {
                normal: 1, fire: 0.5, water: 2, grass: 0.5, electric: 1,
                ice: 1, fighting: 1, poison: 0.5, ground: 2, flying: 0.5,
                psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 0.5
            },
            electric: {
                normal: 1, fire: 1, water: 2, grass: 0.5, electric: 0.5,
                ice: 1, fighting: 1, poison: 1, ground: 0, flying: 2,
                psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 0.5
            },
            ice: {
                normal: 1, fire: 0.5, water: 0.5, grass: 2, electric: 1,
                ice: 0.5, fighting: 1, poison: 1, ground: 2, flying: 2,
                psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2
            },
            fighting: {
                normal: 2, fire: 1, water: A, grass: 1, electric: 1,
                ice: 2, fighting: 1, poison: 0.5, ground: 1, flying: 0.5,
                psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dragon: 1
            },
            poison: {
                normal: 1, fire: 1, water: 1, grass: 2, electric: 1,
                ice: 1, fighting: 1, poison: 0.5, ground: 0.5, flying: 1,
                psychic: 1, bug: 1, rock: 0.5, ghost: 0.5, dragon: 1
            },
            ground: {
                normal: 1, fire: 2, water: 1, grass: 0.5, electric: 2,
                ice: 1, fighting: 1, poison: 2, ground: 1, flying: 0,
                psychic: 1, bug: 0.5, rock: 2, ghost: 1, dragon: 1
            },
            flying: {
                normal: 1, fire: 1, water: 1, grass: 2, electric: 0.5,
                ice: 1, fighting: 2, poison: 1, ground: 1, flying: 1,
                psychic: 1, bug: 2, rock: 0.5, ghost: 1, dragon: 1
            },
            psychic: {
                normal: 1, fire: 1, water: 1, grass: 1, electric: 1,
                ice: 1, fighting: 2, poison: 2, ground: 1, flying: 1,
                psychic: 0.5, bug: 1, rock: 1, ghost: 1, dragon: 1
            },
            bug: {
                normal: 1, fire: 0.5, water: 1, grass: 2, electric: 1,
                ice: 1, fighting: 0.5, poison: 0.5, ground: 1, flying: 0.5,
                psychic: 2, bug: 1, rock: 1, ghost: 0.5, dragon: 1
            },
            rock: {
                normal: 1, fire: 2, water: 1, grass: 1, electric: 1,
                ice: 2, fighting: 0.5, poison: 1, ground: 0.5, flying: 2,
                psychic: 1, bug: 2, rock: 1, ghost: 1, dragon: 1
            },
            ghost: {
                normal: 0, fire: 1, water: 1, grass: 1, electric: 1,
                ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1,
                psychic: 2, bug: 1, rock: 1, ghost: 2, dragon: 1
            },
            dragon: {
                normal: 1, fire: 1, water: 1, grass: 1, electric: 1,
                ice: 1, fighting: 1, poison: 1, ground: 1, flying: 1,
                psychic: 1, bug: 1, rock: 1, ghost: 1, dragon: 2
            }
        };

        /**
         * Debug mode flag
         * @type {boolean}
         * @private
         */
        this._debug = GAME_CONFIG.DEBUG;

        if (this._debug) {
            console.log('BattleSystem: Initialized');
        }
    }

    /**
     * Start a new battle
     * @param {Object} options - Battle options
     * @param {Array} options.playerTeam - Player's monster team
     * @param {Array|Object} options.enemyTeam - Enemy's monster team or single monster
     * @param {string} options.battleType - Battle type ('wild' or 'trainer')
     * @param {Object} options.trainer - Trainer data (if trainer battle)
     * @returns {Object} Battle state
     */
    startBattle(options) {
        // Parse options
        const playerTeam = options.playerTeam || [];
        let enemyTeam = options.enemyTeam || [];

        // Handle case where enemyTeam is a single monster
        if (!Array.isArray(enemyTeam)) {
            enemyTeam = [enemyTeam];
        }

        // Set up battle state
        this._battleState = {
            active: true,
            turn: 0,
            playerTeam: playerTeam,
            enemyTeam: enemyTeam,
            activePlayerMonster: playerTeam.length > 0 ? playerTeam[0] : null,
            activeEnemyMonster: enemyTeam.length > 0 ? enemyTeam[0] : null,
            battleType: options.battleType || 'wild',
            weather: null,
            field: null,
            trainer: options.trainer || null
        };

        // Log battle start
        if (this._debug) {
            console.log('BattleSystem: Battle started', this._battleState);
        }

        // Emit battle start event
        if (this._events) {
            this._events.emit(EVENTS.BATTLE_START, this._battleState);
        }

        return this._battleState;
    }

    /**
     * End the current battle
     * @param {Object} result - Battle result
     * @returns {Object} Final battle state
     */
    endBattle(result) {
        // Set battle as inactive
        this._battleState.active = false;

        // Set result
        this._battleState.result = result;

        // Log battle end
        if (this._debug) {
            console.log('BattleSystem: Battle ended', result);
        }

        // Emit battle end event
        if (this._events) {
            this._events.emit(EVENTS.BATTLE_END, result);
        }

        return this._battleState;
    }

    /**
     * Get current battle state
     * @returns {Object} Current battle state
     */
    getBattleState() {
        return this._battleState;
    }

    /**
     * Execute a player action
     * @param {Object} action - Action data
     * @param {string} action.type - Action type ('ability', 'item', 'switch', 'run')
     * @param {string} action.targetId - Target monster ID (for ability actions)
     * @param {string} action.abilityId - Ability ID (for ability actions)
     * @param {string} action.itemId - Item ID (for item actions)
     * @param {number} action.switchIndex - Index of monster to switch to (for switch actions)
     * @returns {Object} Action result
     */
    executePlayerAction(action) {
        // Skip if battle is not active
        if (!this._battleState.active) {
            return { success: false, message: 'Battle is not active' };
        }

        // Skip if no active player monster
        if (!this._battleState.activePlayerMonster) {
            return { success: false, message: 'No active player monster' };
        }

        // Execute action based on type
        let result;

        switch (action.type) {
            case 'ability':
                result = this._executeAbility(this._battleState.activePlayerMonster, this._battleState.activeEnemyMonster, action.abilityId);
                break;

            case 'item':
                result = this._useItem(action.itemId, action.targetId);
                break;

            case 'switch':
                result = this._switchMonster('player', action.switchIndex);
                break;

            case 'run':
                result = this._attemptRun();
                break;

            default:
                result = { success: false, message: 'Invalid action type' };
        }

        // Log action
        if (this._debug) {
            console.log(`BattleSystem: Player action ${action.type}`, result);
        }

        // If action was successful, execute enemy action
        if (result.success && !result.battleEnded) {
            // Execute enemy action
            const enemyResult = this._executeEnemyAction();

            // Combine results
            result.enemyAction = enemyResult;
        }

        // Start new turn if battle continues
        if (result.success && !result.battleEnded) {
            this._startNewTurn();
        }

        return result;
    }

    /**
     * Execute an ability
     * @param {Object} user - Monster using the ability
     * @param {Object} target - Target monster
     * @param {string} abilityId - Ability ID
     * @returns {Object} Ability result
     * @private
     */
    _executeAbility(user, target, abilityId) {
        // Get ability data
        const ability = this._monsterSystem.getAbility(abilityId);

        if (!ability) {
            return { success: false, message: 'Ability not found' };
        }

        // Check if ability has PP left
        const abilityIndex = user.abilities.indexOf(abilityId);

        if (abilityIndex === -1) {
            return { success: false, message: 'Monster does not know this ability' };
        }

        // Calculate hit success
        const accuracy = ability.accuracy;
        const hitSuccess = Math.random() * 100 <= accuracy;

        if (!hitSuccess) {
            return {
                success: true,
                hit: false,
                message: `${user.name}'s ${ability.name} missed!`
            };
        }

        // Calculate damage for damaging moves
        let damage = 0;
        let typeEffectiveness = 1;

        if (ability.category === 'physical' || ability.category === 'special') {
            // Calculate base damage
            const attackStat = ability.category === 'physical' ? user.stats.attack : user.stats.specialAttack;
            const defenseStat = ability.category === 'physical' ? target.stats.defense : target.stats.specialDefense;

            // Base formula: ((2 * Level / 5 + 2) * Power * Attack / Defense / 50) + 2
            const baseDamage = ((2 * user.level / 5 + 2) * ability.power * attackStat / defenseStat / 50) + 2;

            // Apply STAB (Same Type Attack Bonus)
            const stab = ability.type === user.type ? 1.5 : 1;

            // Calculate type effectiveness
            typeEffectiveness = this._calculateTypeEffectiveness(ability.type, target.type);

            // Calculate random factor (0.85 to 1.0)
            const random = 0.85 + Math.random() * 0.15;

            // Calculate final damage
            damage = Math.floor(baseDamage * stab * typeEffectiveness * random);
        }

        // Apply damage
        let damageResult = null;

        if (damage > 0) {
            damageResult = this._monsterSystem.applyDamage(target, damage);
        }

        // Apply ability effects
        const effectResults = [];

        if (ability.effects && ability.effects.length > 0) {
            ability.effects.forEach(effect => {
                // Check effect chance
                const effectChance = effect.chance || 100;
                const effectSuccess = Math.random() * 100 <= effectChance;

                if (effectSuccess) {
                    let effectResult;

                    switch (effect.type) {
                        case 'stat':
                            // Determine target monster
                            const statTarget = effect.target === 'user' ? user : target;

                            // Apply stat change
                            // Note: In a full implementation, we would track and apply stat stages
                            effectResult = {
                                type: 'stat',
                                target: statTarget.name,
                                stat: effect.stat,
                                stages: effect.stages
                            };
                            break;

                        case 'status':
                            // Determine target monster
                            const statusTarget = effect.target === 'user' ? user : target;

                            // Apply status effect
                            const statusApplied = this._monsterSystem.applyStatus(statusTarget, effect.status);

                            effectResult = {
                                type: 'status',
                                target: statusTarget.name,
                                status: effect.status,
                                applied: statusApplied
                            };
                            break;

                        case 'healing':
                            // Determine target monster
                            const healingTarget = effect.target === 'user' ? user : target;

                            // Calculate heal amount (percentage of max HP)
                            const healAmount = Math.floor(healingTarget.stats.hp * (effect.percentage / 100));

                            // Apply healing
                            const healResult = this._monsterSystem.healMonster(healingTarget, healAmount);

                            effectResult = {
                                type: 'healing',
                                target: healingTarget.name,
                                amount: healResult.healAmount
                            };
                            break;
                    }

                    if (effectResult) {
                        effectResults.push(effectResult);
                    }
                }
            });
        }

        // Check if battle has ended
        let battleEnded = false;
        let battleResult = null;

        if (damageResult && damageResult.fainted) {
            if (target === this._battleState.activeEnemyMonster) {
                // Enemy monster fainted
                const nextEnemyMonster = this._getNextMonster('enemy');

                if (nextEnemyMonster) {
                    // Switch to next enemy monster
                    this._battleState.activeEnemyMonster = nextEnemyMonster;
                } else {
                    // All enemy monsters fainted, battle won
                    battleEnded = true;
                    battleResult = { winner: 'player' };

                    // Award experience
                    const expYield = this._monsterSystem.getExperienceYield(target);
                    const expResult = this._monsterSystem.awardExperience(user, expYield);

                    // Check for evolution
                    if (expResult.canEvolve) {
                        battleResult.canEvolve = true;
                        battleResult.evolutionData = {
                            monster: user,
                            evolutionId: expResult.evolutionId
                        };
                    }

                    this.endBattle(battleResult);
                }
            } else if (target === this._battleState.activePlayerMonster) {
                // Player monster fainted
                const nextPlayerMonster = this._getNextMonster('player');

                if (nextPlayerMonster) {
                    // Ask player to switch (handled by BattleScene)
                    battleResult = { needSwitch: true };
                } else {
                    // All player monsters fainted, battle lost
                    battleEnded = true;
                    battleResult = { winner: 'enemy' };
                    this.endBattle(battleResult);
                }
            }
        }

        // Create ability result
        const abilityResult = {
            success: true,
            hit: true,
            user: user.name,
            target: target.name,
            ability: ability.name,
            damage: damage,
            typeEffectiveness: typeEffectiveness,
            effects: effectResults,
            damageResult: damageResult,
            battleEnded: battleEnded,
            battleResult: battleResult,
            message: `${user.name} used ${ability.name}!`
        };

        // Add type effectiveness message
        if (typeEffectiveness > 1) {
            abilityResult.message += " It's super effective!";
        } else if (typeEffectiveness < 1 && typeEffectiveness > 0) {
            abilityResult.message += " It's not very effective...";
        } else if (typeEffectiveness === 0) {
            abilityResult.message += " It has no effect!";
        }

        return abilityResult;
    }

    /**
     * Use an item
     * @param {string} itemId - Item ID
     * @param {string} targetId - Target monster ID
     * @returns {Object} Item use result
     * @private
     */
    _useItem(itemId, targetId) {
        // Get item data
        const item = dataManager.get('items', itemId);

        if (!item) {
            return { success: false, message: 'Item not found' };
        }

        // Find target monster
        let target = null;

        if (targetId) {
            // Check player team for target
            this._battleState.playerTeam.forEach(monster => {
                if (monster.id === targetId) {
                    target = monster;
                }
            });
        } else {
            // Default to active player monster
            target = this._battleState.activePlayerMonster;
        }

        if (!target) {
            return { success: false, message: 'Target monster not found' };
        }

        // Apply item effect based on type
        let result;

        switch (item.type) {
            case ITEM_TYPES.POTION:
                // Heal monster
                const healAmount = item.effect.amount || 20;
                const healResult = this._monsterSystem.healMonster(target, healAmount);

                result = {
                    success: true,
                    type: 'heal',
                    target: target.name,
                    amount: healResult.healAmount,
                    message: `Used ${item.name} on ${target.name}. Restored ${healResult.healAmount} HP!`
                };
                break;

            case ITEM_TYPES.BALL:
                // Only usable on wild monsters
                if (this._battleState.battleType !== 'wild') {
                    return { success: false, message: "Can't use this on a trainer's monster!" };
                }

                // Attempt to catch monster
                const ballBonus = item.effect.catchRate || 1;
                const catchResult = this._monsterSystem.attemptCatch(this._battleState.activeEnemyMonster, {
                    ballBonus: ballBonus,
                    statusBonus: this._battleState.activeEnemyMonster.status !== null
                });

                if (catchResult) {
                    // Monster caught, end battle
                    const battleResult = {
                        winner: 'player',
                        caught: true,
                        monster: this._battleState.activeEnemyMonster
                    };

                    this.endBattle(battleResult);

                    result = {
                        success: true,
                        type: 'catch',
                        caught: true,
                        monster: this._battleState.activeEnemyMonster.name,
                        battleEnded: true,
                        battleResult: battleResult,
                        message: `Caught ${this._battleState.activeEnemyMonster.name}!`
                    };
                } else {
                    // Failed to catch, monster breaks free
                    result = {
                        success: true,
                        type: 'catch',
                        caught: false,
                        monster: this._battleState.activeEnemyMonster.name,
                        message: `${this._battleState.activeEnemyMonster.name} broke free!`
                    };
                }
                break;

            default:
                result = { success: false, message: 'Item cannot be used in battle' };
        }

        // Log item use
        if (this._debug) {
            console.log(`BattleSystem: Used item ${item.name}`, result);
        }

        // Emit item use event
        if (this._events) {
            this._events.emit(EVENTS.ITEM_USED, item, target, result);
        }

        return result;
    }

    /**
     * Switch active monster
     * @param {string} team - Team to switch ('player' or 'enemy')
     * @param {number} index - Index of monster to switch to
     * @returns {Object} Switch result
     * @private
     */
    _switchMonster(team, index) {
        const teamArray = team === 'player' ? this._battleState.playerTeam : this._battleState.enemyTeam;

        // Check if index is valid
        if (index < 0 || index >= teamArray.length) {
            return { success: false, message: 'Invalid monster index' };
        }

        // Check if monster is already active
        const currentActive = team === 'player' ? this._battleState.activePlayerMonster : this._battleState.activeEnemyMonster;

        if (currentActive === teamArray[index]) {
            return { success: false, message: 'Monster is already active' };
        }

        // Check if monster has fainted
        if (teamArray[index].currentHp <= 0) {
            return { success: false, message: 'Cannot switch to fainted monster' };
        }

        // Switch monster
        if (team === 'player') {
            const previousMonster = this._battleState.activePlayerMonster;
            this._battleState.activePlayerMonster = teamArray[index];

            // Log switch
            if (this._debug) {
                console.log(`BattleSystem: Player switched from ${previousMonster.name} to ${teamArray[index].name}`);
            }

            return {
                success: true,
                team: 'player',
                previous: previousMonster.name,
                current: teamArray[index].name,
                message: `Go, ${teamArray[index].name}!`
            };
        } else {
            const previousMonster = this._battleState.activeEnemyMonster;
            this._battleState.activeEnemyMonster = teamArray[index];

            // Log switch
            if (this._debug) {
                console.log(`BattleSystem: Enemy switched from ${previousMonster.name} to ${teamArray[index].name}`);
            }

            return {
                success: true,
                team: 'enemy',
                previous: previousMonster.name,
                current: teamArray[index].name,
                message: `Enemy sent out ${teamArray[index].name}!`
            };
        }
    }

    /**
     * Attempt to run from battle
     * @returns {Object} Run attempt result
     * @private
     */
    _attemptRun() {
        // Can only run from wild battles
        if (this._battleState.battleType !== 'wild') {
            return { success: false, message: "Can't run from a trainer battle!" };
        }

        // Calculate escape chance
        // Formula: (Player Speed * 128 / Enemy Speed) + 30 * Attempts
        const playerSpeed = this._battleState.activePlayerMonster.stats.speed;
        const enemySpeed = this._battleState.activeEnemyMonster.stats.speed;

        // Track run attempts
        this._battleState.runAttempts = (this._battleState.runAttempts || 0) + 1;

        const escapeChance = Math.floor((playerSpeed * 128 / enemySpeed) + 30 * this._battleState.runAttempts);

        // Random number from 0-255
        const randomValue = Math.floor(Math.random() * 256);

        // Success if random value is less than escape chance
        const success = randomValue < escapeChance;

        if (success) {
            // End battle with escape result
            const battleResult = { escaped: true };
            this.endBattle(battleResult);

            return {
                success: true,
                escaped: true,
                battleEnded: true,
                battleResult: battleResult,
                message: 'Got away safely!'
            };
        } else {
            return {
                success: true,
                escaped: false,
                message: "Couldn't escape!"
            };
        }
    }

    /**
     * Execute enemy action
     * @returns {Object} Enemy action result
     * @private
     */
    _executeEnemyAction() {
        // Skip if no active enemy monster
        if (!this._battleState.activeEnemyMonster) {
            return { success: false, message: 'No active enemy monster' };
        }

        // Get active enemy monster
        const enemyMonster = this._battleState.activeEnemyMonster;

        // Get available abilities
        const abilities = enemyMonster.abilities || [];

        if (abilities.length === 0) {
            return { success: false, message: 'Enemy has no abilities' };
        }

        // Simple AI: Choose random ability
        const randomAbilityId = abilities[Math.floor(Math.random() * abilities.length)];

        // Execute ability
        return this._executeAbility(enemyMonster, this._battleState.activePlayerMonster, randomAbilityId);
    }

    /**
     * Get next available monster
     * @param {string} team - Team to check ('player' or 'enemy')
     * @returns {Object|null} Next monster or null if none available
     * @private
     */
    _getNextMonster(team) {
        const teamArray = team === 'player' ? this._battleState.playerTeam : this._battleState.enemyTeam;
        const currentActive = team === 'player' ? this._battleState.activePlayerMonster : this._battleState.activeEnemyMonster;

        // Find first non-fainted monster that isn't current
        for (const monster of teamArray) {
            if (monster !== currentActive && monster.currentHp > 0) {
                return monster;
            }
        }

        return null;
    }

    /**
     * Start a new turn
     * @private
     */
    _startNewTurn() {
        this._battleState.turn++;

        // Apply status effects
        this._applyStatusEffects();

        // Apply weather effects
        this._applyWeatherEffects();

        if (this._debug) {
            console.log(`BattleSystem: Turn ${this._battleState.turn} started`);
        }
    }

    /**
     * Apply status effects
     * @private
     */
    _applyStatusEffects() {
        // Apply status effects to active monsters
        const activeMonsters = [
            this._battleState.activePlayerMonster,
            this._battleState.activeEnemyMonster
        ];

        activeMonsters.forEach(monster => {
            if (monster && monster.status) {
                switch (monster.status) {
                    case 'burn':
                        // Burn: Lose 1/8 of max HP
                        const burnDamage = Math.max(1, Math.floor(monster.stats.hp / 8));
                        this._monsterSystem.applyDamage(monster, burnDamage);
                        break;

                    case 'poison':
                        // Poison: Lose 1/8 of max HP
                        const poisonDamage = Math.max(1, Math.floor(monster.stats.hp / 8));
                        this._monsterSystem.applyDamage(monster, poisonDamage);
                        break;
                }
            }
        });
    }

    /**
     * Apply weather effects
     * @private
     */
    _applyWeatherEffects() {
        // Skip if no weather
        if (!this._battleState.weather) {
            return;
        }

        // Apply weather effects
        switch (this._battleState.weather) {
            case 'rain':
                // Rain: Water moves boosted, Fire moves weakened
                break;

            case 'sun':
                // Sun: Fire moves boosted, Water moves weakened
                break;

            case 'hail':
                // Hail: Non-Ice types take damage
                break;
        }
    }

    /**
     * Calculate type effectiveness
     * @param {string} attackType - Type of attack
     * @param {string} defenderType - Type of defender
     * @returns {number} Type effectiveness multiplier
     * @private
     */
    _calculateTypeEffectiveness(attackType, defenderType) {
        // Get effectiveness from type chart
        if (this._typeChart[attackType] && this._typeChart[attackType][defenderType] !== undefined) {
            return this._typeChart[attackType][defenderType];
        }

        // Default to neutral effectiveness
        return 1;
    }

    /**
     * Get Monster System
     * @returns {MonsterSystem} Monster system instance
     */
    getMonsterSystem() {
        return this._monsterSystem;
    }
}