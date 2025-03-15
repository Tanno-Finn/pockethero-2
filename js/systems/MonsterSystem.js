/**
 * MonsterSystem Class
 * Handles monster creation, stats calculation, evolution, and ability management
 * Provides utility methods for monster-related operations
 */
class MonsterSystem {
    /**
     * Create a new MonsterSystem
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
         * The event system
         * @type {EventSystem}
         * @private
         */
        this._events = scene.game.registry.get('eventSystem');

        /**
         * Debug mode flag
         * @type {boolean}
         * @private
         */
        this._debug = GAME_CONFIG.DEBUG;

        if (this._debug) {
            console.log('MonsterSystem: Initialized');
        }
    }

    /**
     * Create a monster instance from data
     * @param {string} monsterId - ID of monster to create
     * @param {number} level - Level of monster
     * @param {Object} options - Additional options
     * @param {Object} options.ivs - Individual values (null for random)
     * @param {Object} options.evs - Effort values (null for zero)
     * @param {Array} options.abilities - Specific abilities (null for level-based)
     * @returns {Object} Monster instance
     */
    createMonster(monsterId, level, options = {}) {
        // Get monster data
        const monsterData = dataManager.get('monsters', monsterId);

        if (!monsterData) {
            console.error(`Monster not found: ${monsterId}`);
            return null;
        }

        // Default level
        level = level || 1;

        // Generate IVs (random if not provided)
        const ivs = options.ivs || this._generateIVs();

        // Generate EVs (zero if not provided)
        const evs = options.evs || this._generateEVs();

        // Calculate stats
        const stats = this._calculateStats(monsterData.baseStats, level, ivs, evs);

        // Determine abilities based on level
        const abilities = options.abilities || this._getAbilitiesForLevel(monsterData, level);

        // Create monster instance
        const monster = {
            id: monsterData.id,
            name: monsterData.name,
            type: monsterData.type,
            level: level,
            experience: this._getLevelExperience(level, monsterData.growthRate),
            nextLevelExperience: this._getLevelExperience(level + 1, monsterData.growthRate),
            baseStats: monsterData.baseStats,
            stats: stats,
            currentHp: stats.hp,
            ivs: ivs,
            evs: evs,
            abilities: abilities,
            status: null,
            catchRate: monsterData.catchRate,
            shape: monsterData.shape
        };

        if (this._debug) {
            console.log(`MonsterSystem: Created monster ${monsterData.name} (Lv. ${level})`, monster);
        }

        return monster;
    }

    /**
     * Generate random IVs for a monster
     * @returns {Object} Object with IV values for each stat
     * @private
     */
    _generateIVs() {
        return {
            hp: Math.floor(Math.random() * 32),
            attack: Math.floor(Math.random() * 32),
            defense: Math.floor(Math.random() * 32),
            specialAttack: Math.floor(Math.random() * 32),
            specialDefense: Math.floor(Math.random() * 32),
            speed: Math.floor(Math.random() * 32)
        };
    }

    /**
     * Generate default EVs for a monster (all zero)
     * @returns {Object} Object with EV values for each stat
     * @private
     */
    _generateEVs() {
        return {
            hp: 0,
            attack: 0,
            defense: 0,
            specialAttack: 0,
            specialDefense: 0,
            speed: 0
        };
    }

    /**
     * Calculate monster stats based on base stats, level, IVs, and EVs
     * @param {Object} baseStats - Base stats
     * @param {number} level - Monster level
     * @param {Object} ivs - Individual values
     * @param {Object} evs - Effort values
     * @returns {Object} Calculated stats
     * @private
     */
    _calculateStats(baseStats, level, ivs, evs) {
        const stats = {};

        // Calculate HP
        stats.hp = Math.floor((2 * baseStats.hp + ivs.hp + Math.floor(evs.hp / 4)) * level / 100) + level + 10;

        // Calculate other stats
        ['attack', 'defense', 'specialAttack', 'specialDefense', 'speed'].forEach(stat => {
            stats[stat] = Math.floor((2 * baseStats[stat] + ivs[stat] + Math.floor(evs[stat] / 4)) * level / 100 + 5);
        });

        return stats;
    }

    /**
     * Get abilities available at a specific level
     * @param {Object} monsterData - Monster data
     * @param {number} level - Monster level
     * @returns {Array} Array of ability IDs
     * @private
     */
    _getAbilitiesForLevel(monsterData, level) {
        const abilities = [];

        // Check each ability's required level
        Object.entries(monsterData.abilityLevels || {}).forEach(([abilityId, requiredLevel]) => {
            if (requiredLevel <= level) {
                abilities.push(abilityId);
            }
        });

        // Sort abilities by level learned
        abilities.sort((a, b) => {
            const levelA = monsterData.abilityLevels[a] || 0;
            const levelB = monsterData.abilityLevels[b] || 0;
            return levelA - levelB;
        });

        // Return at most 4 abilities (prioritizing higher level ones)
        return abilities.slice(-4);
    }

    /**
     * Get experience required for a level based on growth rate
     * @param {number} level - Target level
     * @param {string} growthRate - Growth rate ('fast', 'medium', 'slow')
     * @returns {number} Experience required
     * @private
     */
    _getLevelExperience(level, growthRate) {
        // Skip invalid levels
        if (level <= 0) {
            return 0;
        }

        let experience = 0;

        // Calculate based on growth rate
        switch (growthRate) {
            case 'fast':
                experience = Math.floor(0.8 * Math.pow(level, 3));
                break;

            case 'medium':
                experience = Math.floor(Math.pow(level, 3));
                break;

            case 'slow':
                experience = Math.floor(1.25 * Math.pow(level, 3));
                break;

            default:
                // Default to medium growth rate
                experience = Math.floor(Math.pow(level, 3));
        }

        return experience;
    }

    /**
     * Get experience yield when defeating a monster
     * @param {Object} monster - Defeated monster
     * @returns {number} Experience yield
     */
    getExperienceYield(monster) {
        const monsterData = dataManager.get('monsters', monster.id);

        if (!monsterData) {
            return 0;
        }

        // Base formula: (Base EXP Yield * Level) / 7
        return Math.floor((monsterData.expYield * monster.level) / 7);
    }

    /**
     * Award experience to a monster
     * @param {Object} monster - Monster to award experience to
     * @param {number} amount - Amount of experience to award
     * @returns {Object} Object containing level up information
     */
    awardExperience(monster, amount) {
        const monsterData = dataManager.get('monsters', monster.id);

        if (!monsterData) {
            return { leveledUp: false };
        }

        const originalLevel = monster.level;

        // Add experience
        monster.experience += amount;

        // Check if monster leveled up
        let levelUp = false;
        let newAbilities = [];

        // While experience is above threshold for next level
        while (monster.experience >= monster.nextLevelExperience && monster.level < GAME_CONFIG.MAX_MONSTER_LEVEL) {
            // Level up
            monster.level++;
            levelUp = true;

            // Recalculate stats
            const newStats = this._calculateStats(monster.baseStats, monster.level, monster.ivs, monster.evs);

            // Store HP difference
            const hpDifference = newStats.hp - monster.stats.hp;

            // Update stats
            monster.stats = newStats;

            // Add HP difference to current HP
            monster.currentHp += hpDifference;

            // Check for new abilities
            const newLevel = monster.level;
            Object.entries(monsterData.abilityLevels || {}).forEach(([abilityId, requiredLevel]) => {
                if (requiredLevel === newLevel) {
                    newAbilities.push(abilityId);
                }
            });

            // Update next level experience
            monster.nextLevelExperience = this._getLevelExperience(monster.level + 1, monsterData.growthRate);

            if (this._debug) {
                console.log(`MonsterSystem: ${monster.name} leveled up to ${monster.level}`);
            }
        }

        // If monster leveled up, check for evolution
        let canEvolve = false;
        let evolutionId = null;

        if (levelUp && monsterData.evolution && monsterData.evolution.level && monster.level >= monsterData.evolution.level) {
            canEvolve = true;
            evolutionId = monsterData.evolution.evolvesTo;
        }

        return {
            leveledUp: levelUp,
            levelsGained: monster.level - originalLevel,
            newAbilities: newAbilities,
            canEvolve: canEvolve,
            evolutionId: evolutionId
        };
    }

    /**
     * Evolve a monster
     * @param {Object} monster - Monster to evolve
     * @returns {Object} Evolved monster
     */
    evolveMonster(monster) {
        const monsterData = dataManager.get('monsters', monster.id);

        if (!monsterData || !monsterData.evolution || !monsterData.evolution.evolvesTo) {
            return monster;
        }

        const evolutionId = monsterData.evolution.evolvesTo;
        const evolutionData = dataManager.get('monsters', evolutionId);

        if (!evolutionData) {
            console.error(`Evolution not found: ${evolutionId}`);
            return monster;
        }

        // Create evolved monster
        const evolvedMonster = this.createMonster(evolutionId, monster.level, {
            ivs: monster.ivs,
            evs: monster.evs
        });

        // Transfer experience and abilities
        evolvedMonster.experience = monster.experience;
        evolvedMonster.nextLevelExperience = monster.nextLevelExperience;

        // Transfer current HP ratio
        const hpRatio = monster.currentHp / monster.stats.hp;
        evolvedMonster.currentHp = Math.floor(evolvedMonster.stats.hp * hpRatio);

        if (this._debug) {
            console.log(`MonsterSystem: ${monster.name} evolved into ${evolvedMonster.name}`);
        }

        // Emit evolution event
        if (this._events) {
            this._events.emit(EVENTS.MONSTER_EVOLVE, monster, evolvedMonster);
        }

        return evolvedMonster;
    }

    /**
     * Get ability data by ID
     * @param {string} abilityId - Ability ID
     * @returns {Object} Ability data
     */
    getAbility(abilityId) {
        return dataManager.get('abilities', abilityId);
    }

    /**
     * Apply damage to a monster
     * @param {Object} monster - Target monster
     * @param {number} damage - Amount of damage
     * @returns {Object} Object containing damage results
     */
    applyDamage(monster, damage) {
        const previousHp = monster.currentHp;

        // Apply damage
        monster.currentHp = Math.max(0, monster.currentHp - damage);

        // Check if monster fainted
        const fainted = monster.currentHp === 0;

        // Calculate damage percentage
        const damagePercentage = Math.floor((damage / monster.stats.hp) * 100);

        if (fainted && this._events) {
            this._events.emit(EVENTS.MONSTER_FAINTED, monster);
        }

        return {
            monster: monster,
            damage: damage,
            previousHp: previousHp,
            currentHp: monster.currentHp,
            damagePercentage: damagePercentage,
            fainted: fainted
        };
    }

    /**
     * Heal a monster
     * @param {Object} monster - Monster to heal
     * @param {number} amount - Amount to heal (if not specified, fully heal)
     * @returns {Object} Object containing heal results
     */
    healMonster(monster, amount) {
        const previousHp = monster.currentHp;

        // Apply healing
        if (amount === undefined) {
            // Full heal
            monster.currentHp = monster.stats.hp;
        } else {
            // Partial heal
            monster.currentHp = Math.min(monster.stats.hp, monster.currentHp + amount);
        }

        // Calculate heal amount
        const healAmount = monster.currentHp - previousHp;

        // Calculate heal percentage
        const healPercentage = Math.floor((healAmount / monster.stats.hp) * 100);

        return {
            monster: monster,
            healAmount: healAmount,
            previousHp: previousHp,
            currentHp: monster.currentHp,
            healPercentage: healPercentage
        };
    }

    /**
     * Apply a status effect to a monster
     * @param {Object} monster - Target monster
     * @param {string} status - Status effect to apply
     * @returns {boolean} True if status was applied
     */
    applyStatus(monster, status) {
        // Skip if monster already has a status
        if (monster.status) {
            return false;
        }

        // Apply status
        monster.status = status;

        return true;
    }

    /**
     * Clear a monster's status effect
     * @param {Object} monster - Target monster
     * @returns {string} Previous status
     */
    clearStatus(monster) {
        const previousStatus = monster.status;
        monster.status = null;
        return previousStatus;
    }

    /**
     * Calculate catch success probability
     * @param {Object} monster - Monster to catch
     * @param {Object} options - Catch options
     * @param {number} options.ballBonus - Catch rate bonus from ball type
     * @param {boolean} options.statusBonus - Whether to apply status bonus
     * @returns {number} Catch probability (0-1)
     */
    calculateCatchProbability(monster, options = {}) {
        const ballBonus = options.ballBonus || 1;
        const statusBonus = options.statusBonus ? 1.5 : 1;

        // Base formula: ((3 * HP_max - 2 * HP_current) * catchRate * ballBonus * statusBonus) / (3 * HP_max)
        const maxHp = monster.stats.hp;
        const currentHp = monster.currentHp;

        const catchRate = monster.catchRate || 0;

        const catchProbability = ((3 * maxHp - 2 * currentHp) * catchRate * ballBonus * statusBonus) / (3 * maxHp);

        // Clamp probability between 0 and 255
        const clampedProbability = Math.min(255, Math.max(0, catchProbability));

        // Convert to 0-1 range
        return clampedProbability / 255;
    }

    /**
     * Attempt to catch a monster
     * @param {Object} monster - Monster to catch
     * @param {Object} options - Catch options
     * @param {number} options.ballBonus - Catch rate bonus from ball type
     * @param {boolean} options.statusBonus - Whether to apply status bonus
     * @returns {boolean} True if catch was successful
     */
    attemptCatch(monster, options = {}) {
        const probability = this.calculateCatchProbability(monster, options);

        // Random check
        const success = Math.random() < probability;

        if (success && this._events) {
            this._events.emit(EVENTS.MONSTER_CAUGHT, monster);
        }

        return success;
    }

    /**
     * Create a shape sprite for a monster
     * @param {Object} monster - Monster data
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} scale - Scale factor
     * @returns {Phaser.GameObjects.GameObject} Shape sprite
     */
    createMonsterSprite(monster, x, y, scale = 1) {
        const shapeData = monster.shape || {
            form: 'circle',
            mainColor: COLORS.MONSTER[monster.type] || 0xffffff,
            accentColor: 0xffffff
        };

        let sprite;

        // Create shape based on form
        switch (shapeData.form) {
            case 'square':
                sprite = this._scene.add.rectangle(x, y, 50 * scale, 50 * scale, shapeData.mainColor);
                break;

            case 'triangle':
                sprite = this._scene.add.triangle(x, y, 0, 32 * scale, 28 * scale, -16 * scale, -28 * scale, -16 * scale, shapeData.mainColor);
                break;

            case 'star':
                sprite = this._scene.add.star(x, y, 5, 15 * scale, 30 * scale, shapeData.mainColor);
                break;

            case 'circle':
            default:
                sprite = this._scene.add.circle(x, y, 25 * scale, shapeData.mainColor);
                break;
        }

        // Add accent shape
        let accentSprite;

        switch (shapeData.form) {
            case 'square':
                accentSprite = this._scene.add.rectangle(x, y, 20 * scale, 20 * scale, shapeData.accentColor);
                break;

            case 'triangle':
                accentSprite = this._scene.add.triangle(x, y, 0, 15 * scale, 13 * scale, -8 * scale, -13 * scale, -8 * scale, shapeData.accentColor);
                break;

            case 'star':
                accentSprite = this._scene.add.star(x, y, 5, 5 * scale, 10 * scale, shapeData.accentColor);
                break;

            case 'circle':
            default:
                accentSprite = this._scene.add.circle(x, y, 10 * scale, shapeData.accentColor);
                break;
        }

        // Create container for main shape and accent
        const container = this._scene.add.container(x, y, [sprite, accentSprite]);

        // Reset position since container is already at x,y
        sprite.x = 0;
        sprite.y = 0;
        accentSprite.x = 0;
        accentSprite.y = 0;

        // Store monster reference
        container.monster = monster;

        return container;
    }
}