# API Reference

This document provides a compact overview of all modules, functions, classes, and data schemas in the project. It serves as a quick reference to understand the codebase without examining every file in detail.

## Game Configuration

### Main Configuration (`js/main.js`)
- **Purpose**: Initializes Phaser and sets up game configuration

**Game Configuration**:
```javascript
const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  parent: 'game-container',
  backgroundColor: '#000000',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: GAME_CONFIG.DEBUG
    }
  },
  scene: [
    BootScene,
    PreloadScene,
    WorldScene,
    BattleScene,
    MenuScene,
    DialogScene
  ]
};
```

### Constants (`js/constants.js`)
- **Purpose**: Defines game constants used throughout the codebase

**Game Constants**:
```javascript
const GAME_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  TILE_SIZE: 32,
  PLAYER_SPEED: 4,
  ENCOUNTER_RATE: 0.1,
  MAX_PARTY_SIZE: 6,
  MAX_MONSTER_LEVEL: 100,
  DEBUG: true,
  SHOW_GRID: true
};
```

**Scene Keys**:
```javascript
const SCENES = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  WORLD: 'WorldScene',
  BATTLE: 'BattleScene',
  MENU: 'MenuScene',
  DIALOG: 'DialogScene',
  TRANSITION: 'TransitionScene'
};
```

**Entity Types**:
```javascript
const ENTITY_TYPES = {
  PLAYER: 'player',
  NPC: 'npc',
  MONSTER: 'monster',
  ITEM: 'item'
};
```

**Tile Types**:
```javascript
const TILE_TYPES = {
  FLOOR: 0,
  WALL: 1,
  GRASS: 2,
  WATER: 3,
  DOOR: 4,
  ENCOUNTER: 5
};
```

**Monster Types**:
```javascript
const MONSTER_TYPES = {
  NORMAL: 'normal',
  FIRE: 'fire',
  WATER: 'water',
  GRASS: 'grass',
  // ... additional types
};
```

**Game Events**:
```javascript
const EVENTS = {
  PLAYER_MOVE: 'player-move',
  PLAYER_INTERACT: 'player-interact',
  BATTLE_START: 'battle-start',
  BATTLE_END: 'battle-end',
  // ... additional events
};
```

## Core Systems

### Event System (`js/systems/EventSystem.js`)
- **Purpose**: Centralized event management for communication between game components

**Public Interface**:
```javascript
constructor(game)              // Create new event system
on(event, callback, context)   // Subscribe to an event
once(event, callback, context) // Subscribe to an event for a single occurrence
off(event, callback, context)  // Unsubscribe from an event
emit(event, ...args)           // Emit an event
removeAllListeners(event)      // Remove all listeners for an event
listenerCount(event)           // Get the number of listeners for an event
getEmitter()                   // Get the underlying event emitter
shutdown()                     // Cleanup the event system
```

### Data Manager (`js/utils/DataManager.js`)
- **Purpose**: Handles loading and access to game data from JSON files

**Public Interface**:
```javascript
init(scene)                    // Initialize data manager with a scene for loading
get(type, id)                  // Get data for a specific type and id
getAll(type)                   // Get all data for a specific type
getAllIds(type)                // Get all ids for a specific type
exists(type, id)               // Check if a specific data entry exists
```

**Private Methods**:
```javascript
_loadDataIndex(type)           // Load index file for data type
_loadDataEntry(type, entry)    // Load a single data entry
_validateData(type, data)      // Validate data based on type
```

### Grid Movement System (`js/systems/GridMovement.js`)
- **Purpose**: Manages tile-based movement and collisions on the world map

