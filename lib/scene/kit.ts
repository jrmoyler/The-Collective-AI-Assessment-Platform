// Shared runtime for the signature Three.js scenes (TypeScript port of the static sites'
// assets/scenes/kit.js; keep the two in step). One job: run a procedural scene behind a
// hero without getting in the way of the page. It caps pixel ratio (1.75 desktop, 1.25
// phone), pauses offscreen and in hidden tabs, drops to a simpler LOD when frame time
// stays above 20ms, renders one composed still under reduced motion, and leaves the
// poster image in place when WebGL is missing.
import * as THREE from 'three';

export { THREE };

export type SceneState = {
  pointer: THREE.Vector2; pointerTarget: THREE.Vector2; scroll: number;
  width: number; height: number; aspect: number; mobile: boolean; lod: number; reduced: boolean; time: number;
};
export type SceneContext = {
  THREE: typeof THREE; renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera;
  state: SceneState; host: HTMLElement; env: (o?: EnvOptions) => THREE.Texture;
};
export type Built = { update: (dt: number, t: number, s: SceneState) => void; lod?: (level: number) => void; resize?: (w: number, h: number) => void; dispose?: () => void };
export type SceneDef = { fov?: number; exposure?: number; stillTime?: number; alpha?: boolean; build: (ctx: SceneContext) => Built };
export type SceneApi = { renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; state: SceneState; renderAt: (t: number) => void; dispose: () => void };
type EnvOptions = { key?: number; fill?: number; floor?: number; strength?: number };

const capture = () => typeof location !== 'undefined' && /scene-still/.test(location.search + location.hash);

export function hasWebGL(): boolean {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

// A small lit "studio" environment for PBR materials without loading an HDR.
export function makeEnvironment(renderer: THREE.WebGLRenderer, { key = 0xfff1d6, fill = 0x9fb4ff, floor = 0x1a2033, strength = 1 }: EnvOptions = {}): THREE.Texture {
  const pm = new THREE.PMREMGenerator(renderer);
  const room = new THREE.Scene();
  const panel = (color: number, intensity: number, pos: [number, number, number], size: [number, number]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    m.material.color.multiplyScalar(intensity); m.position.set(...pos); m.lookAt(new THREE.Vector3()); room.add(m);
  };
  panel(key, 6 * strength, [6, 8, 4], [10, 6]);
  panel(fill, 2.2 * strength, [-8, 4, -3], [8, 8]);
  panel(floor, 0.8 * strength, [0, -6, 0], [30, 30]);
  room.add(new THREE.Mesh(new THREE.SphereGeometry(40, 8, 6), new THREE.MeshBasicMaterial({ color: 0x05070d, side: THREE.BackSide })));
  const tex = pm.fromScene(room, 0.04).texture;
  pm.dispose();
  room.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose(); (m.material as THREE.Material)?.dispose?.(); });
  return tex;
}

