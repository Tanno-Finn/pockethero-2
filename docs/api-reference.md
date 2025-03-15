# API Reference

This document provides a compact overview of all modules, functions, classes, and data schemas in the project. It serves as a quick reference to understand the codebase without examining every file in detail.

## Game Configuration

### Main Configuration (`js/main.js`)
- **Purpose**: Initializes Phaser and sets up game configuration

**Game Configuration**:
```javascript
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene]
};
```

## Scenes

### Boot Scene (`js/scenes/BootScene.js`)
- **Purpose**: Initial scene for game setup and loading essential assets

**Public Interface**:
```javascript
preload()                  // Load minimal assets needed for loading screen
create()                   // Initialize game settings and transition to PreloadScene
```

### Preload Scene (`js/scenes/PreloadScene.js`)
- **Purpose**: Handles loading of all game assets with loading bar

**Public Interface**:
```javascript
preload()                  // Load all game assets with progress bar
create()                   // Transition to MenuScene when loading completes
```

### Menu Scene (`js/scenes/MenuScene.js`)
- **Purpose**: Main menu interface for the game

**Public Interface**:
```javascript
create()                   // Create menu UI elements
startGame()                // Start the game and transition to GameScene
```

### Game Scene (`js/scenes/GameScene.js`)
- **Purpose**: Main gameplay scene

**Public Interface**:
```javascript
create()                   // Set up game world, entities, and systems
update(time, delta)        // Main game loop function
createPlayer(x, y)         // Create player entity at specified position
createLevel(levelKey)      // Load and create level from data
```

## Game Objects

### Player (`js/objects/Player.js`)
- **Purpose**: Player character class with movement and actions

**Properties**:
```javascript
player.health             // Current health points
player.score              // Current score
player.isJumping          // Boolean tracking jump state
```

**Methods**:
```javascript
update(delta)             // Update player state each frame
jump()                    // Make player jump
takeDamage(amount)        // Reduce player health
collectItem(item)         // Handle item collection
```

### Enemy (`js/objects/Enemy.js`)
- **Purpose**: Enemy entity with behavior patterns

**Properties**:
```javascript
enemy.health              // Current health points
enemy.speed               // Movement speed
enemy.damage              // Damage dealt to player on contact
```

**Methods**:
```javascript
update(delta)             // Update enemy state each frame
patrol(fromX, toX)        // Move between two points
attack(target)            // Attack specified target
```

## Utility Functions

### Math Utilities (`js/utils/math.js`)
- **Purpose**: Common math operations for game development

**Public Interface**:
```javascript
MathUtils.random(min, max)          // Random number between min and max
MathUtils.clamp(value, min, max)    // Clamp value between min and max
MathUtils.distance(x1, y1, x2, y2)  // Calculate distance between points
```

### Helpers (`js/utils/helpers.js`)
- **Purpose**: General utility functions

**Public Interface**:
```javascript
Helpers.generateId()      // Generate unique ID
Helpers.debounce(fn, ms)  // Debounce a function
```

## Data Management

### Level Manager (`js/data/LevelManager.js`)
- **Purpose**: Manages level data and creation

**Public Interface**:
```javascript
LevelManager.getLevelData(key)      // Get data for specific level
LevelManager.createLevel(scene, key) // Build level in specified scene
LevelManager.getTotalLevels()        // Get number of available levels
```

### Asset Manager (`js/data/AssetManager.js`)
- **Purpose**: Manages asset loading and keys

**Public Interface**:
```javascript
AssetManager.getAssetKeys(type)     // Get all asset keys for specified type
AssetManager.getAssetPath(key)      // Get file path for asset key
```

## Data Schemas

### Level Schema
```javascript
{
  "id": String,           // Unique level identifier
  "name": String,         // Display name
  "width": Number,        // Level width in tiles
  "height": Number,       // Level height in tiles
  "tileSize": Number,     // Size of each tile in pixels
  "tilemap": {
    "key": String,        // Preloaded tilemap key
    "tilesets": [
      {
        "name": String,   // Tileset name in Tiled
        "key": String     // Preloaded image key
      }
    ]
  },
  "entities": [           // Array of entities
    {
      "type": String,     // Entity type
      "x": Number,        // X position in tiles
      "y": Number,        // Y position in tiles
      "properties": {}    // Entity-specific properties
    }
  ],
  "background": String    // Background image key
}
```

### Entity Schema
```javascript
{
  "type": String,         // Entity type identifier
  "spritesheet": String,  // Spritesheet key
  "width": Number,        // Width in pixels
  "height": Number,       // Height in pixels
  "frames": {             // Animation frames
    "idle": { "start": Number, "end": Number, "rate": Number },
    "walk": { "start": Number, "end": Number, "rate": Number }
  },
  "physics": {            // Physics properties
    "bodyWidth": Number,  // Collision body width
    "bodyHeight": Number, // Collision body height
    "offsetX": Number,    // X offset for collision body
    "offsetY": Number     // Y offset for collision body
  },
  "properties": {}        // Type-specific properties
}
```

## Constants

### Game Constants
```javascript
const GAME_CONFIG = {
  PLAYER_SPEED: 160,
  JUMP_VELOCITY: -330,
  GRAVITY: 300
};
```

### Scene Keys
```javascript
const SCENES = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  MENU: 'MenuScene',
  GAME: 'GameScene',
  GAME_OVER: 'GameOverScene'
};
```

### Entity Types
```javascript
const ENTITY_TYPES = {
  PLAYER: 'player',
  ENEMY: 'enemy',
  COLLECTIBLE: 'collectible',
  PLATFORM: 'platform'
};
```

## Events

### Game Events
```javascript
// Common event strings
const EVENTS = {
    PLAYER_DAMAGE: 'player-damage',
    SCORE_CHANGE: 'score-change',
    LEVEL_COMPLETE: 'level-complete',
    GAME_OVER: 'game-over'
};

// Usage example
this.events.emit(EVENTS.SCORE_CHANGE, score);
this.events.on(EVENTS.PLAYER_DAMAGE, this.handlePlayerDamage, this);
```

---

*Note: This document is automatically updated during development. Please do not modify manually.*