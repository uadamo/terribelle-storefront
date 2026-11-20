import type * as THREE from 'three';
import {studioEnvironment, useThreeStage} from './useThreeStage';

type PinMotion = {
  mesh: THREE.Group;
  normalizedX: number;
  normalizedY: number;
  baseZ: number;
  phase: number;
  floatAmplitude: number;
  floatSpeed: number;
  spinX: number;
  spinY: number;
};

const PIN_COLORS = ['#ffffff', '#1f0101', '#1c001b'];

/** Floating dressmaker's pins (decorative). Adapted from the brand's FloatingPins scene. */
export function FloatingPins({count = 9, scale = 0.62, className = ''}: {count?: number; scale?: number; className?: string}) {
  const mountRef = useThreeStage((T, mount) => {
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.1, 5.8);

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

    const ambientLight = new T.AmbientLight(0xffffff, 1.12);
    const hemisphereLight = new T.HemisphereLight(0xf7fbff, 0xe7eef7, 0.58);
    const keyLight = new T.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(2.2, 3.1, 4.7);
    const fillLight = new T.DirectionalLight(0xe6eeff, 1.4);
    fillLight.position.set(-3.2, -1.1, 1.9);
    const rimLight = new T.PointLight(0xffffff, 1.55, 20);
    rimLight.position.set(0.2, 1.6, 3.4);
    const backLight = new T.DirectionalLight(0xd6e4ff, 1.18);
    backLight.position.set(0.4, 2.8, -4.1);
    const sparkleLeft = new T.PointLight(0xffffff, 1.02, 14);
    sparkleLeft.position.set(-2.7, 0.4, 2.8);
    const sparkleRight = new T.PointLight(0xfef8f0, 1.08, 14);
    sparkleRight.position.set(2.9, -0.3, 2.2);
    scene.add(ambientLight, hemisphereLight, keyLight, fillLight, rimLight, backLight, sparkleLeft, sparkleRight);

    const shaftGeometry = new T.CylinderGeometry(0.011, 0.011, 0.9, 20);
    const tipGeometry = new T.ConeGeometry(0.009, 0.16, 20);
    const collarGeometry = new T.CylinderGeometry(0.016, 0.016, 0.05, 20);
    const headGeometry = new T.SphereGeometry(0.052, 20, 18);
    const shaftMaterial = new T.MeshPhysicalMaterial({
      color: 0xb9c3cf,
      metalness: 1,
      roughness: 0.022,
      clearcoat: 1,
      clearcoatRoughness: 0.028,
      reflectivity: 1,
      envMapIntensity: 3.35,
    });

    const pins: PinMotion[] = [];
    const pinPaddingX = 0.5;
    const pinPaddingY = 0.58;
    const bounds = (depth: number) => {
      const d = Math.max(camera.near + 0.01, depth);
      const halfHeight = Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * d;
      return {halfWidth: halfHeight * camera.aspect, halfHeight};
    };

    for (let i = 0; i < count; i += 1) {
      const pinGroup = new T.Group();
      const shaft = new T.Mesh(shaftGeometry, shaftMaterial);
      const tip = new T.Mesh(tipGeometry, shaftMaterial);
      const collar = new T.Mesh(collarGeometry, shaftMaterial);
      tip.position.y = -0.53;
      tip.rotation.x = Math.PI;
      collar.position.y = 0.465;
      const head = new T.Mesh(
        headGeometry,
        new T.MeshStandardMaterial({color: PIN_COLORS[i % PIN_COLORS.length], roughness: 0.34, metalness: 0.1}),
      );
      head.position.y = 0.495;
      pinGroup.add(shaft, tip, collar, head);
      pinGroup.scale.setScalar(scale);

      const normalizedX = Math.random() * 2 - 1;
      const normalizedY = Math.random() * 2 - 1;
      const spreadZ = (Math.random() - 0.5) * 2.1;
      pinGroup.rotation.set((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.95, (Math.random() - 0.5) * 0.55);
      scene.add(pinGroup);
      pins.push({
        mesh: pinGroup,
        normalizedX,
        normalizedY,
        baseZ: spreadZ,
        phase: Math.random() * Math.PI * 2,
        floatAmplitude: 0.1 + Math.random() * 0.24,
        floatSpeed: 0.4 + Math.random() * 0.9,
        spinX: (Math.random() - 0.5) * 0.004,
        spinY: (Math.random() - 0.5) * 0.008,
      });
    }

    return {
      frame(elapsed) {
        for (const pin of pins) {
          const z = pin.baseZ + Math.sin(elapsed * (pin.floatSpeed * 0.45) + pin.phase) * 0.06;
          const {halfWidth, halfHeight} = bounds(camera.position.z - z);
          const safeHalfWidth = Math.max(0.35, halfWidth - pinPaddingX);
          const safeHalfHeight = Math.max(0.35, halfHeight - pinPaddingY);
          const y = pin.normalizedY * safeHalfHeight + Math.sin(elapsed * pin.floatSpeed + pin.phase) * pin.floatAmplitude;
          const x = pin.normalizedX * safeHalfWidth + Math.cos(elapsed * (pin.floatSpeed * 0.65) + pin.phase) * 0.075;
          pin.mesh.position.set(
            T.MathUtils.clamp(x, -safeHalfWidth, safeHalfWidth),
            T.MathUtils.clamp(y, -safeHalfHeight, safeHalfHeight),
            z,
          );
          pin.mesh.rotation.x += pin.spinX;
          pin.mesh.rotation.y += pin.spinY;
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
        environmentMap.dispose();
        shaftGeometry.dispose();
        tipGeometry.dispose();
        collarGeometry.dispose();
        headGeometry.dispose();
        shaftMaterial.dispose();
        for (const pin of pins) {
          for (const child of pin.mesh.children) {
            const mat = (child as THREE.Mesh).material;
            if (mat && mat !== shaftMaterial) (Array.isArray(mat) ? mat : [mat]).forEach((m) => m.dispose());
          }
          scene.remove(pin.mesh);
        }
        renderer.domElement.remove();
      },
    };
  });

  return <div ref={mountRef} className={`three-layer ${className}`} aria-hidden="true" />;
}
