# Sky Runner - Technical Design

## 1. Architecture Overview
This prototype uses simple Unity MonoBehaviour architecture.

Main gameplay objects:
- PlaneController
- PlaneRaceProgress
- ChaseCamera
- Checkpoint
- CheckpointManager
- RaceTimer
- RespawnSystem
- HUDController

## 2. Plane Architecture
### PlaneController
Responsible for:
- input
- speed
- boost
- movement
- rotation
- collision damage
- restoring state on respawn

### PlaneConfig
Stores tunable values:
- speed
- turn rates
- boost settings
- health settings

### PlaneRaceProgress
Stores current checkpoint progression state.

## 3. Camera Architecture
### ChaseCamera
Responsible for:
- follow position
- smooth tracking
- stable orientation
- optional boost FOV feedback

## 4. Checkpoint Architecture
### Checkpoint
Contains:
- ordered index
- trigger event when player enters

### CheckpointManager
Responsible for:
- ordered checkpoint validation
- current checkpoint state
- total checkpoints
- finish detection

## 5. Timer Architecture
### RaceTimer
Responsible for:
- race start
- race elapsed time
- finish stop
- reset

Timer starts on first valid checkpoint pass and ends on final checkpoint.

## 6. Respawn Architecture
### RespawnSystem
Responsible for:
- storing spawn point
- resetting plane transform
- clearing velocity
- restoring health/boost
- resetting race progress optionally

## 7. UI Architecture
### HUDController
Reads values from gameplay components and updates:
- speed text
- altitude text
- timer text
- boost bar
- health bar
- checkpoint progress text

## 8. Data Flow
Input -> PlaneController -> Rigidbody motion
Checkpoint trigger -> CheckpointManager -> PlaneRaceProgress and RaceTimer
PlaneController state -> HUDController
Crash / reset -> RespawnSystem -> PlaneController / Timer / Progress reset

## 9. Recommended Scene Objects
- Plane
- Main Camera Rig
- CheckpointManager
- RaceTimer
- RespawnSystem
- Canvas (HUD)
- Course geometry
- Skybox / lighting

## 10. Physics Notes
- Rigidbody gravity disabled
- use interpolation for smoother visual movement if needed
- avoid extremely high speeds early
- reduce camera roll influence to prevent disorientation
- use trigger colliders for checkpoints
- use non-trigger colliders for terrain/obstacles

## 11. Tuning Principles
- prioritize readable turning over realism
- keep a comfortable minimum speed
- let boost feel strong but short
- keep collision penalties noticeable
- avoid instant frustration from tiny contact errors

## 12. Future Extension Hooks
Potential extensions:
- game state manager
- mission system
- medal ranking
- multiple plane configs
- event channels
- AI enemy system
- weapon system
