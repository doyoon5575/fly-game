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

  const visualRig = new Group();
  root.add(visualRig);

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
  visualRig.add(body);

  const nose = new Mesh(new SphereGeometry(0.48, 16, 16), glowMaterial);
  nose.position.z = 1.9;
  visualRig.add(nose);

  const wing = new Mesh(new BoxGeometry(5.6, 0.16, 1.15), darkMaterial);
  wing.position.z = -0.2;
  visualRig.add(wing);

  const tail = new Mesh(new BoxGeometry(0.28, 1.2, 0.8), darkMaterial);
  tail.position.set(0, 0.6, -1.4);
  visualRig.add(tail);

  const stabilizer = new Mesh(new BoxGeometry(1.7, 0.1, 0.5), darkMaterial);
  stabilizer.position.set(0, 0.25, -1.55);
  visualRig.add(stabilizer);

  const canopy = new Mesh(new SphereGeometry(0.52, 18, 18), new MeshStandardMaterial({
    color: new Color("#a7ebff"),
    transparent: true,
    opacity: 0.55,
    metalness: 0.1,
    roughness: 0.1
  }));
  canopy.scale.set(1.05, 0.72, 1.35);
  canopy.position.set(0, 0.48, 0.35);
  visualRig.add(canopy);

  const pilotPivot = new Group();
  pilotPivot.position.set(0, 0.16, 0.24);
  visualRig.add(pilotPivot);

  const pilotBody = new Mesh(new BoxGeometry(0.34, 0.48, 0.25), darkMaterial);
  pilotBody.position.y = -0.08;
  pilotPivot.add(pilotBody);

  const pilotHead = new Mesh(new SphereGeometry(0.16, 14, 14), new MeshStandardMaterial({
    color: new Color("#f6c98d"),
    roughness: 0.9,
    metalness: 0
  }));
  pilotHead.position.y = 0.28;
  pilotPivot.add(pilotHead);

  const leftGunAnchor = new Group();
  leftGunAnchor.position.set(-2.25, -0.02, 0.75);
  visualRig.add(leftGunAnchor);

  const rightGunAnchor = new Group();
  rightGunAnchor.position.set(2.25, -0.02, 0.75);
  visualRig.add(rightGunAnchor);

  const exhaust = new Mesh(new BoxGeometry(0.34, 0.34, 0.7), glowMaterial);
  exhaust.position.set(0, 0, -2.1);
  exhaust.scale.set(0.55, 0.55, 0.75);
  visualRig.add(exhaust);

  root.castShadow = true;
  root.userData.visualRig = visualRig;
  root.userData.pilotPivot = pilotPivot;
  root.userData.gunAnchors = [leftGunAnchor, rightGunAnchor];
  root.userData.exhaust = exhaust;

  return root;
}
