import type * as THREE from 'three';
import {useThreeStage} from './useThreeStage';
import {berryEnvironment, makeBerry, makeFlower, type BerryParts} from './belladonnaModels';

type Floater = {
  group: THREE.Group;
  baseX: number;
  baseY: number;
  z: number;
  phase: number;
  spin: number;
};

const CALYX = ['#6b4a5c', '#7a8a52', '#5e4a52', '#6f7e4c'];

/**
 * Belladonna berries and flowers (the Terribelle emblem) floating over the
 * collection photographs. The canvas is pinned to the viewport while the
 * section scrolls; pieces sit at different depths, so nearer ones travel
 * faster than farther ones — a scroll-linked parallax. Decorative only; not
 * rendered for prefers-reduced-motion.
 */
export function FloatingBelladonna({berries = 6, flowers = 3}: {berries?: number; flowers?: number}) {
  const mountRef = useThreeStage((T, mount) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
    const section = mount.closest('[data-belladonna]') as HTMLElement | null;
    const small = window.innerWidth < 768;

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

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

    // Vertical "track" (world units) the pieces are spread along; the camera
    // travels down it as the section scrolls.
    const track = 14;
    const parts: BerryParts[] = [];
    const floaters: Floater[] = [];
    const total = (small ? Math.ceil(berries / 2) : berries) + (small ? Math.ceil(flowers / 2) : flowers);
    for (let i = 0; i < total; i++) {
      const isFlower = i % 3 === 2;
      const part = isFlower ? makeFlower(T) : makeBerry(T, CALYX[i % CALYX.length], env);
      parts.push(part);
      const g = part.group;
      g.scale.setScalar((isFlower ? 0.85 : 0.75) * (0.8 + Math.random() * 0.4));
      g.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI * 0.5);
      scene.add(g);
      floaters.push({
        group: g,
        baseX: (i % 2 ? 1 : -1) * (1.2 + Math.random() * 2.6),
        baseY: -((i + 0.5) / total) * track + (Math.random() - 0.5) * 1.2,
        z: -3 + Math.random() * 4.5, // depth → parallax speed
        phase: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.0016,
      });
    }

    const progress = () => {
      if (!section) return 0;
      const r = section.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      return span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
    };

    return {
      frame(elapsed) {
        const p = progress();
        for (const f of floaters) {
          // Nearer pieces (larger z) move further for the same scroll → parallax.
          const depthFactor = 1 + f.z * 0.18;
          const y = f.baseY + p * track * depthFactor + Math.sin(elapsed * 0.25 + f.phase) * 0.12;
          f.group.position.set(f.baseX * (camera.aspect < 1 ? 0.55 : 1) + Math.cos(elapsed * 0.18 + f.phase) * 0.08, y, f.z);
          f.group.rotation.y += f.spin;
          f.group.rotation.x += f.spin * 0.6;
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

  return (
    <div className="belladonna-layer" aria-hidden="true">
      <div ref={mountRef} className="belladonna-layer__stage" />
    </div>
  );
}