**Public Interface**:
```javascript
constructor(scene, config)     // Create new grid movement system
setMap(mapData)                // Set the current map data
addEntity(entity)              // Add an entity to the grid
removeEntity(entity)           // Remove an entity from the grid
updateEntityPosition(entity, newX, newY) // Update entity position on the grid
canMove(x, y, direction)       // Check if a move is valid
moveEntity(entity, direction)  // Move an entity in a direction
getEntitiesAt(x, y)            // Get entities at a specific position
getTileAt(x, y)                // Get the tile type at a specific position
isEncounterZone(x, y)          // Check if a position is an encounter zone
checkEncounter()               // Check for random encounter
```

**Private Methods**:
```javascript
_hasCollision(x, y)            // Check if a position has collision
_setCollision(x, y, hasCollision) // Set collision for a position
_drawDebugGrid()               // Draw debug grid
_animateMove(entity, newX, newY) // Animate entity movement
```

### Monster System (`js/systems/MonsterSystem.js`)
- **Purpose**: Handles monster creation, stats calculation, evolution, and ability management

**Public Interface**:
```javascript
constructor(scene)             // Create new monster system
createMonster(monsterId, level, options) // Create a monster instance from data
getExperienceYield(monster)    // Get experience yield when defeating a monster
awardExperience(monster, amount) // Award experience to a monster
evolveMonster(monster)         // Evolve a monster
getAbility(abilityId)          // Get ability data by ID
applyDamage(monster, damage)   // Apply damage to a monster
healMonster(monster, amount)   // Heal a monster
applyStatus(monster, status)   // Apply a status effect to a monster
clearStatus(monster)           // Clear a monster's status effect
calculateCatchProbability(monster, options) // Calculate catch success probability
attemptCatch(monster, options) // Attempt to catch a monster
createMonsterSprite(monster, x, y, scale) // Create a shape sprite for a monster
```

**Private Methods**:
```javascript
_generateIVs()                 // Generate random IVs for a monster
_generateEVs()                 // Generate default EVs for a monster
_calculateStats(baseStats, level, ivs, evs) // Calculate monster stats
_getAbilitiesForLevel(monsterData, level) // Get abilities available at a specific level
_getLevelExperience(level, growthRate) // Get experience required for a level
```

### Battle System (`js/systems/BattleSystem.js`)
- **Purpose**: Manages battle mechanics, turns, and action execution

**Public Interface**:
```javascript
constructor(scene)             // Create new battle system
startBattle(options)           // Start a new battle
endBattle(result)              // End the current battle
getBattleState()               // Get current battle state
executePlayerAction(action)    // Execute a player action
getMonsterSystem()             // Get Monster System instance
```

**Private Methods**:
```javascript
_executeAbility(user, target, abilityId) // Execute an ability
_useItem(itemId, targetId)     // Use an item
_switchMonster(team, index)    // Switch active monster
_attemptRun()                  // Attempt to run from battle
_executeEnemyAction()          // Execute enemy action
_getNextMonster(team)          // Get next available monster
_startNewTurn()                // Start a new turn
_applyStatusEffects()          // Apply status effects
_applyWeatherEffects()         // Apply weather effects
_calculateTypeEffectiveness(attackType, defenderType) // Calculate type effectiveness
```

## Scenes

### Boot Scene (`js/scenes/BootScene.js`)
- **Purpose**: Initial scene for game setup and loading essential assets

**Public Interface**:
```javascript
init(data)                     // Initialize the scene
preload()                      // Load minimal assets needed for loading screen
create()                       // Initialize game settings and transition to PreloadScene
```

**Private Methods**:
```javascript
initGameSettings()             // Initialize game settings
shutdown()                     // Cleanup when scene is shutdown
```

### Preload Scene (`js/scenes/PreloadScene.js`)
- **Purpose**: Handles loading of all game assets with loading bar

**Public Interface**:
```javascript
init(data)                     // Initialize the scene
preload()                      // Load all game assets with progress bar
create()                       // Setup scene after loading
```

**Private Methods**:
```javascript
createLoadingUI()              // Create loading progress UI
initDataManager()              // Initialize the DataManager
initEvents()                   // Initialize event emitters
finishLoading()                // Finish loading and transition to next scene
showError(message)             // Show error message
shutdown()                     // Cleanup when scene is shutdown
```

