# AGENTS.md

## Project Name
Sky Runner

## Project Summary
Sky Runner is a Unity-based 3D arcade flight prototype.
The player controls a plane in third-person view, flies through checkpoints,
avoids terrain and obstacles, uses boost, and completes a timed course.

## Main Goal
Build a playable MVP for PC with:
- arcade flight controls
- chase camera
- checkpoint progression
- race timer
- collision / respawn
- HUD for speed, altitude, boost, health, checkpoints

## MVP Scope
Include:
- one playable plane
- one prototype map
- one race/checkpoint mode
- simple collision damage
- boost system
- respawn after crash
- minimal HUD

Exclude:
- multiplayer
- full open world
- realistic flight simulation
- advanced enemy AI
- full combat system
- inventory/shop/customization
- story campaign

## Technical Stack
- Unity 2022 LTS or later
- C#
- TextMeshPro
- Built-in physics (Rigidbody)
- Old Input Manager for MVP
- Prefer beginner-readable MonoBehaviour architecture

## Design Principles
- Prioritize control feel over realism
- Avoid overengineering
- Keep scripts small and focused
- Expose tuning values with serialized fields
- Make everything testable in editor quickly
- Use direct and explicit references over abstract systems unless abstraction adds clear value

## File Organization
- Assets/_Project/Scenes
- Assets/_Project/Scripts/Core
- Assets/_Project/Scripts/Player
- Assets/_Project/Scripts/Camera
- Assets/_Project/Scripts/Gameplay
- Assets/_Project/Scripts/UI
- Assets/_Project/ScriptableObjects
- Assets/_Project/Prefabs

## Coding Rules
- Add XML summary comments to gameplay classes
- Prefer private serialized fields with public read-only properties where needed
- Minimize public mutable state
- Avoid giant manager classes
- Avoid magic numbers when values should be tunable
- Keep beginner readability high
- Use clear method names
- Keep Update/FixedUpdate responsibilities separated

## Expected Deliverable Format
When implementing a feature:
1. Briefly state the gameplay intent
2. List created/edited files
3. Provide complete runnable code
4. Explain Unity Inspector setup
5. Provide quick manual test steps

## Priority Order
1. Plane controller
2. Plane config / tuning separation
3. Chase camera
4. Checkpoint progression
5. Race timer
6. Respawn
7. HUD
8. polish

## QA Expectations
Every completed feature should be testable in isolation.
Check for:
- null reference risks
- missing serialized references
- physics instability
- camera jitter
- checkpoint order bugs
- incorrect HUD updates

## Non-Goals
Do not add:
- procedural world generation
- skill trees
- cinematic systems
- mission dialog systems
- realistic aerodynamics
- online features

## Definition of Done for MVP
The MVP is considered done when:
- the player can fly through a full checkpoint course
- the timer starts and ends correctly
- boost is visible and functional
- collision causes damage and/or respawn behavior
- HUD updates correctly
- the course is replayable without manual scene fixes
