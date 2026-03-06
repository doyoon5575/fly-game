# Sky Runner

Sky Runner is a Unity 3D arcade flight prototype focused on fast, readable, satisfying flight controls.

## MVP Features
- Third-person arcade flight
- Speed / pitch / yaw / roll control
- Boost system
- Health and collision damage
- Sequential checkpoints
- Race timer
- Respawn after crash
- Minimal HUD

## Recommended Unity Version
- Unity 2022 LTS or later

## Suggested Folder Structure
Assets/
  _Project/
    Scenes/
    Scripts/
      Core/
      Player/
      Camera/
      Gameplay/
      Systems/
      UI/
    ScriptableObjects/
    Prefabs/
    Materials/
    Models/
    Audio/
    VFX/

## Setup Steps
1. Create a new 3D Unity project.
2. Create the recommended folder structure.
3. Add the scripts from this repository into the matching folders.
4. Create a PlaneConfig ScriptableObject from:
   Create > SkyRunner > Plane Config
5. Create a plane GameObject with:
   - Rigidbody
   - Collider
   - PlaneController
   - PlaneRaceProgress
6. Create a follow camera object and attach ChaseCamera.
7. Place checkpoints with trigger colliders and assign indices in order.
8. Create a CheckpointManager and assign all checkpoints in sequence.
9. Create a RaceTimer and assign the manager.
10. Build a HUD Canvas and assign the HUDController references.

## Fastest Play Test
If you want the project to be playable from an empty scene with almost no manual setup:
1. Open the project in Unity 2022 LTS.
2. Open any blank scene.
3. Press Play.

The auto bootstrap creates:
- a simple player plane
- a chase camera
- a sample checkpoint course
- race timer and respawn systems
- a minimal HUD
- ground and a few obstacles

If you want manual control instead, place `SkyRunnerBootstrap` in the scene yourself.

## Input (Default MVP)
- W / S: throttle up / down
- A / D: yaw left / right
- Up / Down Arrow: pitch
- Q / E: roll
- Left Shift: boost
- R: manual respawn
- Escape: optional pause handling later

## Recommended Prototype Scene
- Simple skybox
- Ground or floating islands
- 10 checkpoints
- One start area
- A few simple obstacles such as pillars and rock walls

## MVP Test Checklist
- Plane always moves forward
- Plane can turn and climb/dive
- Boost increases speed and drains energy
- Plane takes damage on collision
- Respawn restores plane state
- Checkpoints progress in correct order
- Timer starts at first checkpoint and ends at finish
- HUD updates speed, altitude, health, boost, checkpoints, time

## Extension Ideas After MVP
- Time attack ranking
- Plane unlocks
- Multiple maps
- Free flight mode
- Collectibles
- Combat prototype
- Mobile controls
