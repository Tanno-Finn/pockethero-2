# Coding Guidelines

## Communication Guidelines

### Code Changes
- When modifying a file, always provide the complete updated file content
- Do not use truncated code snippets with ellipses (...) or "rest of code remains the same" comments
- Ensure code is ready to be copied and pasted directly into the file system
- When referencing code changes, specify the exact filename and location

### Reporting Progress
- Clearly indicate which TODO items have been addressed
- Update TODO.md by marking completed items and adding new ones as needed
- Document all architectural decisions in DESIGN.md, not in conversation
- Update CHANGELOG.md with all significant changes
- Ensure documentation is complete enough to continue development in a new conversation

### New Data Structures
- When creating new data types, always document the complete schema
- Include examples of valid data structures
- Update appropriate README.md files in data directories
- Implement validation for new data structures

## General Principles
- Keep code simple and readable
- Follow DRY (Don't Repeat Yourself) principles
- Use consistent formatting
- Write modular, reusable code
- Test thoroughly
- Utilize Phaser.js best practices and design patterns

## Phaser.js Development

### Architecture
- Use Phaser 3 scene-based architecture
- Separate game logic into distinct scenes
- Utilize Phaser's state management
- Follow Phaser's lifecycle methods (preload, create, update)

### Asset Management
- Use Phaser's loader for assets
- Define clear asset keys and organize by type
- Utilize Phaser's cache system
- Preload assets in appropriate scenes

### Physics and Collision
- Use Phaser's physics systems (Arcade, Matter, etc.)
- Define collision groups and categories clearly
- Document physics properties and behaviors
- Use appropriate debug tools during development

## Naming Conventions

### Files
- Use camelCase for JavaScript files: `gameScene.js`
- Use kebab-case for HTML and CSS files: `main-style.css`
- Use descriptive names for scenes: `BootScene.js`, `GameScene.js`

### JavaScript
- Use camelCase for variables and functions: `playerScore`, `calculateDistance()`
- Use PascalCase for classes, scenes, and constructors: `PlayerSprite`, `GameScene`
- Use UPPER_SNAKE_CASE for constants: `MAX_PLAYERS`, `DEFAULT_WIDTH`
- Prefix private properties and methods with underscore: `_privateMethod()`
- Use descriptive names for Phaser game objects: `playerSprite`, `enemyGroup`

## Code Organization

### Project Structure
```
project-root/
├── index.html              # Main entry point
├── css/                    # All stylesheets
│   └── main.css            # Core styles
├── js/                     # JavaScript source files
│   ├── main.js             # Main game configuration
│   ├── scenes/             # Phaser scenes
│   │   ├── BootScene.js    # Initial boot scene
│   │   ├── PreloadScene.js # Asset loading scene
│   │   ├── MenuScene.js    # Main menu scene
│   │   └── GameScene.js    # Main gameplay scene
│   ├── objects/            # Game object classes
│   │   ├── Player.js       # Player class
│   │   └── Enemy.js        # Enemy class
│   ├── utils/              # Utility functions
│   │   ├── math.js         # Math utilities
│   │   └── helpers.js      # Helper functions
│   └── data/               # Data management
│       ├── LevelManager.js # Level management
│       └── AssetManager.js # Asset management
├── assets/                 # Game assets
│   ├── images/             # Sprite and image assets
│   │   ├── sprites/        # Character and object sprites
│   │   ├── ui/             # UI elements
│   │   └── backgrounds/    # Background images
│   ├── audio/              # Sound files
│   │   ├── music/          # Background music
│   │   └── sfx/            # Sound effects
│   └── tilemaps/           # Tiled map files
├── data/                   # Game data (JSON files)
│   ├── levels/             # Level definitions
│   ├── entities/           # Entity definitions
│   └── config/             # Configuration
├── tests/                  # Test files
│   ├── scenes/             # Scene tests
│   ├── objects/            # Object tests
│   └── test-utils.js       # Test utilities
└── docs/                   # Additional documentation
    └── api/                # Generated API docs
```

### File Structure Guidelines
- Each file should have a single responsibility
- Group related functionality in the same file
- Keep files under 300 lines when possible; split larger files by functionality
- Place interface definitions at the top of the file
- Organize imports/requires in a consistent order:
  1. Core/standard libraries
  2. Third-party libraries
  3. Project modules (using relative paths)
- Export only what is necessary from each module

### Code Blocks
- Use two-space indentation
- Place opening braces on the same line as the statement
- Each nested block should be indented by one level
- Keep methods short (preferably under 30 lines)

## Documentation

### Comments
- All files must begin with a file header comment describing its purpose
- Every function, class, and method must have a JSDoc comment
- Use inline comments for complex logic only, prefer self-documenting code
- Document Phaser-specific details and configurations
- Comment format:

```javascript
/**
 * Scene for main gameplay
 * 
 * @class GameScene
 * @extends Phaser.Scene
 */
class GameScene extends Phaser.Scene {
  /**
   * Create a player sprite with physics
   * 
   * @param {number} x - Initial X position
   * @param {number} y - Initial Y position
   * @returns {Phaser.Physics.Arcade.Sprite} The player sprite object
   */
  createPlayer(x, y) {
    // Implementation
  }
}
```

### Phaser-Specific Documentation
- Document scene keys and dependencies
- Include information about asset keys
- Specify physics configurations
- Document event listeners and emitters
- Note scene transition points

## Testing

### Test File Organization
- Create test files in a `tests` directory
- Name test files to match the file they test: `GameScene.js` → `GameScene.test.js`
- Organize test files to mirror the main project structure

### Test Methods
- Test Phaser objects and scenes in isolation when possible
- Mock Phaser dependencies as needed
- Test game logic separately from Phaser-specific functionality
- Document test setup and expected behavior
- Example:

```javascript
// Test player movement
function testPlayerMovement() {
  // Setup Phaser test environment
  const scene = new GameScene();
  scene.physics = { add: { sprite: jest.fn() } };
  
  // Create player
  const player = new Player(scene, 0, 0);
  
  // Test movement method
  player.moveRight(5);
  console.assert(player.x === 5, "Player should move 5 units right");
}
```

### Test Execution
- Include a runTests() function in each test file
- Document how to run tests manually
- Log test results clearly
- Consider implementing automated testing if project scope grows

## Initial Development Approach

### Graphics and Audio
- Initial development will NOT use image sprites or audio files
- Use native Canvas shapes and drawing operations (rectangles, circles, lines, etc.)
- Use color, size, and animation to differentiate game elements
- Structure code to allow for easy replacement with sprite-based graphics later
- Comment placeholder sections where sprite/audio implementation would go in future

### Canvas Best Practices
- Use layers for different game elements when appropriate
- Implement basic collision detection with geometric shapes
- Use transformation matrices for rotations when needed rather than redrawing
- Create utility functions for commonly used shapes and patterns
- Implement simple particle effects with native Canvas operations if needed

## Data Management

### Data-Code Separation
- Game data must be separated from game logic
- Store all game data in JSON files within a dedicated `data/` directory
- Categorize data files by type (e.g., `data/levels/`, `data/entities/`)
- Each type of data should have a consistent schema
- Use Phaser's registry or data manager for runtime state

### Phaser-Specific Data Management
- Use Phaser's data manager for object-specific data
- Utilize scene registry for scene-level data
- Implement a central data store for game-wide state if needed
- Consider using Phaser's event system for state changes

### Data Schema Documentation
- Create and maintain schema documentation for each data type
- Document the structure in the file header of each JSON file
- Include a README.md file in each data subdirectory explaining:
  - Purpose of the data type
  - Required and optional fields
  - Data types and constraints
  - Examples of valid data

### Data Loading
- Use Phaser's loader for loading JSON data
- Implement data validation with error handling
- Cache data appropriately to avoid redundant loading

### Schema Example
```javascript
/**
 * Level Data Schema:
 * {
 *   "id": string,           // Unique identifier
 *   "name": string,         // Display name
 *   "width": number,        // Level width in tiles
 *   "height": number,       // Level height in tiles
 *   "tileSize": number,     // Size of each tile in pixels
 *   "backgroundKey": string, // Background image key
 *   "entities": [           // Array of entities in the level
 *     {
 *       "type": string,     // Entity type (must match an entity definition)
 *       "x": number,        // X position in tiles
 *       "y": number,        // Y position in tiles
 *       "properties": {}    // Optional entity-specific properties
 *     }
 *   ],
 *   "tilemap": {            // Tilemap configuration
 *     "key": string,        // Tilemap key (preloaded)
 *     "tilesets": [         // Array of tilesets
 *       {
 *         "name": string,   // Tileset name in Tiled
 *         "key": string     // Image key (preloaded)
 *       }
 *     ]
 *   }
 * }
 */
```

## Browser Compatibility

- Test on multiple browsers (at minimum: Chrome, Firefox, Safari)
- Use ES6+ features with caution, document browser requirements
- Include polyfills when necessary for wider compatibility

## Error Handling

- Use try/catch blocks for operations that might fail
- Provide meaningful error messages
- Log errors appropriately
- Fail gracefully when possible

## Version Control

- Make small, focused commits
- Write meaningful commit messages
- Structure commit messages as: "Category: Brief description"
- Example: "Rendering: Fix sprite flicker during animation"