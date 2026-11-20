import type * as THREE from 'three';
import type {ThreeModule} from './useThreeStage';

/**
 * Procedural belladonna (Atropa belladonna) — the Terribelle emblem.
 *  - Berry: a glossy, near-black, slightly flattened sphere sitting in a
 *    five-pointed star calyx of curled sepals, with a short stalk.
 *  - Flower: a nodding, bell-shaped (campanulate) corolla in dusky violet,
 *    five shallow flared lobes, greenish at the base, held in a green calyx.
 */

/** A pointed, slightly cupped sepal/petal blade (length along +Y). */
function bladeGeometry(T: ThreeModule, length: number, width: number, curl: number, segments = 10, tint?: string) {
  const shape = new T.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width * 0.9, length * 0.18, width * 0.75, length * 0.62, 0, length);
  shape.bezierCurveTo(-width * 0.75, length * 0.62, -width * 0.9, length * 0.18, 0, 0);
  const geo = new T.ShapeGeometry(shape, segments);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const t = y / length;
    // Curl the tip away (toward +Z) and cup the blade across its width.
    pos.setZ(i, curl * t * t * length + Math.abs(x) * 0.35 * (1 - t));
  }
  if (tint) {
    // Darker at the base, lighter towards the tip, with a pale midrib.
    const c = new T.Color(tint);
    const colors: number[] = [];
    for (let i = 0; i < pos.count; i++) {
      const t = pos.getY(i) / length;
      const rib = Math.exp(-Math.pow(pos.getX(i) / (width * 0.12), 2)) * 0.12;
      const k = 0.72 + 0.38 * t + rib;
      colors.push(c.r * k, c.g * k, c.b * k);
    }
    geo.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
  }
  geo.computeVertexNormals();
  return geo;
}

export type BerryParts = {group: THREE.Group; dispose: () => void};

/** Soft studio with one large window: gives the berries a single, wet highlight. */
export function berryEnvironment(T: ThreeModule) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#5a5560');
  g.addColorStop(0.5, '#2a2730');
  g.addColorStop(1, '#141218');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);
  const w = ctx.createRadialGradient(180, 70, 4, 180, 70, 60);
  w.addColorStop(0, 'rgba(255,255,255,1)');
  w.addColorStop(0.55, 'rgba(255,255,255,0.85)');
  w.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = w;
  ctx.fillRect(100, 10, 160, 120);
  const map = new T.CanvasTexture(canvas);
  map.mapping = T.EquirectangularReflectionMapping;
  map.colorSpace = T.SRGBColorSpace;
  return map;
}

export function makeBerry(T: ThreeModule, calyxColor: string, envMap?: THREE.Texture | null): BerryParts {
  const group = new T.Group();

  // Berry: glossy black with a faint plum depth.
  const berryGeo = new T.SphereGeometry(0.2, 48, 32);
  berryGeo.scale(1, 0.9, 1);
  const berryMat = new T.MeshPhysicalMaterial({
    color: 0x0b0710,
    metalness: 0.0,
    roughness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    sheen: 0.4,
    sheenColor: new T.Color('#3b2340'),
    envMap: envMap ?? null,
    envMapIntensity: 1.9,
  });
  const berry = new T.Mesh(berryGeo, berryMat);
  berry.position.y = 0.16;
  group.add(berry);

  // Star calyx: five broad sepals spreading flat beneath the berry, tips lifting.
  const sepalGeo = bladeGeometry(T, 0.44, 0.19, 0.22, 14, calyxColor);
  const sepalMat = new T.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.62,
    metalness: 0,
    side: T.DoubleSide,
  });
  for (let i = 0; i < 5; i++) {
    const sepal = new T.Mesh(sepalGeo, sepalMat);
    const pivot = new T.Group();
    sepal.rotation.x = -Math.PI / 2 + 0.16; // lie nearly flat, lifted slightly
    pivot.rotation.y = (i / 5) * Math.PI * 2 + 0.2;
    pivot.add(sepal);
    pivot.position.y = 0.01;
    group.add(pivot);
  }

  // Short stalk from the calyx.
  const stalkGeo = new T.CylinderGeometry(0.014, 0.02, 0.3, 10);
  stalkGeo.translate(0, -0.15, 0);
  const stalkMat = new T.MeshStandardMaterial({color: new T.Color('#4f5a33'), roughness: 0.7});
  const stalk = new T.Mesh(stalkGeo, stalkMat);
  stalk.rotation.z = 0.35;
  group.add(stalk);

  return {
    group,
    dispose() {
      berryGeo.dispose();
      berryMat.dispose();
      sepalGeo.dispose();
      sepalMat.dispose();
      stalkGeo.dispose();
      stalkMat.dispose();
    },
  };
}

