<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import * as THREE from 'three';
import moonAlbedoUrl from '../../assets/moon-globe-albedo-2k.jpg';
/* 2048×1024 equirectangular — higher res than 1k; see solarsystemscope.com texture license for shipping. */

/** Full rotation period (seconds), counter-clockwise as seen from above (negative Y). */
const ROTATION_PERIOD_SEC = 160;
/** Cap GPU cost on phones; desktop still gets sharp canvas. */
const MAX_DPR = 2.25;
/** Must match `SphereGeometry` radius multiplier. */
const MOON_R = 1.05;
/** Target: lit disk spans ~this fraction of the canvas width (≈ viewport when width is 100vw). */
const TARGET_H_FILL = 0.675;
/** vFOV slack over the sphere’s vertical angular diameter so the top limb stays inside the frustum. */
const VFOV_SLACK = 1.14;

const containerEl = ref(null);

let renderer;
let scene;
let camera;
let mesh;
let rafId = 0;
let resizeObserver;
let clock;
let disposed = false;

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function resize() {
  const el = containerEl.value;
  if (!el || !renderer || !camera) return;
  const w = el.clientWidth;
  const h = el.clientHeight;
  if (w < 2 || h < 2) return;
  const aspect = w / h;

  /* Solve camera distance so the sphere’s angular width vs horizontal FOV ≈ TARGET_H_FILL.
   * A super-wide CSS canvas made the disk look tiny: the viewport was only a narrow “window”
   * into an ultra-wide render. Keep canvas ≈100vw so this math matches what you see. */
  let lo = 2.0;
  let hi = 18.0;
  for (let i = 0; i < 30; i++) {
    const z = (lo + hi) * 0.5;
    const theta = 2 * Math.atan(MOON_R / z);
    const vfovDeg = THREE.MathUtils.clamp(
      THREE.MathUtils.radToDeg(theta * VFOV_SLACK),
      22,
      72
    );
    const vfovRad = THREE.MathUtils.degToRad(vfovDeg);
    const hfovRad = 2 * Math.atan(Math.tan(vfovRad / 2) * aspect);
    const fill = theta / hfovRad;
    if (fill > TARGET_H_FILL) lo = z;
    else hi = z;
  }
  const zCam = (lo + hi) * 0.5;
  const thetaFinal = 2 * Math.atan(MOON_R / zCam);
  camera.fov = THREE.MathUtils.clamp(
    THREE.MathUtils.radToDeg(thetaFinal * VFOV_SLACK),
    22,
    72
  );
  camera.aspect = aspect;
  camera.position.z = zCam;
  camera.updateProjectionMatrix();

  const pr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  renderer.setPixelRatio(pr);
  renderer.setSize(w, h, false);
}

function tick() {
  rafId = requestAnimationFrame(tick);
  if (!mesh || !renderer || !scene || !camera) return;
  if (!prefersReducedMotion()) {
    const dt = clock.getDelta();
    mesh.rotation.y -= ((Math.PI * 2) / ROTATION_PERIOD_SEC) * dt;
  }
  renderer.render(scene, camera);
}

function dispose() {
  disposed = true;
  if (resizeObserver && containerEl.value) {
    resizeObserver.unobserve(containerEl.value);
    resizeObserver.disconnect();
  }
  resizeObserver = null;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = 0;
  if (mesh) {
    mesh.geometry?.dispose();
    const m = mesh.material;
    if (m) {
      if (m.map) m.map.dispose();
      if (m.bumpMap && m.bumpMap !== m.map) m.bumpMap.dispose();
      m.dispose();
    }
    mesh = null;
  }
  if (renderer) {
    renderer.dispose();
    const dom = renderer.domElement;
    if (dom?.parentNode) dom.parentNode.removeChild(dom);
    renderer = null;
  }
  scene = null;
  camera = null;
  clock = null;
}

onMounted(() => {
  const el = containerEl.value;
  if (!el || typeof window === 'undefined') return;

  disposed = false;
  clock = new THREE.Clock();
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(34, 1, 0.06, 80);
  camera.position.set(0, 0.1, 4.2);
  camera.lookAt(0, -0.08, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  /* Brighter — closer to raw albedo; was reading too dark on the page */
  renderer.toneMappingExposure = 1.14;
  el.appendChild(renderer.domElement);
  renderer.domElement.style.cssText =
    'display:block;width:100%;height:100%;outline:none;touch-action:none';

  const loader = new THREE.TextureLoader();
  loader.load(
    moonAlbedoUrl,
    (tex) => {
      if (disposed) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      if (mesh?.material) {
        const mat = mesh.material;
        mat.map = tex;
        /* Reuse albedo as bump for micro-relief (reads more photographic than flat shading) */
        mat.bumpMap = tex;
        mat.bumpScale = 0.011;
        mat.needsUpdate = true;
      }
    },
    undefined,
    () => {
      /* keep grey sphere if texture fails */
    }
  );

  const geo = new THREE.SphereGeometry(MOON_R, 160, 160);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.58,
    metalness: 0.02,
    clearcoat: 0,
    specularIntensity: 0.48,
    specularColor: new THREE.Color(0xe8f0ff),
  });
  mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.z = THREE.MathUtils.degToRad(4);
  mesh.position.y = -0.08;
  scene.add(mesh);

  const hemi = new THREE.HemisphereLight(0xa8b8e8, 0x1a2438, 0.22);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff8f4, 2.15);
  key.position.set(5.4, 2.35, 5.1);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x4a5d82, 0.16);
  fill.position.set(-4.0, -0.9, 2.0);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xc5d8ff, 0.38);
  rim.position.set(-0.15, 0.45, -5.2);
  scene.add(rim);

  const starFill = new THREE.PointLight(0xdce8ff, 0.32, 0, 2);
  starFill.position.set(-2.6, 1.85, 3.4);
  scene.add(starFill);

  resizeObserver = new ResizeObserver(() => resize());
  resizeObserver.observe(el);
  resize();
  tick();
});

onBeforeUnmount(dispose);
</script>

<template>
  <div
    ref="containerEl"
    class="hero-moon-globe"
    role="presentation"
    aria-hidden="true"
  />
</template>

<style scoped>
.hero-moon-globe {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: auto;
  /* Match viewport width so framing math targets real screen width (ultra-wide % was shrinking the moon). */
  width: 100%;
  min-width: 100%;
  max-width: 100vw;
  /* Tall box below the 50dvh anchor for vertical pixels + aspect ratio the solver uses */
  height: min(210%, 120dvh);
  /* Top of this box aligns with .hero-moon-wrap top (50dvh); center horizontally only */
  transform: translateX(-50%);
  pointer-events: none;
  user-select: none;
  /* Full opacity for preview; tune down if hero copy needs more contrast */
  opacity: 1;
}
</style>
