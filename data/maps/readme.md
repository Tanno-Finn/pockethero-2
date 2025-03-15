# Map Data Schema

Map data files define the layout and content of game maps. Each map is stored as a separate JSON file in the `data/maps/` directory.

## Schema

```json
{
  "id": "string",             // Unique identifier for the map
  "name": "string",           // Display name of the map
  "width": "number",          // Width of the map in tiles
  "height": "number",         // Height of the map in tiles
  "tileSize": "number",       // Size of tiles in pixels (usually 32)
  "tilemap": {
    "grid": [                 // 2D array of tile types
      [0, 0, 1, 1, ...],      // Each number corresponds to a tile type
      [0, 0, 0, 1, ...],      // See TILE_TYPES in constants.js
      ...
    ],
    "collisions": [1, 3, 4],  // Array of tile types that have collision
    "encounters": [2, 5]      // Array of tile types that can trigger encounters
  },
  "npcs": [                   // Array of NPCs on this map
    {
      "id": "string",         // Unique identifier for the NPC
      "x": "number",          // X position in tiles
      "y": "number",          // Y position in tiles
      "type": "string",       // NPC type (references NPC definition)
      "dialog": "string",     // Dialog ID for this NPC
      "movement": "string"    // Movement pattern: "static", "patrol", "random"
    }
  ],
  "encounters": {             // Encounter configuration
    "rate": "number",         // Base encounter rate (0-1)
    "monsters": [             // Possible monsters to encounter
      {
        "id": "string",       // Monster ID
        "level": "number",    // Level range minimum
        "levelMax": "number", // Level range maximum
        "weight": "number"    // Encounter weight (higher = more common)
      }
    ]
  },
  "connections": [            // Connections to other maps
    {
      "direction": "string",  // "north", "east", "south", "west"
      "x": "number",          // X position of connection
      "y": "number",          // Y position of connection
      "targetMap": "string",  // Target map ID
      "targetX": "number",    // X position on target map
      "targetY": "number"     // Y position on target map
    }
  ]
}
```

## Tile Types

Map tiles are represented by integers in the grid. The meaning of each integer is defined in `TILE_TYPES` in `constants.js`:

- 0: FLOOR - Basic walkable tile
- 1: WALL - Impassable barrier
- 2: GRASS - Encounter zone for wild monsters
- 3: WATER - Water tile (usually impassable)
- 4: DOOR - Door to enter buildings
- 5: ENCOUNTER - Special encounter zone

## Example

Here's a simple example of a hometown map:

```json
{
  "id": "hometown",
  "name": "Hometown",
  "width": 10,
  "height": 8,
  "tileSize": 32,
  "tilemap": {
    "grid": [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 4, 0, 0, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    "collisions": [1],
    "encounters": [2]
  },
  "npcs": [
    {
      "id": "professor",
      "x": 3,
      "y": 3,
      "type": "professor",
      "dialog": "professor-greeting",
      "movement": "static"
    }
  ],
  "encounters": {
    "rate": 0.1,
    "monsters": [
      {
        "id": "monster-001",
        "level": 2,
        "levelMax": 4,
        "weight": 10
      },
      {
        "id": "monster-002",
        "level": 2,
        "levelMax": 3,
        "weight": 5
      }
    ]
  },
  "connections": [
    {
      "direction": "east",
      "x": 9,
      "y": 4,
      "targetMap": "route-1",
      "targetX": 0,
      "targetY": 4
    }
  ]
}
```

## Notes

- The grid array is structured as `grid[y][x]`, so the first array is the top row.
- All maps must be rectangular, with all rows having the same length.
- The edge of the map should generally have collision tiles to prevent the player from walking off the map.
- Map connections should align with the target map to ensure smooth transitions.