# Ability Data Schema

Ability data files define the moves and actions that monsters can perform in battle. Each ability is stored as a separate JSON file in the `data/abilities/` directory.

## Schema

    ```json
{
  "id": "string",               // Unique identifier for the ability
  "name": "string",             // Display name of the ability
  "type": "string",             // Ability type (see MONSTER_TYPES in constants.js)
  "category": "string",         // "physical", "special", or "status"
  "description": "string",      // Description of what the ability does
  "power": "number",            // Base power for damage calculation (null for status moves)
  "accuracy": "number",         // Accuracy percentage (100 = always hits)
  "pp": "number",               // Power points (number of times ability can be used)
  "target": "string",           // "opponent", "self", "all-opponents", "all", "field"
  "priority": "number",         // Priority level (higher goes first, default is 0)
  "effects": [                  // Array of additional effects
    {
      "type": "string",         // Effect type: "stat", "status", "field", "damage", etc.
      "target": "string",       // Who is affected: "user", "target", "all", etc.
      "stat": "string",         // Affected stat (for stat changes)
      "status": "string",       // Inflicted status (for status effects)
      "chance": "number",       // Probability of effect (100 = always happens)
      "stages": "number",       // Stage change for stat effects (+1, -2, etc.)
      "duration": "number"      // Effect duration in turns (null = until battle ends)
    }
  ],
  "animations": {               // Visual representation of the ability
    "color": "number",          // Primary color (hexadecimal)
    "shape": "string",          // "beam", "splash", "wave", "burst", etc.
    "duration": "number",       // Animation duration in milliseconds
    "particleCount": "number"   // Number of particles (for particle effects)
  },
  "sound": {                    // Sound effects
    "name": "string",           // Name of sound effect
    "volume": "number",         // Volume level (0-1)
    "pitch": "number"           // Pitch adjustment (1 = normal)
  }
}
```

## Ability Categories

Abilities fall into three main categories:

    - **Physical**: Uses the attacker's Attack stat against the defender's Defense stat
- **Special**: Uses the attacker's Special Attack stat against the defender's Special Defense stat
- **Status**: Does not deal direct damage, but causes status effects or stat changes

## Effect Types

Effect types determine what additional effects an ability has:

    - **stat**: Changes a stat (attack, defense, etc.) by a number of stages
- **status**: Inflicts a status condition (burn, poison, etc.)
- **field**: Affects the battle field (weather, terrain, etc.)
- **damage**: Secondary damage effect (recoil, drain, etc.)
- **volatile**: Temporary battle conditions (confusion, flinch, etc.)
- **healing**: Restores HP to target
- **critical**: Affects critical hit rate
- **protection**: Protects against certain types of moves
- **trapping**: Prevents opponent from switching or fleeing

## Example

Here's an example of a basic fire attack ability:

    ```json
{
  "id": "ember",
  "name": "Ember",
  "type": "fire",
  "category": "special",
  "description": "The target is attacked with small flames. May cause a burn.",
  "power": 40,
  "accuracy": 100,
  "pp": 25,
  "target": "opponent",
  "priority": 0,
  "effects": [
    {
      "type": "status",
      "target": "target",
      "status": "burn",
      "chance": 10,
      "duration": null
    }
  ],
  "animations": {
    "color": 16729344,
    "shape": "burst",
    "duration": 500,
    "particleCount": 20
  },
  "sound": {
    "name": "fire",
    "volume": 0.7,
    "pitch": 1.0
  }
}
```

## Notes

- Ability ID should be lowercase and kebab-case (e.g., "fire-blast")
- Power values typically range from 20 (weak) to 120 (very strong)
- Accuracy is a percentage from 1-100
- PP (Power Points) typically ranges from 5 (powerful moves) to 30 (weak moves)
- Priority values are typically between -5 and +5, with 0 being normal priority
- Stat stages can range from -6 to +6, with each stage representing a multiplier