import * as THREE from 'three';
import { MODEL_URLS } from './model-cache';
import { buildEnvironment, createFrameGuard, createRenderer, disposeTree, glowTexture, loadModel, normalize, type SceneQuality } from './studio';

export type ProductKind = 'perfume' | 'diamond';

export type ProductEngine = {
  /** Pointer in -1..1 on both axes. */
  setPointer: (x: number, y: number) => void;
  /** Scroll progress through the section, 0..1. */
  setProgress: (progress: number) => void;
  /** Horizontal drag in CSS pixels since the last call. */
  drag: (dx: number) => void;
  setRunning: (running: boolean) => void;
  dispose: () => void;
};

type Options = {
  kind: ProductKind;
  quality: SceneQuality;
  /** Reduced motion: draw once, never animate. */
  still: boolean;
  onFirstFrame: () => void;
  onTooSlow: () => void;
  onFail: () => void;
};

type KindConfig = {
  url: string;
  /** Height of the object as a share of the visible frame height. */
  fill: number;
  /** Width/height of the object, to keep it inside narrow frames. */
  aspect: number;
  idleSpin: number;
  /** Turns per full scroll through the section. */
  scrollTurns: number;
  glow: [number, number, number];
  strips: [number, number, number];
};

const KINDS: Record<ProductKind, KindConfig> = {
  perfume: { url: MODEL_URLS.perfume, fill: 0.74, aspect: 0.38, idleSpin: 0.12, scrollTurns: 1, glow: [0.85, 0.66, 0.38], strips: [1, 0.93, 0.8] },
  diamond: { url: MODEL_URLS.diamond, fill: 0.5, aspect: 1.4, idleSpin: 0.35, scrollTurns: 0.5, glow: [0.36, 0.7, 0.76], strips: [0.92, 0.97, 1] },
};

/**
 * What the glass refracts. It must be opaque to reach three's transmission pass, so it fades out through its alpha
 * (premultiplied) instead of blending; on the page it reads as a soft glow with light strips, never as a box.
 */
function buildBackdrop(config: KindConfig) {
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uGlow: { value: new THREE.Vector3(...config.glow) }, uStrip: { value: new THREE.Vector3(...config.strips) } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec3 uGlow; uniform vec3 uStrip; varying vec2 vUv;
      float strip(float x, float center, float width){ return smoothstep(width, 0.0, abs(x-center)); }
      void main(){
        vec2 p=vUv-0.5;
        float mask=smoothstep(0.5,0.08,length(p*vec2(1.0,0.85)));
        float s=strip(vUv.x,0.36+sin(uTime*0.15)*0.02,0.018)*0.9+strip(vUv.x,0.64,0.03)*0.55+strip(vUv.x,0.52,0.006)*0.7;
        s*=smoothstep(0.05,0.35,vUv.y)*smoothstep(0.98,0.6,vUv.y);
        vec3 col=uGlow*0.32*mask+uStrip*s*0.55;
        float a=clamp(mask*0.85+s*0.6,0.0,1.0)*mask;
        gl_FragColor=vec4(col*a,a);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  mesh.position.z = -1.6;
  mesh.renderOrder = -1;
  return { mesh, material };
}

function starTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const c = size / 2;
  const glow = ctx.createRadialGradient(c, c, 0, c, c, c * 0.5);
  glow.addColorStop(0, 'rgba(255,255,255,1)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);
  for (const [w, h] of [
    [size, 3],
    [3, size],
  ]) {
    const ray = ctx.createRadialGradient(c, c, 0, c, c, c);
    ray.addColorStop(0, 'rgba(255,255,255,0.95)');
    ray.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = ray;
    ctx.fillRect(c - w / 2, c - h / 2, w, h);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function stylePerfume(root: THREE.Object3D, envMap: THREE.Texture) {
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.03,
    transmission: 1,
    thickness: 0.016,
    ior: 1.5,
    dispersion: 0.4,
    attenuationColor: new THREE.Color(0xffcf8a),
    attenuationDistance: 0.9,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    specularIntensity: 1,
    envMap,
    envMapIntensity: 1.6,
    side: THREE.DoubleSide,
  });
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xd9b26e, metalness: 1, roughness: 0.16, clearcoat: 0.5, clearcoatRoughness: 0.1, envMap, envMapIntensity: 1.6 });
  const brushed = new THREE.MeshPhysicalMaterial({ color: 0xc9a66b, metalness: 1, roughness: 0.32, envMap, envMapIntensity: 1.3 });
  const lacquer = new THREE.MeshPhysicalMaterial({ color: 0x0b0b0d, metalness: 0.3, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.04, envMap, envMapIntensity: 1.4 });
  const amber = new THREE.MeshPhysicalMaterial({
    color: 0xc98d3e,
    metalness: 0.2,
    roughness: 0.22,
    emissive: new THREE.Color(0x5a330c),
    emissiveIntensity: 0.6,
    clearcoat: 1,
    envMap,
    envMapIntensity: 1.2,
  });
  const black = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.6 });

  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const source = obj.material as THREE.Material;
    const name = source?.name ?? '';
    if (/glass/i.test(name)) obj.material = glass;
    else if (name === 'Material.003') obj.material = gold;
    else if (name === 'Material.002') obj.material = lacquer;
    else if (name === 'Material.008') obj.material = brushed;
    else if (/plastic/i.test(name)) obj.material = amber;
    else obj.material = black;
    source?.dispose();
  });
}

