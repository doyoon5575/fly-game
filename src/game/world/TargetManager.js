import {
  BoxGeometry,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  RingGeometry,
  SphereGeometry,
  Vector3
} from "three";

const TMP_FORWARD = new Vector3();
const TMP_RIGHT = new Vector3();
const TMP_SEGMENT = new Vector3();
const TMP_TO_CENTER = new Vector3();
const TMP_CLOSEST = new Vector3();

export class TargetManager {
  constructor(scene) {
    this.scene = scene;
    this.targets = [];
    this.effects = [];
    this.destroyedCount = 0;
    this.highestSpawnAltitude = 0;
    this.targetBandHeight = 130;
    this.coverageHeight = 900;
  }

  reset(planePosition, planeForward) {
    for (const target of this.targets) {
      this.scene.remove(target.group);
    }

    for (const effect of this.effects) {
      this.scene.remove(effect.mesh);
    }

    this.targets.length = 0;
    this.effects.length = 0;
    this.destroyedCount = 0;
    this.highestSpawnAltitude = planePosition.y;
    this.ensureCoverage(planePosition, planeForward);
  }

  update(dt, plane) {
    this.ensureCoverage(plane.position, plane.forward);
    this.updateTargets(dt);
    this.updateEffects(dt);
    this.pruneFarTargets(plane.position);
  }

  ensureCoverage(planePosition, planeForward) {
    while (this.highestSpawnAltitude < planePosition.y + this.coverageHeight) {
      this.highestSpawnAltitude += this.targetBandHeight;
      this.spawnBand(this.highestSpawnAltitude, planePosition, planeForward);
    }
  }

  spawnBand(altitude, planePosition, planeForward) {
    TMP_FORWARD.copy(planeForward).setY(0).normalize();
    if (TMP_FORWARD.lengthSq() < 0.001) {
      TMP_FORWARD.set(0, 0, 1);
    }

    TMP_RIGHT.set(TMP_FORWARD.z, 0, -TMP_FORWARD.x).normalize();

    const center = planePosition.clone()
      .addScaledVector(TMP_FORWARD, 220 + Math.random() * 150)
      .addScaledVector(TMP_RIGHT, (Math.random() - 0.5) * 180);
    center.y = altitude;

    const targetCount = 4 + Math.floor(Math.random() * 3);
    for (let index = 0; index < targetCount; index += 1) {
      const offset = TMP_RIGHT.clone()
        .multiplyScalar((Math.random() - 0.5) * 180)
        .addScaledVector(TMP_FORWARD, (Math.random() - 0.2) * 120);
      offset.y = (Math.random() - 0.5) * 60;

      this.createTarget(center.clone().add(offset), Math.random() > 0.35 ? "drone" : "balloon");
    }
  }

  createTarget(position, type) {
    const group = new Group();
    group.position.copy(position);

    const shellColor = type === "drone" ? "#ffd37f" : "#8be0ff";
    const accentColor = type === "drone" ? "#ff7843" : "#6bffb8";
    const shell = new Mesh(
      new SphereGeometry(type === "drone" ? 2.8 : 3.4, 18, 18),
      new MeshStandardMaterial({
        color: new Color(shellColor),
        roughness: 0.45,
        metalness: type === "drone" ? 0.35 : 0.08,
        emissive: new Color(accentColor),
        emissiveIntensity: 0.25
      })
    );
    group.add(shell);

    const ring = new Mesh(
      new RingGeometry(3.6, 4.3, 24),
      new MeshStandardMaterial({
        color: new Color("#ffffff"),
        emissive: new Color(accentColor),
        emissiveIntensity: 0.6,
        side: 2,
        transparent: true,
        opacity: 0.8
      })
    );
    ring.rotation.x = Math.PI * 0.5;
    group.add(ring);

    if (type === "drone") {
      const fin = new Mesh(
        new BoxGeometry(0.35, 5.2, 0.35),
        new MeshStandardMaterial({ color: new Color("#13263a"), roughness: 0.8 })
      );
      group.add(fin);
    }

    this.scene.add(group);

    this.targets.push({
      group,
      shell,
      radius: type === "drone" ? 3.1 : 3.7,
      health: type === "drone" ? 34 : 48,
      driftSeed: Math.random() * Math.PI * 2,
      driftSpeed: 0.6 + Math.random() * 0.5
    });
  }

