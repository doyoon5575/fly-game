import { Euler, Quaternion, Vector3 } from "three";

const WORLD_UP = new Vector3(0, 1, 0);
const LOCAL_FORWARD = new Vector3(0, 0, 1);
const LOCAL_UP = new Vector3(0, 1, 0);
const TMP_TARGET_VELOCITY = new Vector3();
const TMP_EULER = new Euler(0, 0, 0, "YXZ");

export class PlaneController {
  constructor(object3d, config) {
    this.object3d = object3d;
    this.config = config;

    this.currentSpeed = config.startSpeed;
    this.currentBoost = config.maxBoost;
    this.currentHealth = config.maxHealth;
    this.currentWeaponHeat = 0;
    this.boosting = false;

    this.spawnPosition = new Vector3();
    this.spawnRotation = new Quaternion();
    this.velocity = new Vector3();
    this.forwardVector = new Vector3(0, 0, 1);
    this.upVector = new Vector3(0, 1, 0);

    this.heading = 0;
    this.pitchAngle = 0;
    this.bankAngle = 0;

    this.smoothedPitchInput = 0;
    this.smoothedYawInput = 0;
    this.smoothedRollInput = 0;

    this.maxAltitude = 0;
  }

  setSpawn(position, quaternion) {
    this.spawnPosition.copy(position);
    this.spawnRotation.copy(quaternion);
    TMP_EULER.setFromQuaternion(quaternion, "YXZ");
    this.heading = TMP_EULER.y;
    this.pitchAngle = TMP_EULER.x;
    this.bankAngle = TMP_EULER.z;
    this.resetToSpawn();
  }

  update(dt, input) {
    this.updatePilotInputs(dt, input);
    this.updateSpeed(dt, input.throttle);
    this.updateBoost(dt, input.boost);
    this.updateOrientation(dt);
    this.updateMovement(dt);
    this.updateVisualRig(dt);
    this.maxAltitude = Math.max(this.maxAltitude, this.altitude);
  }

