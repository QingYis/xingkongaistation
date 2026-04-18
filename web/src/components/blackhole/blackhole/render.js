import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { CameraDragControls } from './CameraDragControls';
import { Observer } from './Observer';
import { Vector2 } from 'three/src/math/Vector2';
import fragmentShader from './shaders/fragment.glsl?raw';
import vertexShader from './shaders/vertex.glsl?raw';

export const MAX_RENDER_PIXEL_RATIO = 2;

export function getContainerSize(container) {
  return {
    width: container.clientWidth || window.innerWidth,
    height: container.clientHeight || window.innerHeight,
  };
}

export function getRenderPixelRatio(pixelRatioCap = MAX_RENDER_PIXEL_RATIO) {
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  const maxRatio = isMobile ? 1.5 : pixelRatioCap;
  return Math.min(window.devicePixelRatio || 1, maxRatio);
}

export function createRenderer(
  container,
  { pixelRatioCap = MAX_RENDER_PIXEL_RATIO } = {},
) {
  const { width, height } = getContainerSize(container);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(width, height);
  renderer.setPixelRatio(getRenderPixelRatio(pixelRatioCap));
  renderer.autoClear = false;
  return renderer;
}

export function createScene(
  renderer,
  { enableBloom = true, bloomStrength = 0.8 } = {},
) {
  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  camera.position.z = 1;

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  let bloomPass = null;
  const shaderPass = new ShaderPass(CopyShader);
  shaderPass.renderToScreen = true;
  composer.addPass(renderPass);

  if (enableBloom) {
    // Use 50% resolution for bloom pass to improve performance
    const { width, height } = renderer.getSize(new THREE.Vector2());
    bloomPass = new UnrealBloomPass(
      new Vector2(width * 0.5, height * 0.5),
      bloomStrength,
      2.0,
      0.0,
    );
    composer.addPass(bloomPass);
  }

  composer.addPass(shaderPass);

  return {
    scene,
    composer,
    bloomPass,
  };
}

export function createCamera(container, domElement) {
  const { width, height } = getContainerSize(container);
  const observer = new Observer(60.0, width / height, 1, 80000);
  const cameraControl = new CameraDragControls(observer, domElement);
  return {
    observer,
    cameraControl,
  };
}

export function loadTextures(onTextureLoad) {
  const textures = new Map();
  const textureLoader = new THREE.TextureLoader();

  loadTexture('bg1', '/assets/blackhole/milkyway.jpg', THREE.NearestFilter);
  loadTexture('star', '/assets/blackhole/star_noise.png', THREE.LinearFilter);
  loadTexture(
    'disk',
    '/assets/blackhole/accretion_disk.png',
    THREE.LinearFilter,
  );

  function loadTexture(
    name,
    image,
    interpolation,
    wrap = THREE.ClampToEdgeWrapping,
  ) {
    textures.set(name, null);
    textureLoader.load(image, (texture) => {
      texture.magFilter = interpolation;
      texture.minFilter = interpolation;
      texture.wrapT = wrap;
      texture.wrapS = wrap;
      textures.set(name, texture);
      onTextureLoad?.(name, texture);
    });
  }

  return textures;
}

export async function createShaderProjectionPlane(
  uniforms,
  quality = 'medium',
) {
  const defines = getShaderDefineConstant(quality);
  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader,
    fragmentShader: defines + fragmentShader,
  });
  material.needsUpdate = true;

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);

  async function changePerformanceQuality(newQuality) {
    const defines = getShaderDefineConstant(newQuality);
    material.fragmentShader = defines + fragmentShader;
    material.needsUpdate = true;
  }

  function getShaderDefineConstant(quality) {
    let STEP, NSTEPS;
    switch (quality) {
      case 'low':
        STEP = 0.12;
        NSTEPS = 250;
        break;
      case 'medium':
        STEP = 0.06;
        NSTEPS = 500;
        break;
      case 'high':
        STEP = 0.03;
        NSTEPS = 800;
        break;
      default:
        STEP = 0.06;
        NSTEPS = 500;
    }
    return `
#define STEP ${STEP}
#define NSTEPS ${NSTEPS}
`;
  }

  return {
    mesh,
    changePerformanceQuality,
  };
}