export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export function mount(host: HTMLElement | null, def: SceneDef): SceneApi | null {
  if (!host || host.dataset.sceneMounted) return null;
  host.dataset.sceneMounted = '1';
  if (!hasWebGL()) { host.classList.add('scene-nogl'); return null; }
  const CAPTURE = capture();
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)').matches;
  const dprCap = mobile ? 1.25 : 1.75;
  const renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: def.alpha === true, powerPreference: 'high-performance', preserveDrawingBuffer: CAPTURE });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, dprCap));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = def.exposure ?? 1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.className = 'scene-canvas'; canvas.setAttribute('aria-hidden', 'true'); canvas.tabIndex = -1;
  if (CAPTURE) canvas.style.transition = 'none';
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(def.fov ?? 40, 1, 0.1, 200);
  const state: SceneState = { pointer: new THREE.Vector2(), pointerTarget: new THREE.Vector2(), scroll: 0, width: 1, height: 1, aspect: 1, mobile, lod: 0, reduced: REDUCED.matches || CAPTURE, time: 0 };
  const ctx: SceneContext = { THREE, renderer, scene, camera, state, host, env: (o) => makeEnvironment(renderer, o) };

  let built: Built;
  try { built = def.build(ctx); } catch (e) { console.warn('scene build failed', e); host.classList.add('scene-nogl'); renderer.dispose(); canvas.remove(); return null; }

  const size = () => {
    const w = host.clientWidth || 1, h = host.clientHeight || 1;
    state.width = w; state.height = h; state.aspect = w / h;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    built.resize?.(w, h);
  };
  size();
  const ro = new ResizeObserver(size); ro.observe(host);
  const onMove = (e: PointerEvent) => { const b = host.getBoundingClientRect(); state.pointerTarget.set(((e.clientX - b.left) / b.width) * 2 - 1, -(((e.clientY - b.top) / b.height) * 2 - 1)); };
  addEventListener('pointermove', onMove, { passive: true });
  const onScroll = () => { const b = host.getBoundingClientRect(); state.scroll = Math.min(1, Math.max(0, -b.top / Math.max(1, b.height))); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const samples: number[] = []; let slowSince = 0;
  const govern = (dt: number, now: number) => {
    samples.push(dt); if (samples.length > 45) samples.shift();
    if (samples.length < 30) return;
    const med = [...samples].sort((a, b) => a - b)[samples.length >> 1];
    if (med > 0.02) {
      if (!slowSince) slowSince = now;
      if (now - slowSince > 1500 && state.lod < 2) {
        state.lod++; slowSince = 0; samples.length = 0;
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, state.lod === 1 ? Math.min(dprCap, 1.25) : 1));
        size(); built.lod?.(state.lod);
      }
    } else slowSince = 0;
  };

  let raf = 0, visible = true, last = 0, started = false;
  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60); last = now;
    state.time += dt; state.pointer.lerp(state.pointerTarget, 0.06);
    built.update(dt, state.time, state); renderer.render(scene, camera);
    if (!started) { started = true; host.classList.add('scene-on'); document.documentElement.classList.add('gl'); }
    govern(dt, now);
    if (!state.reduced && visible && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const resume = () => { if (!raf && visible && !document.hidden && !state.reduced) { last = 0; raf = requestAnimationFrame(frame); } };
  const renderStill = () => {
    state.time = def.stillTime ?? 12; state.pointer.set(0, 0);
    built.update(1 / 60, state.time, state); renderer.render(scene, camera);
    host.classList.add('scene-on'); document.documentElement.classList.add('gl'); started = true;
    if (CAPTURE) (window as unknown as { __sceneReady: boolean }).__sceneReady = true;
  };
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) resume(); }); io.observe(host);
  document.addEventListener('visibilitychange', resume);
  const onMotion = () => { state.reduced = REDUCED.matches || CAPTURE; if (state.reduced) { cancelAnimationFrame(raf); raf = 0; renderStill(); } else resume(); };
  REDUCED.addEventListener('change', onMotion);
  if (state.reduced) renderStill(); else resume();

  const api: SceneApi = {
    renderer, scene, camera, state,
    renderAt(t) { state.time = t; built.update(1 / 60, t, state); renderer.render(scene, camera); },
    dispose() {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      removeEventListener('pointermove', onMove); removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', resume); REDUCED.removeEventListener('change', onMotion);
      built.dispose?.();
      scene.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose(); const mat = m.material as THREE.Material | THREE.Material[] | undefined; if (mat) (Array.isArray(mat) ? mat : [mat]).forEach((x) => { Object.values(x).forEach((v) => (v as THREE.Texture)?.isTexture && (v as THREE.Texture).dispose()); x.dispose(); }); });
      renderer.dispose(); canvas.remove(); delete host.dataset.sceneMounted;
    },
  };
  if (CAPTURE) (window as unknown as { __scene: SceneApi }).__scene = api;
  return api;
}