export function makeFlower(T: ThreeModule): BerryParts {
  const group = new T.Group();

  // Corolla: lathe of a bell profile (base → bulge → waist → flared mouth).
  const profile = [
    [0.02, 0.0],
    [0.1, 0.03],
    [0.17, 0.1],
    [0.205, 0.22],
    [0.215, 0.34],
    [0.215, 0.44],
    [0.24, 0.53],
    [0.3, 0.6],
    [0.36, 0.63],
  ].map(([r, y]) => new T.Vector2(r, y));
  const corollaGeo = new T.LatheGeometry(profile, 80);
  const pos = corollaGeo.attributes.position as THREE.BufferAttribute;
  const colors: number[] = [];
  const base = new T.Color('#7c8650'); // greenish where it meets the calyx
  const body = new T.Color('#55406a'); // dusky violet
  const lip = new T.Color('#3f2a52'); // deeper at the mouth
  const c = new T.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const angle = Math.atan2(z, x);
    // Five shallow lobes at the mouth, with a gentle outward flare.
    const t = Math.max(0, (y - 0.47) / 0.16);
    const wave = Math.cos(5 * angle);
    const peak = Math.sign(wave) * Math.pow(Math.abs(wave), 0.6); // sharper, pointed lobes
    const lobe = 1 + 0.14 * t * peak;
    pos.setX(i, x * lobe);
    pos.setZ(i, z * lobe);
    // Notches between lobes sit higher; tips reflex slightly outward/down.
    pos.setY(i, y - 0.07 * t * t * (1 - wave) * 0.5 + 0.015 * t * (1 + wave) * 0.5);
    // Colour: green base → violet body → deep lip, with faint vertical veins.
    const k = y / 0.63;
    if (k < 0.25) c.copy(base).lerp(body, k / 0.25);
    else c.copy(body).lerp(lip, Math.max(0, (k - 0.6) / 0.4));
    const vein = 0.84 + 0.16 * Math.pow(0.5 + 0.5 * Math.cos(angle * 15), 3);
    colors.push(c.r * vein, c.g * vein, c.b * vein);
  }
  corollaGeo.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
  corollaGeo.computeVertexNormals();
  const corollaMat = new T.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.62,
    sheen: 0.8,
    sheenRoughness: 0.6,
    sheenColor: new T.Color('#9c86b8'),
    side: T.DoubleSide,
  });
  const corolla = new T.Mesh(corollaGeo, corollaMat);
  group.add(corolla);

  // Calyx: five green sepals hugging the base, tips flaring.
  const sepalGeo = bladeGeometry(T, 0.3, 0.13, 0.25, 12, '#86935a');
  const sepalMat = new T.MeshStandardMaterial({vertexColors: true, roughness: 0.65, side: T.DoubleSide});
  for (let i = 0; i < 5; i++) {
    const sepal = new T.Mesh(sepalGeo, sepalMat);
    const pivot = new T.Group();
    sepal.rotation.x = -0.2; // clasp the top of the bell
    sepal.position.z = 0.14;
    pivot.rotation.y = (i / 5) * Math.PI * 2;
    pivot.add(sepal);
    pivot.position.y = -0.02;
    group.add(pivot);
  }

  // Curved pedicel the bell nods from.
  const curve = new T.QuadraticBezierCurve3(new T.Vector3(0, -0.02, 0), new T.Vector3(0, -0.22, 0.02), new T.Vector3(0.16, -0.36, 0));
  const stemGeo = new T.TubeGeometry(curve, 16, 0.014, 8, false);
  const stemMat = new T.MeshStandardMaterial({color: new T.Color('#5c6b3a'), roughness: 0.7});
  group.add(new T.Mesh(stemGeo, stemMat));

  // Hang the bell mouth-down, as the plant does.
  group.rotation.x = Math.PI;

  return {
    group,
    dispose() {
      corollaGeo.dispose();
      corollaMat.dispose();
      sepalGeo.dispose();
      sepalMat.dispose();
      stemGeo.dispose();
      stemMat.dispose();
    },
  };
}
