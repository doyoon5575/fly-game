import {
  Color,
  Mesh,
  MeshStandardMaterial,
  TorusGeometry,
  Vector3
} from "three";

const TORUS_FORWARD = new Vector3(0, 0, 1);
const TMP_DIRECTION = new Vector3();

export class Checkpoint {
  constructor(index, position, radius, tubeRadius) {
    this.index = index;
    this.position = position.clone();
    this.radius = radius;

    this.material = new MeshStandardMaterial({
      color: new Color("#78d8ff"),
      emissive: new Color("#1a5f80"),
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.85
    });

    this.mesh = new Mesh(new TorusGeometry(radius, tubeRadius, 16, 48), this.material);
    this.mesh.position.copy(this.position);
  }

  lookAt(nextPosition) {
    if (!nextPosition) {
      return;
    }

    TMP_DIRECTION.subVectors(nextPosition, this.position).normalize();
    this.mesh.quaternion.setFromUnitVectors(TORUS_FORWARD, TMP_DIRECTION);
  }

  containsPoint(point, padding = 0) {
    return this.position.distanceTo(point) <= this.radius + padding;
  }

  setVisualState(state) {
    if (state === "passed") {
      this.material.color.set("#4ee073");
      this.material.emissive.set("#1b702d");
      this.material.opacity = 0.35;
      return;
    }

    if (state === "next") {
      this.material.color.set("#ffb24d");
      this.material.emissive.set("#8f4200");
      this.material.opacity = 1;
      return;
    }

    this.material.color.set("#78d8ff");
    this.material.emissive.set("#1a5f80");
    this.material.opacity = 0.72;
  }
}
