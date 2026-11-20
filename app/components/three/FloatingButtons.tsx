import type * as THREE from 'three';
import {studioEnvironment, useThreeStage} from './useThreeStage';

type ButtonMotion = {
  mesh: THREE.Mesh;
  normalizedX: number;
  normalizedY: number;
  baseZ: number;
  phase: number;
  floatAmp: number;
  floatSpeed: number;
  spinX: number;
  spinY: number;
};

/** Floating four-hole sewing buttons (decorative). Adapted from the brand's FloatingButtons scene. */
export function FloatingButtons({count = 6, scale = 0.6, className = ''}: {count?: number; scale?: number; className?: string}) {
  const mountRef = useThreeStage((T, mount) => {
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(46, 1, 0.1, 100);
    camera.position.set(0, 0.08, 6.0);

    const environmentMap = studioEnvironment(T);
    if (!environmentMap) return null;
    scene.environment = environmentMap;

    const renderer = new T.WebGLRenderer({alpha: true, antialias: true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);

    const lights: THREE.Light[] = [];
    const add = (l: THREE.Light, x?: number, y?: number, z?: number) => {
      if (x !== undefined) l.position.set(x, y!, z!);
      lights.push(l);
    };
    add(new T.AmbientLight(0xffffff, 0.9));
    add(new T.HemisphereLight(0xf5fbff, 0xd7e0ec, 0.64));
    add(new T.DirectionalLight(0xffffff, 2.7), 2.6, 3.2, 4.8);
    add(new T.DirectionalLight(0xe6eeff, 1.58), -3.8, -0.5, 2.3);
    add(new T.DirectionalLight(0xd6e4ff, 1.48), 0.3, 2.2, -4.4);
    add(new T.PointLight(0xffffff, 2.35, 28), 0.2, 1.7, 3.9);
    add(new T.PointLight(0xffffff, 1.48, 20), -3.1, 0.2, 2.7);
    add(new T.PointLight(0xfef8ef, 1.48, 20), 3.2, -0.15, 2.4);
    add(new T.DirectionalLight(0xffffff, 0.95), 0, 4.2, 1.2);
    add(new T.PointLight(0xffffff, 0.85, 18), 0, 0.4, 4.8);
    add(new T.PointLight(0xdfe9ff, 1.32, 18), -4.2, 1.1, 1.8);
    add(new T.PointLight(0xffffff, 1.1, 14), 0.6, 3.1, 1.9);
    add(new T.PointLight(0xf2f7ff, 1.1, 14), -0.7, -2.1, 2.1);
    scene.add(...lights);

    const chromeMaterial = new T.MeshPhysicalMaterial({
      color: 0x000000,
      metalness: 0.15,
      roughness: 0.25,
      clearcoat: 0.6,
      clearcoatRoughness: 0.35,
      reflectivity: 0.4,
      envMapIntensity: 1.2,
    });

    const buttonShape = new T.Shape();
    buttonShape.absarc(0, 0, 0.14, 0, Math.PI * 2, false);
    const holeOffset = 0.038;
    const holeRadius = 0.016;
    for (const [x, y] of [
      [-holeOffset, holeOffset],
      [holeOffset, holeOffset],
      [-holeOffset, -holeOffset],
      [holeOffset, -holeOffset],
    ] as const) {
      const holePath = new T.Path();
      holePath.absarc(x, y, holeRadius, 0, Math.PI * 2, true);
      buttonShape.holes.push(holePath);
    }
    const roundGeometry = new T.ExtrudeGeometry(buttonShape, {
      depth: 0.026,
      bevelEnabled: true,
      bevelThickness: 0.009,
      bevelSize: 0.009,
      bevelSegments: 12,
      curveSegments: 120,
    });
    roundGeometry.translate(0, 0, -0.013);

    const buttons: ButtonMotion[] = [];
    const padX = 0.22;
    const padY = 0.22;
    const bounds = (depth: number) => {
      const d = Math.max(camera.near + 0.01, depth);
      const halfHeight = Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * d;
      return {halfWidth: halfHeight * camera.aspect, halfHeight};
    };

    for (let i = 0; i < count; i += 1) {
      const button = new T.Mesh(roundGeometry, chromeMaterial);
      button.scale.setScalar(scale);
      button.rotation.set((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.95, (Math.random() - 0.5) * 0.45);
      scene.add(button);
      buttons.push({
        mesh: button,
        normalizedX: Math.random() * 2 - 1,
        normalizedY: Math.random() * 2 - 1,
        baseZ: (Math.random() - 0.5) * 2.2,
        phase: Math.random() * Math.PI * 2,
        floatAmp: 0.1 + Math.random() * 0.18,
        floatSpeed: 0.35 + Math.random() * 0.8,
        spinX: (Math.random() - 0.5) * 0.004,
        spinY: (Math.random() - 0.5) * 0.007,
      });
    }

    return {
      frame(elapsed) {
        for (const b of buttons) {
          const z = b.baseZ + Math.sin(elapsed * (b.floatSpeed * 0.48) + b.phase) * 0.06;
          const {halfWidth, halfHeight} = bounds(camera.position.z - z);
          const safeHalfWidth = Math.max(0.3, halfWidth - padX);
          const safeHalfHeight = Math.max(0.3, halfHeight - padY);
          const y = b.normalizedY * safeHalfHeight + Math.sin(elapsed * b.floatSpeed + b.phase) * b.floatAmp;
          const x = b.normalizedX * safeHalfWidth + Math.cos(elapsed * (b.floatSpeed * 0.64) + b.phase) * 0.085;
          b.mesh.position.set(
            T.MathUtils.clamp(x, -safeHalfWidth, safeHalfWidth),
            T.MathUtils.clamp(y, -safeHalfHeight, safeHalfHeight),
            z,
          );
          b.mesh.rotation.x += b.spinX;
          b.mesh.rotation.y += b.spinY;
        }
        renderer.render(scene, camera);
      },
      resize(w, h) {
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      },
      dispose() {
        renderer.dispose();
        roundGeometry.dispose();
        chromeMaterial.dispose();
        environmentMap.dispose();
        for (const b of buttons) scene.remove(b.mesh);
        renderer.domElement.remove();
      },
    };
  });

  return <div ref={mountRef} className={`three-layer ${className}`} aria-hidden="true" />;
}