### Menu Scene (`js/scenes/MenuScene.js`)
- **Purpose**: Main menu interface for the game

**Public Interface**:
```javascript
init(data)                     // Initialize the scene
create()                       // Create menu UI elements
```

**Private Methods**:
```javascript
createMenuOptions()            // Create menu options
setupInput()                   // Setup input handlers
highlightOption(index)         // Highlight a menu option
selectPreviousOption()         // Select previous menu option
selectNextOption()             // Select next menu option
selectCurrentOption()          // Select current menu option
startNewGame()                 // Start a new game
continueGame()                 // Continue existing game
openOptions()                  // Open options menu
showMessage(message)           // Show a temporary message
update(time, delta)            // Update loop
shutdown()                     // Cleanup when scene is shutdown
```

### World Scene (`js/scenes/WorldScene.js`)
- **Purpose**: Main gameplay scene for exploration and world interaction

**Public Interface**:
```javascript
init(data)                     // Initialize the scene
preload()                      // Preload assets for world scene
create()                       // Set up game world, entities, and systems
update(time, delta)            // Main game loop function
```

**Private Methods**:
```javascript
setupCamera()                  // Set up camera
loadMap(mapId)                 // Load map data and create map
createMapBackground()          // Create map background
createMapTiles()               // Create map tiles based on tilemap data
createPlayer()                 // Create the player character
createNPCs()                   // Create NPCs based on map data
setupInput()                   // Set up input handling
openMenu()                     // Open the game menu
handleInteraction()            // Handle player interaction with entities
interactWithNPC(npc)           // Interact with an NPC
handleDialogEnd()              // Handle dialog end
movePlayer(direction)          // Move player in a direction
checkRandomEncounter()         // Check for random encounter
startBattle()                  // Start a battle
handleBattleEnd(result)        // Handle battle end
handleInput()                  // Handle player input
updateNPCs(delta)              // Update NPCs
shutdown()                     // Cleanup when scene is shutdown
```

### Battle Scene (`js/scenes/BattleScene.js`)
- **Purpose**: Handles battle sequences between player and wild/trainer monsters

**Public Interface**:
```javascript
init(data)                     // Initialize the scene
preload()                      // Preload assets for battle scene
create()                       // Create battle UI and systems
update(time, delta)            // Update loop
```

**Private Methods**:
```javascript
createBattleUI()               // Create battle UI elements
createMonsterInfoBoxes()       // Create monster info boxes
createActionMenu()             // Create action menu
createAbilityMenu()            // Create ability menu
createMonsterMenu()            // Create monster selection menu
createMessageBox()             // Create message box
setupInput()                   // Setup input handlers
startBattle()                  // Start a battle
createMonsterSprites()         // Create monster sprites
updateMonsterInfo()            // Update monster info displays
showMessage(message, callback) // Show a message in the message box
queueMessage(message)          // Add a message to the queue
processMessageQueue(callback)  // Process the next message in the queue
showActionMenu()               // Show the action menu
highlightActionButton(index)   // Highlight an action button
handleActionSelection(index)   // Handle action selection
showAbilityMenu()              // Show ability menu with current monster's abilities
highlightAbilityButton(index)  // Highlight an ability button
handleAbilitySelection(index)  // Handle ability selection
showMonsterMenu()              // Show monster selection menu
highlightMonsterButton(index)  // Highlight a monster button
handleMonsterSelection(index)  // Handle monster selection
handleRunAction()              // Handle Run action
handleActionResult(result)     // Handle action result
handleBattleEnd(result)        // Handle battle end
handleEvolution(evolutionData) // Handle monster evolution
returnToWorld()                // Return to world scene
handleUpKey()                  // Handle Up key press
handleDownKey()                // Handle Down key press
handleLeftKey()                // Handle Left key press
handleRightKey()               // Handle Right key press
handleConfirmKey()             // Handle Confirm key press
handleCancelKey()              // Handle Cancel key press
shutdown()                     // Cleanup when scene is shutdown
```

