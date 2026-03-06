import { Color, Mesh, MeshStandardMaterial, SphereGeometry, Vector3 } from "three";

const TMP_DIRECTION = new Vector3();
const TMP_START = new Vector3();
const TMP_END = new Vector3();

export class WeaponSystem {
  constructor(scene, plane, targetManager) {
    this.scene = scene;
    this.plane = plane;
    this.targetManager = targetManager;
    this.projectiles = [];
    this.fireCooldown = 0;
    this.muzzleIndex = 0;
    this.currentHeat = 0;
    this.overheated = false;

    this.projectileGeometry = new SphereGeometry(0.18, 8, 8);
    this.projectileMaterial = new MeshStandardMaterial({
      color: new Color("#fff2a6"),
      emissive: new Color("#ff8f43"),
      emissiveIntensity: 1.3
    });
  }

  update(dt, input) {
    this.fireCooldown = Math.max(0, this.fireCooldown - dt);
    this.currentHeat = Math.max(0, this.currentHeat - this.plane.config.weapon.coolingPerSecond * dt);

    if (this.overheated && this.currentHeat <= this.plane.config.weapon.maxHeat * 0.25) {
      this.overheated = false;
    }

    if (input.fire && !this.overheated && this.fireCooldown <= 0) {
      this.fire();
    }

    this.updateProjectiles(dt);
    this.plane.setWeaponHeat(this.currentHeat);
  }

  fire() {
    const weaponConfig = this.plane.config.weapon;
    const anchors = this.plane.object3d.userData.gunAnchors ?? [this.plane.object3d];
    const anchor = anchors[this.muzzleIndex % anchors.length];
    const projectile = new Mesh(this.projectileGeometry, this.projectileMaterial);

    anchor.getWorldPosition(projectile.position);
    anchor.getWorldDirection(TMP_DIRECTION);
    TMP_DIRECTION.normalize();

    this.scene.add(projectile);
    this.projectiles.push({
      mesh: projectile,
      velocity: TMP_DIRECTION.clone()
        .multiplyScalar(weaponConfig.projectileSpeed)
        .addScaledVector(this.plane.velocity, 0.35),
      age: 0
    });

    this.fireCooldown = 1 / weaponConfig.fireRate;
    this.currentHeat = Math.min(weaponConfig.maxHeat, this.currentHeat + weaponConfig.heatPerShot);
    this.overheated = this.currentHeat >= weaponConfig.maxHeat;
    this.muzzleIndex += 1;
  }

  updateProjectiles(dt) {
    const weaponConfig = this.plane.config.weapon;

    for (let index = this.projectiles.length - 1; index >= 0; index -= 1) {
      const projectile = this.projectiles[index];
      TMP_START.copy(projectile.mesh.position);
      projectile.mesh.position.addScaledVector(projectile.velocity, dt);
      TMP_END.copy(projectile.mesh.position);
      projectile.age += dt;

      if (this.targetManager.hitTestSegment(TMP_START, TMP_END, weaponConfig.projectileRadius, weaponConfig.projectileDamage)) {
        this.removeProjectile(index);
        continue;
      }

      if (projectile.age >= weaponConfig.projectileLifetime) {
        this.removeProjectile(index);
      }
    }
  }

  removeProjectile(index) {
    const [projectile] = this.projectiles.splice(index, 1);
    if (projectile) {
      this.scene.remove(projectile.mesh);
    }
  }

  reset() {
    for (const projectile of this.projectiles) {
      this.scene.remove(projectile.mesh);
    }

    this.projectiles.length = 0;
    this.fireCooldown = 0;
    this.currentHeat = 0;
    this.overheated = false;
    this.plane.setWeaponHeat(0);
  }

  get heatNormalized() {
    return this.plane.config.weapon.maxHeat > 0
      ? this.currentHeat / this.plane.config.weapon.maxHeat
      : 0;
  }
}
