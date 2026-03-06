import { Quaternion, Vector3 } from "three";

const WORLD_UP = new Vector3(0, 1, 0);
const LOCAL_FORWARD = new Vector3(0, 0, 1);
const LOCAL_UP = new Vector3(0, 1, 0);
const TMP_FORWARD = new Vector3();
const TMP_UP = new Vector3();
const TMP_HORIZON_UP = new Vector3();
const TMP_CROSS = new Vector3();

export class PlaneController {
  constructor(object3d, config) {
    this.object3d = object3d;
    this.config = config;

    this.currentSpeed = config.startSpeed;
    this.currentBoost = config.maxBoost;
    this.currentHealth = config.maxHealth;
    this.boosting = false;
    this.spawnPosition = new Vector3();
    this.spawnRotation = new Quaternion();
  }

  setSpawn(position, quaternion) {
    this.spawnPosition.copy(position);
    this.spawnRotation.copy(quaternion);
    this.resetToSpawn();
  }

  update(dt, input) {
    this.updateSpeed(dt, input.throttle);
    this.updateBoost(dt, input.boost);
    this.applyRotation(dt, input);
    this.applyMovement(dt);
  }

  updateSpeed(dt, throttleInput) {
    if (throttleInput > 0) {
      this.currentSpeed += this.config.acceleration * throttleInput * dt;
    } else if (throttleInput < 0) {
      this.currentSpeed += this.config.deceleration * throttleInput * dt;
    }

    this.currentSpeed = clamp(this.currentSpeed, this.config.minSpeed, this.config.maxSpeed);
  }

  updateBoost(dt, boostInput) {
    this.boosting = boostInput && this.currentBoost > 0;

    if (this.boosting) {
      this.currentBoost -= this.config.boostDrainPerSecond * dt;
      this.currentBoost = Math.max(0, this.currentBoost);
    } else {
      this.currentBoost += this.config.boostRechargePerSecond * dt;
      this.currentBoost = Math.min(this.config.maxBoost, this.currentBoost);
    }
  }

  applyRotation(dt, input) {
    this.object3d.rotateY(degToRad(input.yaw * this.config.yawSpeed * dt));
    this.object3d.rotateX(degToRad(input.pitch * this.config.pitchSpeed * dt));
    this.object3d.rotateZ(degToRad(-input.roll * this.config.rollSpeed * dt));

    if (Math.abs(input.roll) <= 0.01) {
      const currentRoll = this.getRollAngle();
      this.object3d.rotateZ(-currentRoll * this.config.autoLevelStrength * dt);
    }
  }

  getRollAngle() {
    TMP_FORWARD.copy(LOCAL_FORWARD).applyQuaternion(this.object3d.quaternion).normalize();
    TMP_UP.copy(LOCAL_UP).applyQuaternion(this.object3d.quaternion).normalize();
    TMP_HORIZON_UP.copy(WORLD_UP).projectOnPlane(TMP_FORWARD);

    if (TMP_HORIZON_UP.lengthSq() < 0.0001) {
      return 0;
    }

    TMP_HORIZON_UP.normalize();
    TMP_CROSS.crossVectors(TMP_UP, TMP_HORIZON_UP);

    return Math.atan2(TMP_CROSS.dot(TMP_FORWARD), TMP_UP.dot(TMP_HORIZON_UP));
  }

  applyMovement(dt) {
    const speed = this.boosting ? this.currentSpeed * this.config.boostMultiplier : this.currentSpeed;
    TMP_FORWARD.copy(LOCAL_FORWARD).applyQuaternion(this.object3d.quaternion).normalize();
    this.object3d.position.addScaledVector(TMP_FORWARD, speed * dt);
  }

  applyCollisionPenalty(amount, collisionNormal) {
    this.takeDamage(amount);
    this.currentSpeed = Math.max(this.config.minSpeed, this.currentSpeed * 0.6);

    if (collisionNormal) {
      this.object3d.position.addScaledVector(collisionNormal, 4);
    }
  }

  takeDamage(amount) {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
  }

  resetToSpawn() {
    this.object3d.position.copy(this.spawnPosition);
    this.object3d.quaternion.copy(this.spawnRotation);
    this.restoreFullState();
  }

  restoreFullState() {
    this.currentSpeed = clamp(this.config.startSpeed, this.config.minSpeed, this.config.maxSpeed);
    this.currentBoost = this.config.maxBoost;
    this.currentHealth = this.config.maxHealth;
    this.boosting = false;
  }

  get altitude() {
    return this.object3d.position.y;
  }

  get boostNormalized() {
    return this.config.maxBoost > 0 ? this.currentBoost / this.config.maxBoost : 0;
  }

  get healthNormalized() {
    return this.config.maxHealth > 0 ? this.currentHealth / this.config.maxHealth : 0;
  }

  get isDestroyed() {
    return this.currentHealth <= 0;
  }

  get position() {
    return this.object3d.position;
  }

  get quaternion() {
    return this.object3d.quaternion;
  }

  get collisionRadius() {
    return this.config.collisionRadius;
  }
}

function degToRad(value) {
  return value * (Math.PI / 180);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
