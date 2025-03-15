# Design Document

## Game Concept Overview

A Pokemon-like game where players explore a tile-based 2D world, encounter and battle monsters, interact with NPCs, collect items, and progress through different zones. Monsters can level up, learn new abilities, and evolve.

## Architecture Overview

This project follows a component-based architecture organized around Phaser.js scenes. The architecture emphasizes separation of concerns, modularity, and data-driven design.

### Core Components

#### Scene Management
The game is divided into distinct scenes that handle different game states:
- **BootScene**: Initial setup and basic asset loading
- **PreloadScene**: Main asset loading with progress display
- **WorldScene**: Main game world where player exploration occurs
- **BattleScene**: Turn-based battle system activated during encounters
- **MenuScene**: Player inventory, monster management, and settings
- **DialogScene**: Handles NPC conversations and text display
- **TransitionScene**: Manages transitions between scenes

#### Game Systems
Independent systems that provide specific functionality:
- **GridMovementSystem**: Handles tile-based movement on the world map
- **BattleSystem**: Manages battle mechanics, turns, and actions
- **MonsterSystem**: Handles monster stats, abilities, and evolution
- **InventorySystem**: Manages player items and their effects
- **QuestSystem**: Tracks player progress and quest objectives
- **EventSystem**: Central event bus for communication between components
- **SaveSystem**: Handles game state persistence

#### Data Management
All game data is stored in structured JSON files:
- **Monsters**: Stats, abilities, evolution paths
- **Maps**: World layouts, collision data, encounter zones
- **NPCs**: Dialog, behavior patterns, quest connections
- **Items**: Effects, descriptions, availability
- **Abilities**: Battle effects, animations, requirements

### Architecture Diagrams

#### Component Relationships
```
[Scene Management] ←→ [Game Systems] ←→ [Data Management]
       ↑                    ↑                   ↑
       └────────────[Event System]──────────────┘
```

#### Scene Flow
```
[Boot] → [Preload] → [Menu] ↔ [World] ↔ [Battle]
                       ↑         ↑ 
                       └── [Dialog] ←┘
```

### Data Flow

1. User input is captured by the Input Manager
2. Input triggers player actions via the appropriate system
3. Systems update game state and emit events
4. Components respond to events with appropriate logic
5. Scene Manager renders the updated state

## Technical Design Decisions

### Grid-Based Movement
- Using a tile-based movement system with discrete steps
- Tile size of 32x32 pixels for all maps
- Movement controlled through direction inputs (up, down, left, right)
- Collision detection handled at the tile level

### Battle System
- Turn-based combat similar to Pokemon
- Actions: Attack, Use Item, Switch Monster, Run
- Stats: HP, Attack, Defense, Speed, Special Attack, Special Defense
- Type-based effectiveness system (fire, water, grass, etc.)

### Random Encounter System
- Certain tiles (like tall grass) have encounter probability
- Encounter rates vary based on area and player progress
- Random selection from area-specific monster pool

### Monster Management
- Monsters gain experience from battles
- Leveling system with stat increases
- Evolution triggered by level or special conditions
- Move learning system with level-based progression

### NPC Interaction
- NPCs with fixed or patrol-based movement patterns
- Dialog system with branching conversations
- Quest givers and story progression

## Data-Driven Design

All game content is defined through JSON data files to make content creation accessible:

### Example Monster Schema
```json
{
  "id": "monster-001",
  "name": "FireStarter",
  "baseStats": {
    "hp": 45,
    "attack": 49,
    "defense": 49,
    "specialAttack": 65,
    "specialDefense": 65,
    "speed": 45
  },
  "type": "fire",
  "abilities": ["ember", "scratch"],
  "evolutionLevel": 16,
  "evolvesTo": "monster-002"
}
```

### Example Map Schema
```json
{
  "id": "map-001",
  "name": "Hometown",
  "width": 20,
  "height": 15,
  "tileSize": 32,
  "tilemap": {
    "grid": [
      [1, 1, 1, 1, ...],
      [1, 0, 0, 1, ...],
      ...
    ],
    "collisions": [1, 3, 4, ...],
    "encounters": [2, 5, ...]
  },
  "npcs": [
    {
      "id": "npc-001",
      "x": 5,
      "y": 7,
      "type": "professor",
      "dialog": "dialog-001",
      "movement": "static"
    }
  ],
  "connections": [
    {
      "direction": "east",
      "toMap": "map-002",
      "entryX": 0,
      "entryY": 7
    }
  ]
}
```

## Technical Implementation Approach

### Graphics Approach
- Using simple shape-based graphics as specified:
    - Rectangles and circles for characters and monsters
    - Different colors to distinguish entity types
    - Simple animations through shape transformations
    - Grid overlay for better visualization during development

### Phaser Usage
- Leveraging Phaser's scene management for game states
- Using Phaser's physics for collision detection
- Utilizing Phaser's input handling for controls
- Employing Phaser's timer and event systems

### Event-Based Communication
- Central event system to decouple components
- Events for actions like:
    - Movement completion
    - Battle initiation/completion
    - NPC interaction
    - Item acquisition
    - Monster evolution
    - Zone transitions

## Future Considerations

- Potential for online features (trading, battling)
- Editor tools for easier content creation
- Enhanced battle animations
- Expanded world with more zones