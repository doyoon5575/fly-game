# Sky Runner - Roadmap

## Phase 1: 2-Week MVP
### Goal
Validate flight feel and checkpoint loop.

### Deliverables
- one playable plane
- stable chase camera
- one course with ordered checkpoints
- timer
- respawn
- HUD

### Tasks
1. Create project structure
2. Implement PlaneConfig
3. Implement PlaneController
4. Implement ChaseCamera
5. Implement Checkpoint and CheckpointManager
6. Implement RaceTimer
7. Implement RespawnSystem
8. Implement HUDController
9. Build simple test course
10. Run tuning passes

## Phase 2: 1-Month Prototype+
### Goal
Make the prototype feel like a small game.

### Deliverables
- 2 to 3 plane configs
- multiple route difficulties
- improved visuals and feedback
- basic result screen
- simple rank/medal system
- tutorial prompts

### Tasks
1. Add plane variants
2. Add better checkpoint VFX/SFX
3. Add result state and restart flow
4. Add challenge mode
5. Add simple save/load of best time

## Phase 3: 3-Month Vertical Slice
### Goal
Create an externally testable early version.

### Deliverables
- 2 to 3 maps
- free-flight mode
- expanded mission types
- collectibles or challenge objectives
- polished UI
- menu flow

### Tasks
1. Build additional level themes
2. Add game mode selection
3. Improve art pass
4. Add optional progression systems
5. Conduct playtesting and rebalance

## Scope Control Rules
If a feature does not improve:
- flight feel
- checkpoint clarity
- replayability
within the current phase, delay it.

## Hard Cutline
Before Phase 2, do not add:
- combat
- online systems
- open world
- complex progression economy
- realistic simulation features
