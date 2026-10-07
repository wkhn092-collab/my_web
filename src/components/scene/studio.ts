import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { prefetchModel } from './model-cache';

export type SceneQuality = 'full' | 'reduced';

/** Median frame time above this (≈22fps) means the device can't keep up; the median ignores throttling spikes. */
const SLOW_FRAME_MS = 45;
const SAMPLE_FRAMES = 90;
const WARMUP_FRAMES = 30;

export function createRenderer(canvas: HTMLCanvasElement, quality: SceneQuality, { small = false } = {}) {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, quality === 'full' ? 1.5 : 1.25);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    // Dense screens hide aliasing on their own; MSAA there only costs fill rate. Small stages can afford it.
    antialias: small || (quality === 'full' && pixelRatio < 1.5),
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  return { renderer, pixelRatio };
}

/** A dark studio with a few glowing panels: what metal, nacre and glass reflect. No HDRI files. */
export function buildEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const room = new THREE.Scene();
  room.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ color: 0x030507, side: THREE.BackSide })));
  const panel = (w: number, h: number, color: number, intensity: number, pos: [number, number, number]) => {
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    mesh.position.set(...pos);
    mesh.lookAt(0, 0, 0);
    room.add(mesh);
  };
  panel(26, 26, 0x123840, 1.6, [0, 0, -12]); // deep teal wall
  panel(26, 12, 0x3a2a14, 1.5, [0, -11, 0]); // warm floor glow
  panel(0.5, 14, 0xffffff, 5, [7, 0, 7]); // thin strips: crisp edge highlights
  panel(0.35, 14, 0xf3dcb0, 4, [-7, 0, 6]);
  panel(0.4, 12, 0xbfe9ef, 3, [3, 0, -9]);
  panel(16, 4, 0xfff4e2, 4.5, [0, 9, 2]); // soft key from above
  panel(3, 10, 0xe2b673, 2.6, [-9, 1, 3]); // gold side
  panel(4, 8, 0x3e9aa8, 2.2, [9, -2, -2]); // teal rim
  panel(10, 0.4, 0xffffff, 6, [0, 2, -9]); // thin strip behind
  panel(6, 1.2, 0xc9a66b, 1.4, [2, -8, 4]); // warm bounce from below

  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(room, 0.035).texture;
  pmrem.dispose();
  disposeTree(room);
  return texture;
}

const loader = new GLTFLoader();

export async function loadModel(url: string): Promise<GLTF> {
  const buffer = await prefetchModel(url);
  return loader.parseAsync(buffer, url.slice(0, url.lastIndexOf('/') + 1));
}

/** Re-centres an object on the origin and scales it so its largest side is 1 unit. */
export function normalize(object: THREE.Object3D): THREE.Group {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  object.position.sub(center);
  const wrapper = new THREE.Group();
  wrapper.add(object);
  wrapper.scale.setScalar(1 / Math.max(size.x, size.y, size.z));
  return wrapper;
}

/** A soft round glow texture for sprites, drawn once on a canvas. */
export function glowTexture(inner: string, outer = 'rgba(0,0,0,0)'): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, inner);
  gradient.addColorStop(1, outer);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * The pearl: a warm white body with a flowing iridescent sheen, a rim light and a crisp highlight. A shader of
 * its own (not a PBR material) so it glows the same in a dark scene as up close, when the camera dives into it.
 */
