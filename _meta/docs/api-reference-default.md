# API Reference

This document provides a compact overview of all modules, functions, classes, and data schemas in the project. It serves as a quick reference to understand the codebase without examining every file in detail.

## Core Modules

### Game Engine (`js/core/game.js`)
- **Purpose**: Central game controller that manages the game state and coordinates other modules

**Public Interface**:
```javascript
Game.init(config)           // Initialize game with configuration object
Game.start()                // Start the game loop
Game.pause()                // Pause the game
Game.resume()               // Resume a paused game
Game.getCurrentState()      // Returns the current game state object
```

### Game Loop (`js/core/loop.js`)
- **Purpose**: Manages the game timing and update/render cycle

**Public Interface**:
```javascript
GameLoop.start(updateFn, renderFn)  // Start loop with update and render callbacks
GameLoop.stop()                     // Stop the game loop
GameLoop.isPaused()                 // Check if loop is paused
GameLoop.getDeltaTime()             // Get time elapsed since last frame
```

### State Management (`js/core/state.js`)
- **Purpose**: Manages the game state and provides controlled access

**Public Interface**:
```javascript
StateManager.init(initialState)     // Initialize with starting state
StateManager.get(path)              // Get value at path
StateManager.set(path, value)       // Set value at path
StateManager.subscribe(path, fn)    // Subscribe to changes at path
```

## Rendering System

### Renderer (`js/rendering/renderer.js`)
- **Purpose**: Handles all drawing operations on the canvas

**Public Interface**:
```javascript
Renderer.init(canvasId)             // Initialize with canvas ID
Renderer.clear()                    // Clear the canvas
Renderer.draw(entity)               // Draw an entity
```

### Shapes (`js/rendering/shapes.js`)
- **Purpose**: Utility functions for drawing basic shapes

**Public Interface**:
```javascript
Shapes.rectangle(ctx, x, y, width, height, color)
Shapes.circle(ctx, x, y, radius, color)
Shapes.line(ctx, x1, y1, x2, y2, color, width)
```

## Input System

### Input Manager (`js/input/input-manager.js`)
- **Purpose**: Captures and normalizes user input

**Public Interface**:
```javascript
InputManager.init()                   // Set up event listeners
InputManager.isKeyDown(keyCode)       // Check if a key is pressed
InputManager.getMousePosition()       // Get current mouse coordinates
InputManager.onKey(keyCode, callback) // Register key callback
```

## Entity System

### Entity (`js/components/entity.js`)
- **Purpose**: Base class for all game entities

**Properties**:
```javascript
Entity.id        // Unique identifier
Entity.position  // {x, y} coordinates
Entity.size      // {width, height} dimensions
```

**Methods**:
```javascript
Entity.update(deltaTime)  // Update entity state
Entity.render(context)    // Render entity to canvas
Entity.isColliding(other) // Check collision with another entity
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

### Data Loader (`js/data/loader.js`)
- **Purpose**: Loads and caches game data

**Public Interface**:
```javascript
DataLoader.load(path)           // Load data from path
DataLoader.getCache(key)        // Get cached data
DataLoader.clearCache()         // Clear data cache
```

### Validator (`js/data/validator.js`)
- **Purpose**: Validates data against schemas

**Public Interface**:
```javascript
Validator.validate(data, schemaType)  // Validate data against schema
Validator.getErrors()                 // Get validation errors
```

## Data Schemas

### Level Schema
```javascript
{
  "id": String,           // Unique level identifier
  "name": String,         // Display name
  "width": Number,        // Level width in units
  "height": Number,       // Level height in units
  "entities": [           // Array of entities
    {
      "type": String,     // Entity type
      "x": Number,        // X position
      "y": Number         // Y position
    }
  ]
}
```

### Entity Schema
```javascript
{
  "type": String,         // Entity type identifier
  "width": Number,        // Default width
  "height": Number,       // Default height
  "color": String,        // Default color
  "properties": {         // Additional properties
    // Entity-specific properties
  }
}
```

## Constants

### Game States
```javascript
const GAME_STATES = {
  LOADING: 'loading',
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver'
};
```

### Entity Types
```javascript
const ENTITY_TYPES = {
  PLAYER: 'player',
  OBSTACLE: 'obstacle',
  COLLECTIBLE: 'collectible'
};
```

## Events

### Game Events
```javascript
// Published events
Events.GAME_INITIALIZED
Events.GAME_STARTED
Events.GAME_PAUSED
Events.GAME_RESUMED
Events.GAME_OVER

// Subscribe example
Events.subscribe(Events.GAME_OVER, callback);
```

---

*Note: This document is automatically updated during development. Please do not modify manually.*