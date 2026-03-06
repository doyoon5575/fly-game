# Sky Runner Web Architecture

## Intent
Port the current Unity MVP into a browser-playable game without throwing away the gameplay boundaries that already work.

The rule is simple:
- keep gameplay systems small
- keep tuning data separate
- keep rendering and DOM code outside core gameplay decisions

## Runtime Stack
- Vite for local dev/build
- Three.js for rendering
- Plain JavaScript modules for gameplay
- DOM-based HUD

## Module Map
### App shell
- `src/main.js`
- `src/game/Game.js`

### Config
- `src/game/config/planeConfig.js`
- `src/game/config/courseConfig.js`

### Input
- `src/game/core/InputController.js`

### Player
- `src/game/player/PlaneController.js`
- `src/game/player/PlaneView.js`

### Camera
- `src/game/camera/ChaseCamera.js`

### Gameplay
- `src/game/gameplay/Checkpoint.js`
- `src/game/gameplay/CheckpointManager.js`
- `src/game/gameplay/RaceTimer.js`
- `src/game/gameplay/RespawnSystem.js`

### World
- `src/game/world/CourseFactory.js`
- `src/game/world/CollisionSystem.js`

### UI
- `src/game/ui/HUD.js`

## Unity To Web Mapping
- `PlaneConfig.cs` -> `planeConfig.js`
- `PlaneController.cs` -> `PlaneController.js`
- `PlaneRaceProgress.cs` + `CheckpointManager.cs` -> `CheckpointManager.js`
- `ChaseCamera.cs` -> `ChaseCamera.js`
- `RaceTimer.cs` -> `RaceTimer.js`
- `RespawnSystem.cs` -> `RespawnSystem.js`
- `HUDController.cs` -> `HUD.js`
- `SkyRunnerBootstrap.cs` -> `Game.js` + `CourseFactory.js`

## Update Flow
1. Read keyboard state.
2. Update plane speed, boost, rotation, and movement.
3. Resolve collisions.
4. Apply respawn if needed.
5. Validate checkpoint progress.
6. Advance timer.
7. Update chase camera.
8. Update HUD.
9. Render frame.

## Design Notes
- Physics is intentionally lightweight. The web port uses direct transform updates instead of a full rigidbody simulation.
- The original Unity config values were kept so tuning stays familiar.
- Collisions are simple by design: ground kill + cylindrical obstacle hits.
- The HUD is DOM, not part of the Three.js scene, so iteration stays fast.

## Next Reasonable Steps
- Add result screen and restart flow
- Add sound and checkpoint feedback
- Add plane tuning presets
- Replace primitive course art with authored assets
