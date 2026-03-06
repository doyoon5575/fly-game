# Sky Runner - Game Design Document

## 1. High Concept
Sky Runner is a 3D arcade flight game where the player pilots a plane through a course of checkpoints,
uses boost strategically, avoids obstacles, and tries to finish quickly and cleanly.

## 2. Core Fantasy
The player should feel:
- fast
- in control
- skillful
- challenged by space and speed
- rewarded for smooth flying

## 3. Core Player Actions
- accelerate and decelerate
- pitch up/down
- yaw left/right
- roll left/right
- boost through open sections
- pass checkpoints
- recover from mistakes
- complete a timed run

## 4. Target MVP
A small playable prototype with:
- one plane
- one course
- one timed checkpoint mode
- one HUD
- simple crash / respawn

## 5. Primary Game Loop
Start run -> fly to next checkpoint -> avoid obstacles -> use boost on safe straights ->
manage damage and speed -> finish course -> see result -> retry for better time

## 6. 30-second Experience
Within 30 seconds the player should:
- understand basic forward movement
- steer the plane
- pass at least one checkpoint
- notice speed and boost feedback

## 7. 3-minute Experience
Within 3 minutes the player should:
- complete a full course
- experience a few turns and altitude changes
- make at least one meaningful boost decision
- understand that clean flying leads to better results

## 8. Course Design Rules
- first checkpoint should be clearly visible from spawn
- first 3 checkpoints should teach basic turning
- mid-course should introduce tighter spaces or altitude changes
- final section should reward mastery with a faster straight path
- avoid blind checkpoint placement

## 9. Checkpoint Rules
- checkpoints must be passed in order
- passing a checkpoint should give clear audiovisual feedback
- wrong-order checkpoints should do nothing
- final checkpoint ends the run

## 10. Failure Conditions
- health reaches zero
- player collides too hard with terrain/obstacle
- optional out-of-bounds fail
- player manually resets

## 11. Success Conditions
- final checkpoint passed
- race time recorded
- optional medal/rank later

## 12. HUD Priority
Highest priority:
- speed
- altitude
- boost
- health
- next checkpoint
- timer

## 13. Scope Cutline
Do not include in MVP:
- combat
- enemy AI
- open world exploration
- narrative
- upgrade economy
- cosmetic customization
- advanced weather

## 14. Post-MVP Expansion
- additional planes with different handling
- race rankings
- challenge missions
- free-flight mode
- collectibles
- combat variant
