# Sky Runner

Sky Runner is being migrated from a Unity prototype into a browser-playable 3D arcade flight game built with HTML, JavaScript, and Three.js.

The Unity scripts remain in `Assets/_Project/Scripts` as gameplay reference during migration.
The playable web version lives in `src/` and runs with Vite.

## Web MVP Goals
- Stable arcade flight with physically-inspired control response
- Visible pilot and aircraft state feedback
- Boost, health, shooting, and respawn
- Destructible aerial targets
- Endless upward sky lanes to keep climbing
- Browser HUD

## Run The Web Version
1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`
3. Open the local URL shown by Vite in your browser.

## Production Build
- `npm run build`
- `npm run preview`

## Controls
- `W / S`: throttle up / down
- `A / D`: yaw left / right
- `Arrow Up / Arrow Down`: pitch
- `Q / E`: roll
- `Left Shift`: boost
- `Space / Left Click`: fire
- `R`: respawn / restart

## Architecture Mapping
- `PlaneConfig` -> `src/game/config/planeConfig.js`
- `PlaneController` -> `src/game/player/PlaneController.js`
- `ChaseCamera` -> `src/game/camera/ChaseCamera.js`
- `CheckpointManager` -> `src/game/gameplay/CheckpointManager.js`
- `RaceTimer` -> `src/game/gameplay/RaceTimer.js`
- `RespawnSystem` -> `src/game/gameplay/RespawnSystem.js`
- `HUDController` -> `src/game/ui/HUD.js`
- `SkyRunnerBootstrap` -> `src/game/Game.js` + `src/game/world/CourseFactory.js`

## Important Paths
- Web runtime: `src/`
- Web architecture notes: `docs/web_architecture.md`
- Legacy Unity prototype: `Assets/_Project/Scripts/`