### Dialog Scene (`js/scenes/DialogScene.js`)
- **Purpose**: Handles NPC dialog and text display

**Public Interface**:
```javascript
init(data)                     // Initialize the scene
create()                       // Create dialog UI and load dialog data
update(time, delta)            // Update loop
```

**Private Methods**:
```javascript
createDialogUI()               // Create dialog UI elements
setupInput()                   // Setup input handlers
loadDialogData()               // Load dialog data
startDialog()                  // Start dialog display
showDialogNode(nodeIndex)      // Show a specific dialog node
animateText()                  // Animate text display letter by letter
updateText()                   // Update animated text
handleNodeComplete()           // Handle dialog node completion
showChoices(choices)           // Show choices for a dialog node
highlightChoice(index)         // Highlight a choice option
advanceDialog()                // Handle dialog advancement
endDialog()                    // End dialog and return to previous scene
handleConfirmKey()             // Handle Confirm key press
handleUpKey()                  // Handle Up key press
handleDownKey()                // Handle Down key press
shutdown()                     // Cleanup when scene is shutdown
```

## Data Schemas

### Monster Schema
```javascript
{
  "id": "string",              // Unique identifier for the monster
  "name": "string",            // Display name of the monster
  "type": "string",            // Monster type (see MONSTER_TYPES)
  "description": "string",     // Description of the monster
  "baseStats": {               // Base stats used to calculate actual stats
    "hp": "number",
    "attack": "number",
    "defense": "number",
    "specialAttack": "number",
    "specialDefense": "number",
    "speed": "number"
  },
  "abilities": ["string"],     // Array of ability IDs this monster can learn
  "abilityLevels": {           // Level at which each ability is learned
    "ability-id": "number"
  },
  "evolution": {               // Evolution information (null if doesn't evolve)
    "evolvesTo": "string",     // ID of the evolved form
    "level": "number",         // Level required for evolution
    "item": "string",          // Item required for evolution
    "condition": "string"      // Special condition for evolution
  },
  "catchRate": "number",       // Base catch rate (0-255)
  "expYield": "number",        // Base experience yield when defeated
  "growthRate": "string",      // Growth rate category
  "shape": {                   // Visual representation (using shapes)
    "form": "string",          // Basic shape: "circle", "square", "triangle", "star"
    "mainColor": "number",     // Main color (hexadecimal)
    "accentColor": "number"    // Accent color (hexadecimal)
  }
}
```

### Ability Schema
```javascript
{
  "id": "string",              // Unique identifier for the ability
  "name": "string",            // Display name of the ability
  "type": "string",            // Ability type (see MONSTER_TYPES)
  "category": "string",        // "physical", "special", or "status"
  "description": "string",     // Description of what the ability does
  "power": "number",           // Base power for damage calculation
  "accuracy": "number",        // Accuracy percentage (100 = always hits)
  "pp": "number",              // Power points (number of times ability can be used)
  "target": "string",          // "opponent", "self", "all-opponents", "all", "field"
  "priority": "number",        // Priority level (higher goes first, default is 0)
  "effects": [                 // Array of additional effects
    {
      "type": "string",        // Effect type: "stat", "status", "field", "damage", etc.
      "target": "string",      // Who is affected: "user", "target", "all", etc.
      "stat": "string",        // Affected stat (for stat changes)
      "status": "string",      // Inflicted status (for status effects)
      "chance": "number",      // Probability of effect (100 = always happens)
      "stages": "number",      // Stage change for stat effects (+1, -2, etc.)
      "duration": "number"     // Effect duration in turns (null = until battle ends)
    }
  ],
  "animations": {              // Visual representation of the ability
    "color": "number",         // Primary color (hexadecimal)
    "shape": "string",         // "beam", "splash", "wave", "burst", etc.
    "duration": "number",      // Animation duration in milliseconds
    "particleCount": "number"  // Number of particles (for particle effects)
  }
}
```

