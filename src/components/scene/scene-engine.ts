import * as THREE from 'three';
import {
  buildEnvironment,
  createFrameGuard,
  createRenderer,
  disposeTree,
  createGlow,
  createPearlMaterial,
  easeInOutCubic,
  loadModel,
  normalize,
  type SceneQuality,
} from './studio';
import { MODEL_URLS } from './model-cache';

export type { SceneQuality } from './studio';

export type DepthEngine = {
  /** Pointer in -1..1 on both axes. */
  setPointer: (x: number, y: number) => void;
  /** 0 at the top of the hero, 1 once it has scrolled away. */
  setDive: (progress: number) => void;
  /** Scroll velocity in px/frame; makes the shell breathe harder. */
  setVelocity: (velocity: number) => void;
  /** Portrait only: the free band above the headline, in CSS px from the top of the canvas. */
  setFreeBand: (top: number, bottom: number) => void;
  setRunning: (running: boolean) => void;
  dispose: () => void;
};

type Options = {
  quality: SceneQuality;
  onFirstFrame: () => void;
  onTooSlow: () => void;
  onFail: () => void;
};

const MODEL_URL = MODEL_URLS.oyster;
/** Lid angle in radians: barely ajar before the reveal, wide open after it. */
const LID_CLOSED = 0.05;
const LID_OPEN = 0.98;
const REVEAL_DELAY = 0.5;
const REVEAL_SECONDS = 2.8;

function restyleOyster(root: THREE.Object3D, envMap: THREE.Texture) {
  let lid: THREE.Object3D | undefined;
  let pearl: THREE.Mesh | undefined;
  const pearlShader = createPearlMaterial();
  const nacre = new THREE.MeshPhysicalMaterial({
    color: 0xb9bfc6,
    roughness: 0.16,
    metalness: 0.45,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    iridescence: 1,
    iridescenceIOR: 1.8,
    iridescenceThicknessRange: [200, 900],
    sheen: 0.5,
    sheenColor: new THREE.Color(0xbfe9ef),
    envMap,
    envMapIntensity: 1.5,
    side: THREE.DoubleSide,
  });

  root.traverse((obj) => {
    if (/conch.?shell.?above/i.test(obj.name)) lid = obj;
    if (!(obj instanceof THREE.Mesh)) return;
    const source = obj.material as THREE.MeshStandardMaterial;
    if (/pearl/i.test(obj.name) && !/shell/i.test(obj.name)) {
      pearl = obj;
      obj.material = pearlShader.material;
    } else if (/mother/i.test(source.name)) {
      obj.material = nacre;
    } else {
      // The outer shell keeps its own grain texture, deepened to bronze and given a wet lacquer.
      obj.material = new THREE.MeshPhysicalMaterial({
        map: source.map,
        normalMap: source.normalMap,
        normalScale: new THREE.Vector2(1.4, 1.4),
        color: 0x8a6f4e,
        roughness: 0.42,
        metalness: 0.25,
        clearcoat: 0.8,
        clearcoatRoughness: 0.22,
        envMap,
        envMapIntensity: 1.1,
        side: THREE.DoubleSide,
      });
    }
    source.dispose();
  });
  return { lid, pearl, pearlUniforms: pearlShader.uniforms };
}

