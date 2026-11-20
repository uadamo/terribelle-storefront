import type * as THREE from 'three';
import {useThreeStage} from './useThreeStage';
import {berryEnvironment, makeBerry, makeFlower, type BerryParts} from './belladonnaModels';

type Floater = {
  group: THREE.Group;
  normalizedX: number;
  normalizedY: number;
  baseZ: number;
  phase: number;
  floatAmp: number;
  floatSpeed: number;
  spinX: number;
  spinY: number;
};

const CALYX = ['#6b4a5c', '#7a8a52', '#5e4a52', '#6f7e4c'];

/**
 * Belladonna berries and flowers (the Terribelle emblem) floating together in
 * one layer over a section of the page — the same behaviour as the pins and
 * buttons: each piece keeps its place in the layer and drifts and turns slowly.
 * Decorative; lazy-loaded, paused off-screen, single still frame for reduced motion.
 */
export function FloatingBelladonna({
  berries = 5,
  flowers = 2,
  speed = 0.45,
  className = '',
}: {
  berries?: number;
  flowers?: number;
  speed?: number;
  className?: string;
}) {
  const mountRef = useThreeStage((T, mount) => {
    const small = window.innerWidth < 768;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new T.WebGLRenderer({alpha: true, antialias: true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);

    const env = berryEnvironment(T);
    scene.add(new T.AmbientLight(0xffffff, 0.75));
    const key = new T.DirectionalLight(0xffffff, 2.3);
    key.position.set(2.5, 3, 5);
    const rim = new T.DirectionalLight(0xe9dcff, 1.1);
    rim.position.set(-3, 1, -2);
    scene.add(key, rim);

    const parts: BerryParts[] = [];
    const floaters: Floater[] = [];
    const nB = small ? Math.max(2, Math.ceil(berries * 0.6)) : berries;
    const nF = small ? 1 : flowers;
    const padX = 0.6;
    const padY = 0.6;
    const bounds = (depth: number) => {
      const d = Math.max(camera.near + 0.01, depth);
      const halfHeight = Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * d;
      return {halfWidth: halfHeight * camera.aspect, halfHeight};
    };

    for (let i = 0; i < nB + nF; i++) {
      const isFlower = i >= nB;
      const part = isFlower ? makeFlower(T) : makeBerry(T, CALYX[i % CALYX.length], env);
      parts.push(part);
      const g = part.group;
      g.scale.setScalar((isFlower ? 0.6 : 0.55) * (0.85 + Math.random() * 0.3));
      g.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, (Math.random() - 0.5) * 0.8);
      scene.add(g);
      floaters.push({
        group: g,
        normalizedX: Math.random() * 2 - 1,
        normalizedY: Math.random() * 2 - 1,
        baseZ: (Math.random() - 0.5) * 2,
        phase: Math.random() * Math.PI * 2,
        floatAmp: 0.08 + Math.random() * 0.14,
        floatSpeed: (0.35 + Math.random() * 0.7) * speed,
        spinX: (Math.random() - 0.5) * 0.003 * speed,
        spinY: (Math.random() - 0.5) * 0.006 * speed,
      });
    }

    return {
      frame(elapsed) {
        for (const f of floaters) {
          const z = f.baseZ + Math.sin(elapsed * f.floatSpeed * 0.5 + f.phase) * 0.06;
          const {halfWidth, halfHeight} = bounds(camera.position.z - z);
          const sw = Math.max(0.35, halfWidth - padX);
          const sh = Math.max(0.35, halfHeight - padY);
          const y = f.normalizedY * sh + Math.sin(elapsed * f.floatSpeed + f.phase) * f.floatAmp;
          const x = f.normalizedX * sw + Math.cos(elapsed * f.floatSpeed * 0.65 + f.phase) * 0.07;
          f.group.position.set(T.MathUtils.clamp(x, -sw, sw), T.MathUtils.clamp(y, -sh, sh), z);
          f.group.rotation.x += f.spinX;
          f.group.rotation.y += f.spinY;
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
        parts.forEach((pt) => pt.dispose());
        env?.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      },
    };
  });

  return <div ref={mountRef} className={`three-layer belladonna-layer ${className}`} aria-hidden="true" />;
}
