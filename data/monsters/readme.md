# Monster Data Schema

Monster data files define the characteristics, stats, abilities, and evolution paths of monsters in the game. Each monster is stored as a separate JSON file in the `data/monsters/` directory.

## Schema

```json
{
  "id": "string",                 // Unique identifier for the monster
  "name": "string",               // Display name of the monster
  "type": "string",               // Monster type (see MONSTER_TYPES in constants.js)
  "description": "string",        // Description of the monster
  "baseStats": {                  // Base stats used to calculate actual stats
    "hp": "number",               // Health points
    "attack": "number",           // Physical attack
    "defense": "number",          // Physical defense
    "specialAttack": "number",    // Special attack
    "specialDefense": "number",   // Special defense
    "speed": "number"             // Speed (determines turn order)
  },
  "abilities": [                  // Array of ability IDs this monster can learn
    "string",                     // Reference to ability ID
    "string"
  ],
  "abilityLevels": {              // Level at which each ability is learned
    "ability-id": "number",       // Key is ability ID, value is level
    "ability-id": "number"
  },
  "evolution": {                  // Evolution information (null if doesn't evolve)
    "evolvesTo": "string",        // ID of the evolved form
    "level": "number",            // Level required for evolution (null if not level-based)
    "item": "string",             // Item required for evolution (null if not item-based)
    "condition": "string"         // Special condition for evolution (null if not condition-based)
  },
  "catchRate": "number",          // Base catch rate (0-255)
  "expYield": "number",           // Base experience yield when defeated
  "growthRate": "string",         // Growth rate category ("fast", "medium", "slow")
  "shape": {                      // Visual representation (using shapes)
    "form": "string",             // Basic shape: "circle", "square", "triangle", "star"
    "mainColor": "number",        // Main color (hexadecimal)
    "accentColor": "number"       // Accent color (hexadecimal)
  }
}
```

## Growth Rates

Growth rates determine how quickly a monster gains levels based on experience points:

- **fast**: Requires less experience to level up
- **medium**: Standard experience curve
- **slow**: Requires more experience to level up

The exact formulas for each growth rate are defined in the `MonsterSystem.js` file.

## Stats Calculation

A monster's actual stats at a given level are calculated using the following formula:

```
HP = floor((2 * BaseHP + IV + floor(EV/4)) * Level/100) + Level + 10
Other Stats = floor(((2 * BaseStat + IV + floor(EV/4)) * Level/100) + 5) * NatureModifier
```

Where:
- IV (Individual Value): A random value between 0-31 for each stat
- EV (Effort Value): Value gained through battling (0-255 for each stat)
- NatureModifier: 1.1 if favorable nature, 0.9 if unfavorable nature, 1.0 otherwise

## Example

Here's an example of a basic fire-type starter monster:

```json
{
  "id": "monster-001",
  "name": "Embercub",
  "type": "fire",
  "description": "A small fire cub. It keeps its body warm by storing heat in its fluffy fur.",
  "baseStats": {
    "hp": 45,
    "attack": 60,
    "defense": 40,
    "specialAttack": 70,
    "specialDefense": 50,
    "speed": 45
  },
  "abilities": ["ember", "scratch", "growl", "fire-fang", "flamethrower"],
  "abilityLevels": {
    "ember": 1,
    "scratch": 1,
    "growl": 5,
    "fire-fang": 12,
    "flamethrower": 20
  },
  "evolution": {
    "evolvesTo": "monster-002",
    "level": 16,
    "item": null,
    "condition": null
  },
  "catchRate": 45,
  "expYield": 62,
  "growthRate": "medium",
  "shape": {
    "form": "circle",
    "mainColor": 14423100,
    "accentColor": 16729344
  }
}
```

## Notes

- Monster IDs should follow the format `monster-XXX` where XXX is a three-digit number.
- Base stats typically range from 20 (very poor) to 120 (excellent) with 50-60 being average.
- Type effectiveness is handled by the battle system and is not part of the monster data.
- Evolution conditions can include level, item use, trading, or special conditions.