function buildParticles(count: number, pixelRatio: number) {
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const speeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = -Math.random() * 9 + 3;
    scales[i] = Math.pow(Math.random(), 2.2);
    speeds[i] = 0.4 + Math.random() * 0.8;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
  const uniforms = {
    uTime: { value: 0 },
    uRise: { value: 0 },
    uPixelRatio: { value: pixelRatio },
    uSize: { value: 120 },
    uColor: { value: new THREE.Color(0xf2e4c4) },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime; uniform float uRise; uniform float uPixelRatio; uniform float uSize;
      attribute float aScale; attribute float aSpeed;
      varying float vAlpha;
      void main(){
        vec3 p=position;
        p.y=mod(p.y+uTime*aSpeed*0.16+uRise+5.0,10.0)-5.0;
        p.x+=sin(uTime*0.35*aSpeed+position.z*1.7)*0.18;
        vec4 mv=modelViewMatrix*vec4(p,1.0);
        gl_Position=projectionMatrix*mv;
        gl_PointSize=uSize*(0.15+aScale)*uPixelRatio/-mv.z;
        vAlpha=smoothstep(-13.0,-3.0,mv.z)*(0.25+0.75*aScale)*smoothstep(5.0,3.5,abs(p.y));
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; varying float vAlpha;
      void main(){
        float d=length(gl_PointCoord-0.5);
        float a=smoothstep(0.5,0.0,d);
        gl_FragColor=vec4(uColor,a*a*vAlpha*0.6);
      }`,
  });
  return { points: new THREE.Points(geometry, material), uniforms };
}

function buildRays() {
  const uniforms = { uTime: { value: 0 }, uStrength: { value: 1 } };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uStrength; varying vec2 vUv;
      void main(){
        float edge=pow(sin(3.14159*vUv.x),3.0);
        float fall=pow(vUv.y,2.2);
        float flicker=0.75+0.25*sin(uTime*0.6+vUv.x*9.0);
        gl_FragColor=vec4(vec3(0.62,0.86,0.9),edge*fall*flicker*0.075*uStrength);
      }`,
  });
  const group = new THREE.Group();
  const specs: [number, number, number, number][] = [
    [-1.6, 0.9, 0.22, 2.2],
    [-0.2, 1.4, -0.12, 1.6],
    [1.3, 1.1, 0.18, 2.6],
    [2.8, 0.7, -0.2, 1.8],
  ];
  for (const [x, z, tilt, width] of specs) {
    const ray = new THREE.Mesh(new THREE.PlaneGeometry(width, 16), material);
    ray.position.set(x, 3.5, -2 - z);
    ray.rotation.z = tilt;
    group.add(ray);
  }
  return { group, uniforms };
}

function buildHalo() {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uOpacity: { value: 1 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacity; varying vec2 vUv;
      void main(){
        float d=distance(vUv,vec2(0.5));
        float glow=smoothstep(0.5,0.0,d);
        vec3 col=mix(vec3(0.24,0.6,0.66),vec3(0.9,0.75,0.48),smoothstep(0.35,0.05,d));
        gl_FragColor=vec4(col,glow*glow*0.3*uOpacity);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), material);
  mesh.position.set(0, 0.05, -0.9);
  return { mesh, material };
}

