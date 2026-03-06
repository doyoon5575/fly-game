import {
  BoxGeometry,
  CapsuleGeometry,
  Color,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry
} from "three";

export function createPlaneView() {
  const root = new Group();
  root.name = "PlayerPlane";

  const orangeMaterial = new MeshStandardMaterial({
    color: new Color("#ff8f4d"),
    metalness: 0.15,
    roughness: 0.5
  });

  const darkMaterial = new MeshStandardMaterial({
    color: new Color("#102233"),
    metalness: 0.1,
    roughness: 0.7
  });

  const glowMaterial = new MeshStandardMaterial({
    color: new Color("#9de7ff"),
    emissive: new Color("#2bd9fe"),
    emissiveIntensity: 0.8,
    metalness: 0,
    roughness: 0.3
  });

  const body = new Mesh(new CapsuleGeometry(0.65, 3, 8, 16), orangeMaterial);
  body.rotation.x = Math.PI * 0.5;
  root.add(body);

  const nose = new Mesh(new SphereGeometry(0.48, 16, 16), glowMaterial);
  nose.position.z = 1.9;
  root.add(nose);

  const wing = new Mesh(new BoxGeometry(5.6, 0.16, 1.15), darkMaterial);
  wing.position.z = -0.2;
  root.add(wing);

  const tail = new Mesh(new BoxGeometry(0.28, 1.2, 0.8), darkMaterial);
  tail.position.set(0, 0.6, -1.4);
  root.add(tail);

  const stabilizer = new Mesh(new BoxGeometry(1.7, 0.1, 0.5), darkMaterial);
  stabilizer.position.set(0, 0.25, -1.55);
  root.add(stabilizer);

  root.castShadow = true;

  return root;
}
