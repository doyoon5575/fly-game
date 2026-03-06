import { Vector3 } from "three";

const TMP_OFFSET = new Vector3();
const TMP_NORMAL = new Vector3();

export class CollisionSystem {
  constructor(obstacles, groundHeight = 0) {
    this.obstacles = obstacles;
    this.dynamicObstacles = [];
    this.groundHeight = groundHeight;
    this.hitCooldown = 0;
    this.hitCooldownDuration = 0.45;
  }

  setDynamicObstacles(obstacles) {
    this.dynamicObstacles = obstacles;
  }

  update(dt, plane) {
    this.hitCooldown = Math.max(0, this.hitCooldown - dt);

    if (plane.position.y <= this.groundHeight + plane.collisionRadius * 0.25) {
      plane.takeDamage(plane.config.maxHealth);
      return;
    }

    if (this.hitCooldown > 0) {
      return;
    }

    for (const obstacle of [...this.obstacles, ...this.dynamicObstacles]) {
      if (obstacle.shape === "sphere") {
        if (this.testSphereCollision(plane, obstacle)) {
          return;
        }

        continue;
      }

      const top = obstacle.position.y + obstacle.halfHeight;
      const bottom = obstacle.position.y - obstacle.halfHeight;

      if (plane.position.y < bottom - plane.collisionRadius || plane.position.y > top + plane.collisionRadius) {
        continue;
      }

      TMP_OFFSET.set(
        plane.position.x - obstacle.position.x,
        0,
        plane.position.z - obstacle.position.z
      );

      const totalRadius = plane.collisionRadius + obstacle.radius;
      if (TMP_OFFSET.lengthSq() > totalRadius * totalRadius) {
        continue;
      }

      TMP_NORMAL.copy(TMP_OFFSET);
      if (TMP_NORMAL.lengthSq() < 0.0001) {
        TMP_NORMAL.set(0, 0, -1);
      } else {
        TMP_NORMAL.normalize();
      }

      plane.applyCollisionPenalty(plane.config.collisionDamage, TMP_NORMAL);
      this.hitCooldown = this.hitCooldownDuration;
      return;
    }
  }

  testSphereCollision(plane, obstacle) {
    TMP_OFFSET.copy(plane.position).sub(obstacle.position);
    const totalRadius = plane.collisionRadius + obstacle.radius;

    if (TMP_OFFSET.lengthSq() > totalRadius * totalRadius) {
      return false;
    }

    TMP_NORMAL.copy(TMP_OFFSET);
    if (TMP_NORMAL.lengthSq() < 0.0001) {
      TMP_NORMAL.set(0, 1, 0);
    } else {
      TMP_NORMAL.normalize();
    }

    plane.applyCollisionPenalty(plane.config.collisionDamage * 0.8, TMP_NORMAL);
    this.hitCooldown = this.hitCooldownDuration;
    return true;
  }
}