  updatePilotInputs(dt, input) {
    const smoothing = 1 - Math.exp(-this.config.inputResponse * dt);
    this.smoothedPitchInput = lerp(this.smoothedPitchInput, input.pitch, smoothing);
    this.smoothedYawInput = lerp(this.smoothedYawInput, input.yaw, smoothing);
    this.smoothedRollInput = lerp(this.smoothedRollInput, input.roll, smoothing);
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
      this.currentBoost = Math.max(0, this.currentBoost - this.config.boostDrainPerSecond * dt);
    } else {
      this.currentBoost = Math.min(this.config.maxBoost, this.currentBoost + this.config.boostRechargePerSecond * dt);
    }
  }

  updateOrientation(dt) {
    const speedRatio = inverseLerp(this.config.minSpeed, this.config.maxSpeed, this.currentSpeed);

    const targetBank = degToRad(this.config.maxBankAngle) * clamp(
      this.smoothedRollInput + this.smoothedYawInput * this.config.yawBankAssist,
      -1,
      1
    );
    const targetPitch = this.smoothedPitchInput >= 0
      ? degToRad(this.config.maxClimbPitch) * this.smoothedPitchInput
      : degToRad(this.config.maxDivePitch) * this.smoothedPitchInput;

    this.bankAngle = damp(this.bankAngle, targetBank, this.config.rollResponse, dt);
    this.pitchAngle = damp(this.pitchAngle, targetPitch, this.config.pitchResponse, dt);

    const coordinatedTurn = Math.sin(this.bankAngle) * degToRad(this.config.coordinatedTurnRate);
    const rudderTurn = this.smoothedYawInput * degToRad(this.config.yawRate);
    this.heading += (coordinatedTurn + rudderTurn) * (0.35 + speedRatio * 0.65) * dt;

    TMP_EULER.set(this.pitchAngle, this.heading, this.bankAngle, "YXZ");
    this.object3d.quaternion.setFromEuler(TMP_EULER);
    this.refreshOrientationVectors();
  }

  refreshOrientationVectors() {
    this.forwardVector.copy(LOCAL_FORWARD).applyQuaternion(this.object3d.quaternion).normalize();
    this.upVector.copy(LOCAL_UP).applyQuaternion(this.object3d.quaternion).normalize();
  }

  updateMovement(dt) {
    const appliedSpeed = this.boosting
      ? this.currentSpeed * this.config.boostMultiplier
      : this.currentSpeed;

    TMP_TARGET_VELOCITY.copy(this.forwardVector).multiplyScalar(appliedSpeed);

    const response = 1 - Math.exp(-this.config.airResponse * dt);
    this.velocity.lerp(TMP_TARGET_VELOCITY, response);

    const liftRatio = inverseLerp(this.config.stallSpeed, this.config.maxSpeed, appliedSpeed);
    const climbLift = Math.max(0, this.forwardVector.y) * this.config.climbLiftStrength;
    const divePenalty = Math.min(0, this.forwardVector.y) * this.config.diveGravityPenalty;
    const bankPenalty = Math.abs(this.bankAngle) / degToRad(this.config.maxBankAngle) * this.config.bankLiftPenalty;
    const verticalAcceleration = (
      this.config.baseLift +
      liftRatio * this.config.liftStrength +
      climbLift +
      divePenalty -
      this.config.gravity -
      bankPenalty
    );

    this.velocity.y += verticalAcceleration * dt;
    this.velocity.y *= Math.exp(-this.config.verticalDamping * dt);

    this.object3d.position.addScaledVector(this.velocity, dt);
  }

  updateVisualRig(dt) {
    const visualRig = this.object3d.userData.visualRig;
    const pilotPivot = this.object3d.userData.pilotPivot;
    const exhaust = this.object3d.userData.exhaust;

    if (visualRig) {
      visualRig.rotation.x = damp(visualRig.rotation.x, -this.smoothedPitchInput * 0.08, 4.5, dt);
      visualRig.position.y = damp(visualRig.position.y, Math.abs(this.velocity.y) * 0.002, 5, dt);
    }

    if (pilotPivot) {
      pilotPivot.rotation.x = damp(pilotPivot.rotation.x, this.smoothedPitchInput * 0.22, 7, dt);
      pilotPivot.rotation.z = damp(pilotPivot.rotation.z, -this.smoothedRollInput * 0.28, 7, dt);
    }

    if (exhaust) {
      const boostScale = this.boosting ? 1.45 : 0.9;
      exhaust.scale.z = damp(exhaust.scale.z, boostScale, 8, dt);
    }
  }

  applyCollisionPenalty(amount, collisionNormal) {
    this.takeDamage(amount);
    this.currentSpeed = Math.max(this.config.minSpeed, this.currentSpeed * 0.72);
    this.velocity.addScaledVector(collisionNormal, 48);
    this.velocity.y = Math.max(this.velocity.y, 8);
  }

  takeDamage(amount) {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
  }

  setWeaponHeat(value) {
    this.currentWeaponHeat = clamp(value, 0, this.config.weapon.maxHeat);
  }

  resetToSpawn() {
    this.object3d.position.copy(this.spawnPosition);
    this.object3d.quaternion.copy(this.spawnRotation);
    TMP_EULER.setFromQuaternion(this.spawnRotation, "YXZ");
    this.heading = TMP_EULER.y;
    this.pitchAngle = TMP_EULER.x;
    this.bankAngle = TMP_EULER.z;
    this.maxAltitude = this.spawnPosition.y;
    this.restoreFullState();
    this.refreshOrientationVectors();
    this.velocity.copy(this.forwardVector).multiplyScalar(this.config.startSpeed);
  }

  restoreFullState() {
    this.currentSpeed = clamp(this.config.startSpeed, this.config.minSpeed, this.config.maxSpeed);
    this.currentBoost = this.config.maxBoost;
    this.currentHealth = this.config.maxHealth;
    this.currentWeaponHeat = 0;
    this.boosting = false;
    this.smoothedPitchInput = 0;
    this.smoothedYawInput = 0;
    this.smoothedRollInput = 0;
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

  get weaponHeatNormalized() {
    return this.config.weapon.maxHeat > 0 ? this.currentWeaponHeat / this.config.weapon.maxHeat : 0;
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

  get forward() {
    return this.forwardVector;
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function degToRad(value) {
  return value * (Math.PI / 180);
}

function damp(current, target, smoothing, dt) {
  return lerp(current, target, 1 - Math.exp(-smoothing * dt));
}

function lerp(from, to, alpha) {
  return from + (to - from) * alpha;
}

function inverseLerp(min, max, value) {
  if (max - min === 0) {
    return 0;
  }

  return clamp((value - min) / (max - min), 0, 1);
}
