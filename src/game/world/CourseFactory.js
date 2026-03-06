import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Vector3
} from "three";
import { Checkpoint } from "../gameplay/Checkpoint.js";
import { createPlaneView } from "../player/PlaneView.js";

export class CourseFactory {
  constructor(scene) {
    this.scene = scene;
  }

  createWorld(courseConfig) {
    this.addLights();
    this.addGround(courseConfig.groundSize);
    this.addSkyMarkers();

    const plane = this.createPlane(courseConfig.spawnPoint);
    const checkpoints = this.createCheckpoints(courseConfig);
    const obstacles = this.createObstacles(courseConfig.obstacleDefinitions);

    return {
      planeObject: plane.object,
      spawnPosition: plane.spawnPosition,
      spawnRotation: plane.spawnRotation,
      checkpoints,
      obstacles
    };
  }

  addLights() {
    const skyLight = new HemisphereLight(new Color("#eaf9ff"), new Color("#a6722d"), 1.7);
    this.scene.add(skyLight);
  }

  addGround(size) {
    const ground = new Mesh(
      new PlaneGeometry(size, size, 32, 32),
      new MeshStandardMaterial({
        color: new Color("#2f5f3d"),
        roughness: 0.95,
        metalness: 0
      })
    );

    ground.rotation.x = -Math.PI * 0.5;
    this.scene.add(ground);
  }

  addSkyMarkers() {
    const markers = new Group();
    const markerMaterial = new MeshStandardMaterial({
      color: new Color("#ffffff"),
      emissive: new Color("#7fd4ff"),
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.22
    });

    for (let index = 0; index < 24; index += 1) {
      const marker = new Mesh(new BoxGeometry(1.5, 90, 1.5), markerMaterial);
      const angle = (index / 24) * Math.PI * 2;
      const radius = 320 + (index % 3) * 50;
      marker.position.set(Math.cos(angle) * radius, 45, Math.sin(angle) * radius);
      markers.add(marker);
    }

    this.scene.add(markers);
  }

  createPlane(spawnPoint) {
    const planeObject = createPlaneView();
    const spawnPosition = new Vector3(...spawnPoint.position);
    const spawnRotationEuler = new Vector3(...spawnPoint.rotation);

    planeObject.position.copy(spawnPosition);
    planeObject.rotation.set(spawnRotationEuler.x, spawnRotationEuler.y, spawnRotationEuler.z);
    this.scene.add(planeObject);

    return {
      object: planeObject,
      spawnPosition,
      spawnRotation: planeObject.quaternion.clone()
    };
  }

  createCheckpoints(courseConfig) {
    return courseConfig.checkpointPositions.map((position, index, positions) => {
      const checkpoint = new Checkpoint(
        index,
        new Vector3(...position),
        courseConfig.checkpointRadius,
        courseConfig.checkpointTubeRadius
      );

      const nextPosition = positions[index + 1] ? new Vector3(...positions[index + 1]) : null;
      checkpoint.lookAt(nextPosition);
      this.scene.add(checkpoint.mesh);
      return checkpoint;
    });
  }

  createObstacles(definitions) {
    const material = new MeshStandardMaterial({
      color: new Color("#654531"),
      roughness: 0.92,
      metalness: 0.05
    });

    return definitions.map((definition, index) => {
      const geometry = new CylinderGeometry(definition.radius, definition.radius, definition.height, 24);
      const mesh = new Mesh(geometry, material);
      mesh.position.set(...definition.position);
      mesh.name = `Obstacle${index}`;
      this.scene.add(mesh);

      return {
        position: mesh.position.clone(),
        radius: definition.radius,
        halfHeight: definition.height * 0.5
      };
    });
  }
}