  updateTargets(dt) {
    const now = performance.now() * 0.001;

    for (const target of this.targets) {
      target.group.rotation.y += target.driftSpeed * dt;
      target.group.position.x += Math.sin(now + target.driftSeed) * dt * 2.6;
      target.group.position.z += Math.cos(now * 1.5 + target.driftSeed) * dt * 1.8;
    }
  }

  updateEffects(dt) {
    for (let index = this.effects.length - 1; index >= 0; index -= 1) {
      const effect = this.effects[index];
      effect.age += dt;
      effect.mesh.scale.multiplyScalar(1 + dt * 2.4);
      effect.mesh.material.opacity = Math.max(0, 0.7 - effect.age * 1.4);

      if (effect.age >= effect.life) {
        this.scene.remove(effect.mesh);
        this.effects.splice(index, 1);
      }
    }
  }

  pruneFarTargets(planePosition) {
    for (let index = this.targets.length - 1; index >= 0; index -= 1) {
      const target = this.targets[index];
      const isFarBelow = target.group.position.y < planePosition.y - 280;
      const isFarAway = target.group.position.distanceToSquared(planePosition) > 1400 * 1400;

      if (!isFarBelow && !isFarAway) {
        continue;
      }

      this.scene.remove(target.group);
      this.targets.splice(index, 1);
    }
  }

  hitTestSegment(start, end, projectileRadius, damage) {
    let nearestIndex = -1;
    let nearestDistance = Infinity;

    for (let index = 0; index < this.targets.length; index += 1) {
      const target = this.targets[index];
      const distanceSq = segmentSphereDistanceSq(start, end, target.group.position, target.radius + projectileRadius);

      if (distanceSq === null || distanceSq >= nearestDistance) {
        continue;
      }

      nearestDistance = distanceSq;
      nearestIndex = index;
    }

    if (nearestIndex < 0) {
      return false;
    }

    this.applyDamage(nearestIndex, damage);
    return true;
  }

  applyDamage(index, damage) {
    const target = this.targets[index];
    if (!target) {
      return;
    }

    target.health -= damage;
    target.shell.scale.multiplyScalar(0.92);

    if (target.health > 0) {
      return;
    }

    this.destroyTarget(index);
  }

  destroyTarget(index) {
    const [target] = this.targets.splice(index, 1);
    if (!target) {
      return;
    }

    this.spawnBurst(target.group.position);
    this.scene.remove(target.group);
    this.destroyedCount += 1;
  }

  spawnBurst(position) {
    const mesh = new Mesh(
      new SphereGeometry(1.4, 12, 12),
      new MeshStandardMaterial({
        color: new Color("#fff6ba"),
        emissive: new Color("#ff7a4c"),
        emissiveIntensity: 1.2,
        transparent: true,
        opacity: 0.7
      })
    );
    mesh.position.copy(position);
    this.scene.add(mesh);
    this.effects.push({ mesh, age: 0, life: 0.5 });
  }

  getCollisionBodies() {
    return this.targets.map((target) => ({
      shape: "sphere",
      position: target.group.position,
      radius: target.radius
    }));
  }
}

function segmentSphereDistanceSq(start, end, center, radius) {
  TMP_SEGMENT.subVectors(end, start);
  const segmentLengthSq = TMP_SEGMENT.lengthSq();

  if (segmentLengthSq <= 0.0001) {
    return start.distanceToSquared(center) <= radius * radius ? 0 : null;
  }

  TMP_TO_CENTER.subVectors(center, start);
  const t = clamp(TMP_TO_CENTER.dot(TMP_SEGMENT) / segmentLengthSq, 0, 1);
  TMP_CLOSEST.copy(start).addScaledVector(TMP_SEGMENT, t);
  const distanceSq = TMP_CLOSEST.distanceToSquared(center);
  return distanceSq <= radius * radius ? distanceSq : null;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
