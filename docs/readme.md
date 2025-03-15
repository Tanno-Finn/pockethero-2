# MonsterQuest

A Pokemon-inspired game built with Phaser.js, featuring tile-based movement, monster battles, and exploration.

## Overview

MonsterQuest is a 2D game where players explore a tile-based world, encounter and battle monsters, interact with NPCs, and progress through different zones. The game features a turn-based battle system, monster collection and evolution, and an inventory system.

## Features

- Tile-based world exploration
- Turn-based monster battles
- Monster collection, training, and evolution
- NPC interactions with dialog system
- Item collection and usage
- Multiple zones to explore

## Architecture

```
MonsterQuest/
├── index.html                 # Entry point
├── css/                       # Stylesheets
│   └── main.css               # Main stylesheet
├── js/                        # JavaScript source files
│   ├── main.js                # Game initialization
│   ├── constants.js           # Game constants
│   ├── scenes/                # Phaser scenes
│   │   ├── BootScene.js       # Initial loading and setup
│   │   ├── PreloadScene.js    # Asset loading
│   │   ├── WorldScene.js      # Main exploration scene
│   │   ├── BattleScene.js     # Battle sequence
│   │   ├── MenuScene.js       # Game menus
│   │   ├── DialogScene.js     # Dialog display
│   │   └── TransitionScene.js # Scene transitions
│   ├── systems/               # Game systems
│   │   ├── GridMovement.js    # Tile-based movement
│   │   ├── BattleSystem.js    # Battle mechanics
│   │   ├── MonsterSystem.js   # Monster management
│   │   ├── InventorySystem.js # Item management
│   │   ├── QuestSystem.js     # Quest tracking
│   │   ├── EventSystem.js     # Event management
│   │   └── SaveSystem.js      # Game saving/loading
│   ├── entities/              # Game entities
│   │   ├── Player.js          # Player character
│   │   ├── Monster.js         # Monster entity
│   │   ├── NPC.js             # Non-player character
│   │   └── Item.js            # Game items
│   └── utils/                 # Utility functions
│       ├── AssetLoader.js     # Asset loading utilities
│       ├── DataManager.js     # Data handling utilities
│       └── UIBuilder.js       # UI creation helpers
├── data/                      # Game data (JSON)
│   ├── monsters/              # Monster definitions
│   ├── maps/                  # Map layouts
│   ├── npcs/                  # NPC definitions
│   ├── items/                 # Item definitions
│   ├── abilities/             # Ability definitions
│   ├── dialogs/               # Dialog content
│   └── quests/                # Quest definitions
└── tests/                     # Test files
    ├── systems/               # System tests
    ├── entities/              # Entity tests
    └── utils/                 # Utility tests
```

## Setup and Usage

1. Clone the repository
2. Open `index.html` in a modern browser
3. Use arrow keys to navigate the world
4. Press 'Space' to interact with NPCs and objects
5. Press 'Esc' to open the menu

## Game Controls

- **Arrow Keys**: Move in four directions (Up, Down, Left, Right)
- **Space**: Interact with NPCs/objects
- **Esc**: Open game menu
- **Z**: Confirm (in menus and dialogs)
- **X**: Cancel (in menus and dialogs)

## Development

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari)
- Text editor or IDE

### Running the Game

Simply open `index.html` in a web browser to start the game.

### Adding Content

The game is designed to be data-driven. New content can be added by creating appropriate JSON files in the `data/` directory:

- **Monsters**: Add new monster definitions to `data/monsters/`
- **Maps**: Create new maps in `data/maps/`
- **NPCs**: Define new characters in `data/npcs/`
- **Items**: Add new items in `data/items/`
- **Abilities**: Create new abilities in `data/abilities/`

See the documentation in each directory for the required data schema.

## Technology

- **Phaser 3**: Game framework
- **JavaScript (ES6+)**: Programming language
- **HTML5 Canvas**: Rendering technology

## License

This project is licensed under the MIT License - see the LICENSE file for details.