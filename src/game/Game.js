import { Color, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { WeaponSystem } from "./combat/WeaponSystem.js";
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
import { TargetManager } from "./world/TargetManager.js";

export class Game {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.scene = new Scene();
    this.scene.background = new Color("#8bcdf8");

    this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 4000);
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
    this.raceTimer = new RaceTimer(this.checkpointManager, {
      autoStartOnCheckpoint: false,
      stopOnCourseFinish: false
    });
    this.raceTimer.start();

    this.targetManager = new TargetManager(this.scene);
    this.targetManager.reset(this.plane.position, this.plane.forward);

    this.weaponSystem = new WeaponSystem(this.scene, this.plane, this.targetManager);
    this.collisionSystem = new CollisionSystem(world.obstacles, 0);
    this.chaseCamera = new ChaseCamera(this.camera, this.plane);
    this.respawnSystem = new RespawnSystem(
      this.plane,
      this.checkpointManager,
      this.raceTimer,
      () => {
        this.targetManager.reset(this.plane.position, this.plane.forward);
        this.weaponSystem.reset();
        this.raceTimer.start();
        this.chaseCamera.snap();
        this.hud.showMessage("Run reset. Climb, fire, and keep rising.");
      }
    );

    this.checkpointManager.onCourseFinished(() => {
      this.hud.showMessage("Training route clear. The sky above keeps going.");
    });

    this.chaseCamera.snap();
    this.hud.update(this.plane, this.raceTimer, this.weaponSystem, this.targetManager);
    this.hud.showMessage("Mindless mode: climb, shoot targets, avoid collisions.");

    window.addEventListener("resize", this.handleResize);
    this.animationFrameId = window.requestAnimationFrame(this.tick);
  }

  tick(time) {
    const dt = Math.min((time - this.lastFrameTime) * 0.001 || 0.016, 0.05);
    this.lastFrameTime = time;

    const inputState = this.input.getState();
    this.plane.update(dt, inputState);
    this.targetManager.update(dt, this.plane);
    this.weaponSystem.update(dt, inputState);
    this.collisionSystem.setDynamicObstacles(this.targetManager.getCollisionBodies());
    this.collisionSystem.update(dt, this.plane);

    if (this.respawnSystem.update(inputState)) {
      this.hud.update(this.plane, this.raceTimer, this.weaponSystem, this.targetManager);
      this.renderFrame();
      this.animationFrameId = window.requestAnimationFrame(this.tick);
      return;
    }

    this.checkpointManager.update(this.plane.position, this.plane.collisionRadius);
    this.raceTimer.update(dt);
    this.chaseCamera.update(dt);
    this.hud.update(this.plane, this.raceTimer, this.weaponSystem, this.targetManager);

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
