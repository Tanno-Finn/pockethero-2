/**
 * Game constants for MonsterQuest
 * Contains configurations, scene keys, and game state values
 */

// Scene keys
const SCENES = {
    BOOT: 'BootScene',
    PRELOAD: 'PreloadScene',
    WORLD: 'WorldScene',
    BATTLE: 'BattleScene',
    MENU: 'MenuScene',
    DIALOG: 'DialogScene',
    TRANSITION: 'TransitionScene'
};

// Game config
const GAME_CONFIG = {
    // Display settings
    WIDTH: 800,
    HEIGHT: 600,
    TILE_SIZE: 32,

    // Gameplay settings
    PLAYER_SPEED: 4, // tiles per second
    ENCOUNTER_RATE: 0.1, // probability per step in encounter zone
    MAX_PARTY_SIZE: 6,
    MAX_MONSTER_LEVEL: 100,

    // Debug settings
    DEBUG: true,
    SHOW_GRID: true
};

// Entity types
const ENTITY_TYPES = {
    PLAYER: 'player',
    NPC: 'npc',
    MONSTER: 'monster',
    ITEM: 'item'
};

// Tile types
const TILE_TYPES = {
    FLOOR: 0,
    WALL: 1,
    GRASS: 2,
    WATER: 3,
    DOOR: 4,
    ENCOUNTER: 5
};

// Monster types
const MONSTER_TYPES = {
    NORMAL: 'normal',
    FIRE: 'fire',
    WATER: 'water',
    GRASS: 'grass',
    ELECTRIC: 'electric',
    ICE: 'ice',
    FIGHTING: 'fighting',
    POISON: 'poison',
    GROUND: 'ground',
    FLYING: 'flying',
    PSYCHIC: 'psychic',
    BUG: 'bug',
    ROCK: 'rock',
    GHOST: 'ghost',
    DRAGON: 'dragon'
};

// Monster stat names
const MONSTER_STATS = {
    HP: 'hp',
    ATTACK: 'attack',
    DEFENSE: 'defense',
    SP_ATTACK: 'specialAttack',
    SP_DEFENSE: 'specialDefense',
    SPEED: 'speed'
};

// Item types
const ITEM_TYPES = {
    POTION: 'potion',
    BALL: 'ball',
    KEY: 'key',
    EVOLUTION: 'evolution',
    BATTLE: 'battle'
};

// Direction constants
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// Game events
const EVENTS = {
    // Player events
    PLAYER_MOVE: 'player-move',
    PLAYER_INTERACT: 'player-interact',
    PLAYER_ZONE_CHANGE: 'player-zone-change',

    // Battle events
    BATTLE_START: 'battle-start',
    BATTLE_END: 'battle-end',
    BATTLE_ACTION: 'battle-action',
    MONSTER_LEVEL_UP: 'monster-level-up',
    MONSTER_EVOLVE: 'monster-evolve',
    MONSTER_FAINTED: 'monster-fainted',
    MONSTER_CAUGHT: 'monster-caught',

    // UI events
    DIALOG_START: 'dialog-start',
    DIALOG_END: 'dialog-end',
    MENU_OPEN: 'menu-open',
    MENU_CLOSE: 'menu-close',

    // Game state events
    GAME_SAVE: 'game-save',
    GAME_LOAD: 'game-load',
    ITEM_ACQUIRED: 'item-acquired',
    ITEM_USED: 'item-used',
    QUEST_UPDATE: 'quest-update'
};

// Colors for shape-based graphics
const COLORS = {
    // Entity colors
    PLAYER: 0x3498db,
    NPC: 0xe74c3c,
    MONSTER: {
        NORMAL: 0xa9a9a9,
        FIRE: 0xe74c3c,
        WATER: 0x3498db,
        GRASS: 0x2ecc71,
        ELECTRIC: 0xf1c40f,
        ICE: 0x00ffff,
        FIGHTING: 0x8b0000,
        POISON: 0x9b59b6,
        GROUND: 0xd35400,
        FLYING: 0x85c1e9,
        PSYCHIC: 0xff69b4,
        BUG: 0xadff2f,
        ROCK: 0xa0522d,
        GHOST: 0x663399,
        DRAGON: 0x7d3c98
    },
    ITEM: 0xf1c40f,

    // Tile colors
    TILE: {
        FLOOR: 0xffffff,
        WALL: 0x2c3e50,
        GRASS: 0x2ecc71,
        WATER: 0x3498db,
        DOOR: 0x8b4513
    },

    // UI colors
    UI: {
        BACKGROUND: 0x2c3e50,
        TEXT: 0xffffff,
        BORDER: 0x95a5a6,
        BUTTON: 0x3498db,
        BUTTON_HOVER: 0x2980b9,
        HP_BAR: 0x2ecc71,
        EXP_BAR: 0x3498db
    }
};