export function createDepthEngine(canvas: HTMLCanvasElement, { quality, onFirstFrame, onTooSlow, onFail }: Options): DepthEngine {
  const { renderer, pixelRatio } = createRenderer(canvas, quality);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030608, 0.05);
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
  camera.position.set(0, 0, 7);

  const envMap = buildEnvironment(renderer);
  const particles = buildParticles(quality === 'full' ? 1600 : 520, pixelRatio);
  const rays = buildRays();
  const halo = buildHalo();

  /** rig: placement on screen. tilt: the pose that shows the inside of the shell. */
  const rig = new THREE.Group();
  const tilt = new THREE.Group();
  tilt.rotation.set(0.5, -0.32, 0.04);
  rig.add(halo.mesh, tilt);
  scene.add(rays.group, rig, particles.points);

  const pearlGlow = createGlow(0xffe9cc, 1.1);
  scene.add(pearlGlow.mesh);
  const pearlLight = new THREE.PointLight(0xffd7a0, 0, 0, 2);

  let lid: THREE.Object3D | undefined;
  let pearl: THREE.Mesh | undefined;
  let pearlRadius = 0;
  let pearlUniforms: ReturnType<typeof createPearlMaterial>['uniforms'] | undefined;
  let ready = false;
  let disposed = false;

  loadModel(MODEL_URL)
    .then((gltf) => {
      if (disposed) {
        disposeTree(gltf.scene);
        return;
      }
      const styled = restyleOyster(gltf.scene, envMap);
      lid = styled.lid;
      pearl = styled.pearl;
      pearlUniforms = styled.pearlUniforms;
      const model = normalize(gltf.scene);
      tilt.add(model);
      if (pearl) {
        pearl.geometry.computeBoundingSphere();
        const sphere = pearl.geometry.boundingSphere!;
        pearlRadius = sphere.radius;
        // The light rides on the pearl so it lights the nacre around it in every pose.
        pearlLight.position.copy(sphere.center);
        pearl.add(pearlLight);
      }
      ready = true;
    })
    .catch(() => {
      if (!disposed) onFail();
    });

  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let dive = 0;
  let diveSmooth = 0;
  let velocity = 0;
  let velocitySmooth = 0;
  let anchor = { x: 0, y: 0, size: 1 };
  let freeBand: { top: number; bottom: number } | null = null;

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const viewH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const viewW = viewH * camera.aspect;
    if (camera.aspect > 1.15) {
      // Landscape: the shell owns the left column (the headline is capped to the right half).
      anchor = { x: -viewW * 0.26, y: viewH * 0.03, size: Math.min(viewW * 0.34, viewH * 0.6) };
    } else {
      // Portrait: centred in the measured gap between the header and the headline, so it never covers text.
      const band = freeBand ?? { top: h * 0.08, bottom: h * 0.32 };
      const toWorld = viewH / h;
      const bandH = Math.max(0, band.bottom - band.top) * toWorld;
      anchor = {
        x: 0,
        y: viewH / 2 - ((band.top + band.bottom) / 2) * toWorld,
        // The open shell is about as tall as its scale; keep a margin so the lid's sway stays clear too.
        size: Math.max(viewH * 0.12, Math.min(viewW * 0.66, bandH * 0.86)),
      };
    }
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  const guard = createFrameGuard(() => {
    stop();
    onTooSlow();
  });
  const basePosition = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();
  const pearlWorld = new THREE.Vector3();
  const flyTarget = new THREE.Vector3();
  const scratch = new THREE.Vector3();
  let lastTime = performance.now();
  let elapsed = 0;
  let revealTime = -1;
  let firstFrameSent = false;

  const frame = () => {
    const now = performance.now();
    const delta = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    if (!ready) return;
    elapsed += delta;
    if (guard(delta)) return;

    if (revealTime < 0) revealTime = elapsed;
    const reveal = easeInOutCubic(THREE.MathUtils.clamp((elapsed - revealTime - REVEAL_DELAY) / REVEAL_SECONDS, 0, 1));

    pointer.sx += (pointer.x - pointer.sx) * 0.045;
    pointer.sy += (pointer.y - pointer.sy) * 0.045;
    diveSmooth += (dive - diveSmooth) * 0.08;
    velocitySmooth += (velocity - velocitySmooth) * 0.06;
    velocity *= 0.9;

    // The dive: first the shell glides to the centre and opens wider, then the camera flies into the pearl.
    const centre = THREE.MathUtils.smoothstep(diveSmooth, 0, 0.3);
    const fly = Math.pow(THREE.MathUtils.smoothstep(diveSmooth, 0.12, 0.96), 1.7);
    const calm = 1 - fly;

    const stir = Math.min(Math.abs(velocitySmooth) * 0.004, 0.08);
    if (lid) {
      const breathe = Math.sin(elapsed * 0.9) * 0.025 * reveal;
      lid.rotation.x = -(THREE.MathUtils.lerp(LID_CLOSED, LID_OPEN, reveal) + breathe + stir + centre * 0.25);
    }
    const glow = reveal * (0.85 + Math.sin(elapsed * 1.6) * 0.15);
    // Dim the pearl's own light on approach, or it bleaches the nacre around it to flat white.
    pearlLight.intensity = glow * 2.4 * (1 - fly * 0.75);
    if (pearlUniforms) {
      pearlUniforms.uTime.value = elapsed;
      pearlUniforms.uGlow.value = glow;
      pearlUniforms.uClose.value = THREE.MathUtils.smoothstep(fly, 0.45, 0.95);
    }

    particles.uniforms.uTime.value = elapsed;
    particles.uniforms.uRise.value = diveSmooth * 2.6;
    rays.uniforms.uTime.value = elapsed;
    rays.uniforms.uStrength.value = 1 - diveSmooth * 0.85;
    halo.material.uniforms.uOpacity.value = (0.55 + reveal * 0.45) * calm;

    tilt.rotation.y = -0.32 + (Math.sin(elapsed * 0.22) * 0.22 + pointer.sx * 0.4) * calm;
    tilt.rotation.x = 0.5 + (Math.sin(elapsed * 0.17) * 0.05 + pointer.sy * 0.18) * calm + centre * 0.12;
    rig.scale.setScalar(anchor.size * (1 + centre * 0.3) * (0.94 + reveal * 0.06));
    rig.position.set(
      THREE.MathUtils.lerp(anchor.x, 0, centre) + pointer.sx * 0.15 * calm,
      THREE.MathUtils.lerp(anchor.y, 0, centre) + Math.sin(elapsed * 0.4) * 0.05 * calm,
      0,
    );
    rig.updateMatrixWorld(true);

    basePosition.set(pointer.sx * 0.35 * calm, -pointer.sy * 0.22 * calm, 7);
    lookTarget.set(0, 0, 0);
    if (pearl) {
      pearl.getWorldPosition(pearlWorld);
      const radius = pearlRadius * pearl.getWorldScale(scratch).x;
      // Stop just outside the surface: the pearl fills the frame.
      flyTarget.subVectors(basePosition, pearlWorld).normalize().multiplyScalar(radius * 1.12).add(pearlWorld);
      camera.position.lerpVectors(basePosition, flyTarget, fly);
      lookTarget.lerp(pearlWorld, THREE.MathUtils.smoothstep(diveSmooth, 0.02, 0.4));
      pearlGlow.mesh.position.copy(pearlWorld);
      pearlGlow.mesh.scale.setScalar(radius * 9 * (1 - fly * 0.5));
      pearlGlow.uniforms.uOpacity.value = glow * 0.75 * (1 - fly * 0.8);
    } else {
      camera.position.copy(basePosition);
    }
    // Pull the near plane in only while flying up to the surface; at rest it stays far for depth precision.
    const near = fly > 0.01 ? THREE.MathUtils.lerp(0.1, 0.004, fly) : 0.1;
    if (Math.abs(camera.near - near) > 1e-4) {
      camera.near = near;
      camera.updateProjectionMatrix();
    }
    camera.lookAt(lookTarget);
    pearlGlow.face(camera);
    (scene.fog as THREE.FogExp2).density = 0.05 * calm;

    renderer.render(scene, camera);
    if (!firstFrameSent) {
      firstFrameSent = true;
      onFirstFrame();
    }
  };

  let running = false;
  const stop = () => {
    running = false;
    renderer.setAnimationLoop(null);
  };
  const setRunning = (next: boolean) => {
    if (next === running || disposed) return;
    if (!next) return stop();
    running = true;
    lastTime = performance.now();
    renderer.setAnimationLoop(frame);
  };

  return {
    setPointer: (x, y) => {
      pointer.x = x;
      pointer.y = y;
    },
    setDive: (progress) => {
      dive = progress;
    },
    setVelocity: (v) => {
      velocity = v;
    },
    setFreeBand: (top, bottom) => {
      freeBand = { top, bottom };
      resize();
    },
    setRunning,
    dispose: () => {
      disposed = true;
      stop();
      resizeObserver.disconnect();
      disposeTree(scene);
      envMap.dispose();
      renderer.dispose();
    },
  };
}