### Map Schema
```javascript
{
  "id": "string",              // Unique identifier for the map
  "name": "string",            // Display name of the map
  "width": "number",           // Width of the map in tiles
  "height": "number",          // Height of the map in tiles
  "tileSize": "number",        // Size of tiles in pixels (usually 32)
  "tilemap": {
    "grid": [                  // 2D array of tile types
      [0, 0, 1, 1, ...],       // Each number corresponds to a tile type
      [0, 0, 0, 1, ...],       // See TILE_TYPES in constants.js
      ...
    ],
    "collisions": [1, 3, 4],   // Array of tile types that have collision
    "encounters": [2, 5]       // Array of tile types that can trigger encounters
  },
  "npcs": [                    // Array of NPCs on this map
    {
      "id": "string",          // Unique identifier for the NPC
      "x": "number",           // X position in tiles
      "y": "number",           // Y position in tiles
      "type": "string",        // NPC type (references NPC definition)
      "dialog": "string",      // Dialog ID for this NPC
      "movement": "string"     // Movement pattern: "static", "patrol", "random"
    }
  ],
  "encounters": {              // Encounter configuration
    "rate": "number",          // Base encounter rate (0-1)
    "monsters": [              // Possible monsters to encounter
      {
        "id": "string",        // Monster ID
        "level": "number",     // Level range minimum
        "levelMax": "number",  // Level range maximum
        "weight": "number"     // Encounter weight (higher = more common)
      }
    ]
  },
  "connections": [             // Connections to other maps
    {
      "direction": "string",   // "north", "east", "south", "west"
      "x": "number",           // X position of connection
      "y": "number",           // Y position of connection
      "targetMap": "string",   // Target map ID
      "targetX": "number",     // X position on target map
      "targetY": "number"      // Y position on target map
    }
  ]
}
```

### Dialog Schema
```javascript
{
  "id": "string",              // Unique identifier for the dialog
  "name": "string",            // Display name of the dialog
  "nodes": [                   // Array of dialog nodes
    {
      "speaker": "string",     // Name of the speaker
      "text": "string",        // Text content of the dialog
      "nextNode": "number",    // Index of the next node (optional)
      "choices": [             // Array of choices (optional)
        {
          "text": "string",    // Text of the choice
          "nextNode": "number" // Index of the node to go to if selected
        }
      ]
    }
  ]
}
```

## Events

### Game Events
```javascript
// Common event strings
const EVENTS = {
    PLAYER_MOVE: 'player-move',
    PLAYER_INTERACT: 'player-interact',
    PLAYER_ZONE_CHANGE: 'player-zone-change',
    
    BATTLE_START: 'battle-start',
    BATTLE_END: 'battle-end',
    BATTLE_ACTION: 'battle-action',
    MONSTER_LEVEL_UP: 'monster-level-up',
    MONSTER_EVOLVE: 'monster-evolve',
    MONSTER_FAINTED: 'monster-fainted',
    MONSTER_CAUGHT: 'monster-caught',
    
    DIALOG_START: 'dialog-start',
    DIALOG_END: 'dialog-end',
    MENU_OPEN: 'menu-open',
    MENU_CLOSE: 'menu-close',
    
    GAME_SAVE: 'game-save',
    GAME_LOAD: 'game-load',
    ITEM_ACQUIRED: 'item-acquired',
    ITEM_USED: 'item-used',
    QUEST_UPDATE: 'quest-update'
};

// Usage example
this.events.emit(EVENTS.SCORE_CHANGE, score);
this.events.on(EVENTS.PLAYER_DAMAGE, this.handlePlayerDamage, this);
```

---

*Note: This document is automatically updated during development. Please do not modify manually.*