function styleDiamond(root: THREE.Object3D, envMap: THREE.Texture) {
  const gem = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0,
    transmission: 1,
    thickness: 0.0024,
    ior: 2.42,
    dispersion: 5,
    specularIntensity: 1,
    iridescence: 0.25,
    iridescenceIOR: 1.6,
    envMap,
    envMapIntensity: 2.6,
    flatShading: true,
  });
  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    (obj.material as THREE.Material).dispose();
    obj.material = gem;
  });
}

export function createProductEngine(canvas: HTMLCanvasElement, { kind, quality, still, onFirstFrame, onTooSlow, onFail }: Options): ProductEngine {
  const config = KINDS[kind];
  const { renderer } = createRenderer(canvas, quality, { small: true });
  renderer.toneMapping = THREE.NeutralToneMapping;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
  camera.position.set(0, 0.25, 5);

  const envMap = buildEnvironment(renderer);
  const backdrop = buildBackdrop(config);
  scene.add(backdrop.mesh);

  /** rig: placement. spinner: turntable rotation. */
  const rig = new THREE.Group();
  const spinner = new THREE.Group();
  rig.add(spinner);
  scene.add(rig);

  const extras: THREE.Object3D[] = [];
  const sparkles: { sprite: THREE.Sprite; phase: number; speed: number }[] = [];
  if (kind === 'perfume') {
    const pool = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: glowTexture('rgba(201,166,107,0.85)'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.y = -0.52;
    pool.scale.set(0.9, 0.9, 1);
    rig.add(pool);
    extras.push(pool);
  } else {
    const texture = starTexture();
    for (let i = 0; i < 7; i++) {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
      const angle = (i / 7) * Math.PI * 2;
      sprite.position.set(Math.cos(angle) * 0.42, (Math.random() - 0.3) * 0.25, Math.sin(angle) * 0.3);
      spinner.add(sprite);
      sparkles.push({ sprite, phase: Math.random() * Math.PI * 2, speed: 0.6 + Math.random() * 0.9 });
    }
  }

  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let progress = 0;
  let progressSmooth = 0;
  let spin = 0;
  let spinVelocity = 0;
  let elapsed = 0;
  let firstFrameSent = false;
  let size = 1;

  let ready = false;
  let disposed = false;
  loadModel(config.url)
    .then((gltf) => {
      if (disposed) {
        disposeTree(gltf.scene);
        return;
      }
      if (kind === 'perfume') stylePerfume(gltf.scene, envMap);
      else styleDiamond(gltf.scene, envMap);
      const model = normalize(gltf.scene);
      if (kind === 'diamond') model.rotation.x = 0.35;
      spinner.add(model);
      ready = true;
      if (still) draw(0);
    })
    .catch(() => {
      if (!disposed) onFail();
    });

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const viewH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const viewW = viewH * camera.aspect;
    size = Math.min(viewH * config.fill, (viewW * 0.8) / config.aspect);
    backdrop.mesh.scale.set(viewW * 1.45, viewH * 1.45, 1);
    if (still && ready) draw(0);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  function draw(delta: number) {
    elapsed += delta;
    pointer.sx += (pointer.x - pointer.sx) * 0.06;
    pointer.sy += (pointer.y - pointer.sy) * 0.06;
    progressSmooth += (progress - progressSmooth) * 0.1;
    spin += spinVelocity + delta * config.idleSpin;
    spinVelocity *= 0.94;

    const turns = progressSmooth * config.scrollTurns * Math.PI * 2;
    spinner.rotation.y = (still ? -0.5 : spin + turns) + pointer.sx * 0.35;
    spinner.rotation.x = pointer.sy * 0.12 + (kind === 'diamond' ? Math.sin(elapsed * 0.5) * 0.12 : 0);
    rig.scale.setScalar(size);
    rig.position.y = still ? 0 : Math.sin(elapsed * 0.8) * 0.04 * size;
    backdrop.material.uniforms.uTime.value = elapsed;

    for (const s of sparkles) {
      const pulse = Math.max(0, Math.sin(elapsed * s.speed + s.phase + spin * 2));
      s.sprite.material.opacity = Math.pow(pulse, 14);
      s.sprite.scale.setScalar(0.12 + pulse * 0.1);
    }

    renderer.render(scene, camera);
    if (!firstFrameSent) {
      firstFrameSent = true;
      onFirstFrame();
    }
  }

  const guard = createFrameGuard(() => {
    stop();
    onTooSlow();
  });
  let lastTime = performance.now();
  const frame = () => {
    const now = performance.now();
    const delta = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    if (!ready || guard(delta)) return;
    draw(delta);
  };

  let running = false;
  const stop = () => {
    running = false;
    renderer.setAnimationLoop(null);
  };

  return {
    setPointer: (x, y) => {
      pointer.x = x;
      pointer.y = y;
    },
    setProgress: (p) => {
      progress = p;
    },
    drag: (dx) => {
      spinVelocity += dx * 0.0016;
    },
    setRunning: (next) => {
      if (still || next === running || disposed) return;
      if (!next) return stop();
      running = true;
      lastTime = performance.now();
      renderer.setAnimationLoop(frame);
    },
    dispose: () => {
      disposed = true;
      stop();
      resizeObserver.disconnect();
      disposeTree(scene);
      for (const extra of extras) disposeTree(extra);
      envMap.dispose();
      renderer.dispose();
    },
  };
}
