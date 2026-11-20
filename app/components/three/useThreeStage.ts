import {useEffect, useRef} from 'react';
import type * as THREE_NS from 'three';

export type ThreeModule = typeof THREE_NS;
export type Stage = {
  /** Advance one frame. */
  frame: (elapsed: number) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
};

/**
 * Shared plumbing for the decorative Three.js scenes:
 * - three.js is loaded lazily, only when the scene is near the viewport;
 * - rendering pauses while off-screen;
 * - prefers-reduced-motion renders a single still frame;
 * - no WebGL → nothing is drawn (purely decorative).
 */
export function useThreeStage(build: (THREE: ThreeModule, mount: HTMLDivElement) => Stage | null) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let stage: Stage | null = null;
    let raf = 0;
    let visible = false;
    let cancelled = false;
    let start = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const loop = (t: number) => {
      if (!stage || !visible) return;
      if (!start) start = t;
      stage.frame((t - start) / 1000);
      if (!reduce) raf = requestAnimationFrame(loop);
    };

    const init = async () => {
      if (stage || cancelled) return;
      const canvas = document.createElement('canvas');
      if (!(canvas.getContext('webgl2') || canvas.getContext('webgl'))) return;
      const THREE = await import('three');
      if (cancelled) return;
      stage = build(THREE, mount);
      if (!stage) return;
      stage.resize(mount.clientWidth, mount.clientHeight);
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          if (!stage) void init();
          else {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(loop);
          }
        } else {
          cancelAnimationFrame(raf);
        }
      },
      {rootMargin: '200px 0px'},
    );
    io.observe(mount);

    const onResize = () => stage?.resize(mount.clientWidth, mount.clientHeight);
    window.addEventListener('resize', onResize);

    return () => {
      cancelled = true;
      io.disconnect();
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
      stage?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return mountRef;
}

/** Soft studio environment used for reflections (from the original scenes). */
export function studioEnvironment(THREE: ThreeModule) {
  const envCanvas = document.createElement('canvas');
  envCanvas.width = 1024;
  envCanvas.height = 512;
  const envCtx = envCanvas.getContext('2d');
  if (!envCtx) return null;
  const envGradient = envCtx.createLinearGradient(0, 0, 0, envCanvas.height);
  envGradient.addColorStop(0, '#f2f7ff');
  envGradient.addColorStop(0.28, '#dce8fb');
  envGradient.addColorStop(0.56, '#8ea3c2');
  envGradient.addColorStop(0.76, '#4a5b74');
  envGradient.addColorStop(1, '#dbe7f8');
  envCtx.fillStyle = envGradient;
  envCtx.fillRect(0, 0, envCanvas.width, envCanvas.height);
  envCtx.fillStyle = 'rgba(255,255,255,0.55)';
  envCtx.fillRect(90, 42, 220, 42);
  envCtx.fillRect(710, 76, 210, 35);
  envCtx.fillRect(250, 380, 280, 56);
  envCtx.fillRect(760, 338, 180, 46);
  envCtx.fillStyle = 'rgba(30,46,68,0.55)';
  envCtx.fillRect(0, 146, envCanvas.width, 34);
  envCtx.fillRect(0, 280, envCanvas.width, 28);
  envCtx.fillStyle = 'rgba(15,27,44,0.42)';
  envCtx.fillRect(100, 456, 824, 26);
  const map = new THREE.CanvasTexture(envCanvas);
  map.mapping = THREE.EquirectangularReflectionMapping;
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}
