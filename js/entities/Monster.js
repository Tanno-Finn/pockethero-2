/**
 * Monster Class
 * Represents a monster entity with stats, abilities, and battle functionality
 */
class Monster {
    /**
     * Create a new Monster
     * @param {Object} data - Monster data from MonsterSystem
     */
    constructor(data) {
        /**
         * Monster ID
         * @type {string}
         */
        this.id = data.id;

        /**
         * Monster name
         * @type {string}
         */
        this.name = data.name;

        /**
         * Monster type
         * @type {string}
         */
        this.type = data.type;

        /**
         * Monster level
         * @type {number}
         */
        this.level = data.level || 1;

        /**
         * Current experience points
         * @type {number}
         */
        this.experience = data.experience || 0;

        /**
         * Experience needed for next level
         * @type {number}
         */
        this.nextLevelExperience = data.nextLevelExperience || 0;

        /**
         * Base stats
         * @type {Object}
         */
        this.baseStats = data.baseStats || {};

        /**
         * Calculated stats
         * @type {Object}
         */
        this.stats = data.stats || {};

        /**
         * Current HP
         * @type {number}
         */
        this.currentHp = data.currentHp || this.stats.hp;

        /**
         * Individual values
         * @type {Object}
         */
        this.ivs = data.ivs || {};

        /**
         * Effort values
         * @type {Object}
         */
        this.evs = data.evs || {};

        /**
         * List of ability IDs
         * @type {Array}
         */
        this.abilities = data.abilities || [];

        /**
         * Current status effect
         * @type {string|null}
         */
        this.status = data.status || null;

        /**
         * Base catch rate
         * @type {number}
         */
        this.catchRate = data.catchRate || 0;

        /**
         * Visual shape data
         * @type {Object}
         */
        this.shape = data.shape || {};
    }

    /**
     * Check if monster has fainted
     * @returns {boolean} True if monster has fainted (HP is 0)
     */
    hasFainted() {
        return this.currentHp <= 0;
    }

    /**
     * Heal the monster
     * @param {number} amount - Amount to heal (if not specified, fully heal)
     * @returns {number} Amount healed
     */
    heal(amount) {
        const previousHp = this.currentHp;

        if (amount === undefined) {
            // Full heal
            this.currentHp = this.stats.hp;
        } else {
            // Partial heal
            this.currentHp = Math.min(this.stats.hp, this.currentHp + amount);
        }

        // Return amount healed
        return this.currentHp - previousHp;
    }

    /**
     * Take damage
     * @param {number} damage - Amount of damage to take
     * @returns {boolean} True if monster fainted from this damage
     */
    takeDamage(damage) {
        // Apply damage
        this.currentHp = Math.max(0, this.currentHp - damage);

        // Return whether monster fainted
        return this.hasFainted();
    }

    /**
     * Convert to a plain object
     * @returns {Object} Plain object representation of monster
     */
    toObject() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            level: this.level,
            experience: this.experience,
            nextLevelExperience: this.nextLevelExperience,
            baseStats: this.baseStats,
            stats: this.stats,
            currentHp: this.currentHp,
            ivs: this.ivs,
            evs: this.evs,
            abilities: this.abilities,
            status: this.status,
            catchRate: this.catchRate,
            shape: this.shape
        };
    }
}