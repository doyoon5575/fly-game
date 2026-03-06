import { Color, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { ChaseCamera } from "./camera/ChaseCamera.js";
import { courseConfig } from "./config/courseConfig.js";
import { planeConfig } from "./config/planeConfig.js";
import { InputController } from "./core/InputController.js";
import { CheckpointManager } from "./gameplay/CheckpointManager.js";
import { RaceTimer } from "./gameplay/RaceTimer.js";
import { RespawnSystem } from "./gameplay/RespawnSystem.js";
import { PlaneController } from "./player/PlaneController.js";
import { HUD } from "./ui/HUD.js";
import { CollisionSystem } from "./world/CollisionSystem.js";
import { CourseFactory } from "./world/CourseFactory.js";

export class Game {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.scene = new Scene();
    this.scene.background = new Color("#8bcdf8");

    this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2500);
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.rootElement.appendChild(this.renderer.domElement);

    this.input = new InputController();
    this.hud = new HUD();
    this.courseFactory = new CourseFactory(this.scene);

    this.lastFrameTime = 0;
    this.animationFrameId = 0;

    this.handleResize = this.handleResize.bind(this);
    this.tick = this.tick.bind(this);
  }

  start() {
    const world = this.courseFactory.createWorld(courseConfig);

    this.plane = new PlaneController(world.planeObject, planeConfig);
    this.plane.setSpawn(world.spawnPosition, world.spawnRotation);

    this.checkpointManager = new CheckpointManager(world.checkpoints);
    this.raceTimer = new RaceTimer(this.checkpointManager);
    this.collisionSystem = new CollisionSystem(world.obstacles, 0);
    this.chaseCamera = new ChaseCamera(this.camera, this.plane);
    this.respawnSystem = new RespawnSystem(
      this.plane,
      this.checkpointManager,
      this.raceTimer,
      () => {
        this.chaseCamera.snap();
        this.hud.showMessage("Respawned. Fly through checkpoint one to restart.");
      }
    );

    this.checkpointManager.onCheckpointPassed((nextCheckpointIndex, totalCheckpoints) => {
      if (nextCheckpointIndex < totalCheckpoints) {
        this.hud.showMessage(`Checkpoint ${nextCheckpointIndex}/${totalCheckpoints}`);
      }
    });

    this.checkpointManager.onCourseFinished(() => {
      this.hud.showMessage(`Course clear in ${this.raceTimer.getFormattedTime()} - press R to retry`);
    });

    this.chaseCamera.snap();
    this.hud.update(this.plane, this.checkpointManager, this.raceTimer);
    this.hud.showMessage("Fly the course. Pass checkpoints in order.");

    window.addEventListener("resize", this.handleResize);
    this.animationFrameId = window.requestAnimationFrame(this.tick);
  }

  tick(time) {
    const dt = Math.min((time - this.lastFrameTime) * 0.001 || 0.016, 0.05);
    this.lastFrameTime = time;

    const inputState = this.input.getState();
    this.plane.update(dt, inputState);
    this.collisionSystem.update(dt, this.plane);

    if (this.respawnSystem.update(inputState)) {
      this.hud.update(this.plane, this.checkpointManager, this.raceTimer);
      this.renderFrame();
      this.animationFrameId = window.requestAnimationFrame(this.tick);
      return;
    }

    this.checkpointManager.update(this.plane.position, this.plane.collisionRadius);
    this.raceTimer.update(dt);
    this.chaseCamera.update(dt);
    this.hud.update(this.plane, this.checkpointManager, this.raceTimer);

    this.renderFrame();
    this.animationFrameId = window.requestAnimationFrame(this.tick);
  }

  renderFrame() {
    this.renderer.render(this.scene, this.camera);
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  dispose() {
    window.cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener("resize", this.handleResize);
    this.input.dispose();
    this.renderer.dispose();
  }
}
