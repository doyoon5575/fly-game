import { MathUtils, Matrix4, Quaternion, Vector3 } from "three";

const DEFAULT_OFFSET = new Vector3(0, 3, -10);
const LOCAL_FORWARD = new Vector3(0, 0, 1);
const WORLD_UP = new Vector3(0, 1, 0);
const TMP_OFFSET = new Vector3();
const TMP_LOOK_TARGET = new Vector3();
const TMP_FORWARD = new Vector3();
const TMP_CAMERA_TARGET = new Vector3();
const LOOK_MATRIX = new Matrix4();
const DESIRED_ROTATION = new Quaternion();

export class ChaseCamera {
  constructor(camera, plane) {
    this.camera = camera;
    this.plane = plane;
    this.followOffset = DEFAULT_OFFSET.clone();
    this.followSharpness = 5.6;
    this.rotationSharpness = 5;
    this.forwardLookDistance = 8;
    this.normalFov = 60;
    this.boostFov = 75;
    this.fovSharpness = 4;
  }

  snap() {
    TMP_OFFSET.copy(this.followOffset).applyQuaternion(this.plane.quaternion);
    this.camera.position.copy(this.plane.position).add(TMP_OFFSET);
    this.orientCamera(1);
    this.camera.fov = this.normalFov;
    this.camera.updateProjectionMatrix();
  }

  update(dt) {
    TMP_OFFSET.copy(this.followOffset).applyQuaternion(this.plane.quaternion);
    TMP_CAMERA_TARGET.copy(this.plane.position).add(TMP_OFFSET);
    this.camera.position.lerp(TMP_CAMERA_TARGET, 1 - Math.exp(-this.followSharpness * dt));

    this.orientCamera(dt);

    const targetFov = this.plane.boosting ? this.boostFov : this.normalFov;
    this.camera.fov = MathUtils.lerp(this.camera.fov, targetFov, 1 - Math.exp(-this.fovSharpness * dt));
    this.camera.updateProjectionMatrix();
  }

  orientCamera(dt) {
    TMP_FORWARD.copy(LOCAL_FORWARD).applyQuaternion(this.plane.quaternion).normalize();
    TMP_LOOK_TARGET.copy(this.plane.position).addScaledVector(TMP_FORWARD, this.forwardLookDistance);

    LOOK_MATRIX.lookAt(this.camera.position, TMP_LOOK_TARGET, WORLD_UP);
    DESIRED_ROTATION.setFromRotationMatrix(LOOK_MATRIX);

    if (dt >= 1) {
      this.camera.quaternion.copy(DESIRED_ROTATION);
      return;
    }

    this.camera.quaternion.slerp(DESIRED_ROTATION, 1 - Math.exp(-this.rotationSharpness * dt));
  }
}