export function createPearlMaterial() {
  /** uClose: 0 at a distance, 1 when the camera is at the surface (the sheen takes over the whole body). */
  const uniforms = { uTime: { value: 0 }, uGlow: { value: 0 }, uClose: { value: 0 } };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying vec3 vObjN;
      void main(){
        vObjN=normalize(normal);
        vN=normalize(normalMatrix*normal);
        vec4 mv=modelViewMatrix*vec4(position,1.0);
        vV=normalize(-mv.xyz);
        gl_Position=projectionMatrix*mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uGlow; uniform float uClose;
      varying vec3 vN; varying vec3 vV; varying vec3 vObjN;
      vec3 spectrum(float t){ return 0.5+0.5*cos(6.28318*(t+vec3(0.0,0.33,0.67))); }
      void main(){
        vec3 n=normalize(vN); vec3 v=normalize(vV);
        float ndv=max(dot(n,v),0.0);
        float f=pow(1.0-ndv,1.5);
        vec3 L=normalize(vec3(-0.35,0.85,0.55));
        float diff=max(dot(n,L),0.0);
        vec3 base=vec3(0.95,0.92,0.86)*(0.45+0.5*diff)+vec3(0.05,0.08,0.09);
        float flow=sin(dot(vObjN,vec3(3.1,2.3,1.7))*3.0+uTime*0.35)*0.5+0.5;
        float swirl=sin(dot(vObjN,vec3(-1.3,4.1,2.2))*2.2-uTime*0.22)*0.5+0.5;
        vec3 irid=spectrum(f*0.9+flow*0.22+swirl*0.12+uTime*0.025);
        vec3 col=mix(base,base*0.62+irid*0.5,clamp(f*1.15+flow*0.1,0.0,1.0));
        vec3 h=normalize(L+v);
        col+=pow(max(dot(n,h),0.0),70.0)*0.85;
        col+=vec3(0.75,0.86,0.9)*pow(1.0-ndv,4.0)*0.3;
        col+=vec3(1.0,0.92,0.8)*uGlow*0.22;
        // Up close: bands of nacre colour drifting across the surface, bright enough to read as light.
        float bands=sin(dot(vObjN,vec3(9.0,6.5,4.0))+uTime*0.9+swirl*3.0)*0.5+0.5;
        vec3 nacre=mix(vec3(1.0,0.96,0.9),spectrum(bands*0.6+flow*0.3+uTime*0.05),0.45)*(0.88+0.2*bands);
        col=mix(col,nacre,uClose);
        gl_FragColor=vec4(col,1.0);
      }`,
  });
  return { material, uniforms };
}

/** A soft additive glow on a plane; call face(camera) each frame to keep it turned to the camera. */
export function createGlow(color: THREE.ColorRepresentation, strength = 1) {
  const uniforms = { uOpacity: { value: 0 }, uColor: { value: new THREE.Color(color) }, uStrength: { value: strength } };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uOpacity; uniform vec3 uColor; uniform float uStrength; varying vec2 vUv;
        void main(){
          float d=distance(vUv,vec2(0.5))*2.0;
          float g=pow(max(0.0,1.0-d),2.4)*uOpacity;
          // Alpha must fall off too: the canvas is transparent, and a solid alpha would print a dark square.
          gl_FragColor=vec4(uColor*uStrength,g);
        }`,
    }),
  );
  mesh.renderOrder = 2;
  const face = (camera: THREE.Camera) => mesh.quaternion.copy(camera.quaternion);
  return { mesh, uniforms, face };
}

/** Watches frame times after a warm-up and reports once if the median is too slow. Returns true when tripped. */
export function createFrameGuard(onTooSlow: () => void) {
  let frames = 0;
  const samples: number[] = [];
  let tripped = false;
  return (deltaSeconds: number) => {
    if (tripped) return true;
    if (samples.length >= SAMPLE_FRAMES || document.visibilityState !== 'visible') return false;
    frames++;
    if (frames <= WARMUP_FRAMES) return false;
    samples.push(deltaSeconds * 1000);
    if (samples.length === SAMPLE_FRAMES) {
      const median = [...samples].sort((a, b) => a - b)[Math.floor(SAMPLE_FRAMES / 2)];
      if (median > SLOW_FRAME_MS) {
        tripped = true;
        onTooSlow();
      }
    }
    return tripped;
  };
}

export function disposeTree(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Sprite) {
      obj.geometry.dispose();
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const material of materials) {
        for (const value of Object.values(material)) {
          if (value instanceof THREE.Texture) value.dispose();
        }
        material.dispose();
      }
    }
  });
}

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
