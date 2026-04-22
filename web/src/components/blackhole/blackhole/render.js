import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { CameraDragControls } from './CameraDragControls';
import { Observer } from './Observer';
import fragmentShader from './shaders/fragment.glsl?raw';
import vertexShader from './shaders/vertex.glsl?raw';

export const MAX_RENDER_PIXEL_RATIO = 1.5;

const DEFAULT_RESOLUTION_SCALE = 0.7;

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
  const maxRatio = isMobile ? 1.0 : pixelRatioCap;
  return Math.min(window.devicePixelRatio || 1, maxRatio);
}

export function createRenderer(
  container,
  { pixelRatioCap = MAX_RENDER_PIXEL_RATIO } = {},
) {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);

  const pixelRatio = getRenderPixelRatio(pixelRatioCap);
  renderer.setPixelRatio(pixelRatio);

  const { width, height } = getContainerSize(container);
  const scale = DEFAULT_RESOLUTION_SCALE;
  renderer.setSize(
    Math.floor(width * scale),
    Math.floor(height * scale),
    false,
  );
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.autoClear = false;

  container.appendChild(renderer.domElement);
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
  renderPass.enabled = true;
  composer.addPass(renderPass);

  let bloomPass = null;
  if (enableBloom) {
    const { width, height } = renderer.getSize(new THREE.Vector2());
    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(Math.floor(width * 0.5), Math.floor(height * 0.5)),
      bloomStrength,
      2.0,
      0.0,
    );
    composer.addPass(bloomPass);
  }

  const shaderPass = new ShaderPass(CopyShader);
  shaderPass.renderToScreen = true;
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
      texture.generateMipmaps = false;
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

export class ResolutionScaler {
  constructor(renderer, composer, initialScale = DEFAULT_RESOLUTION_SCALE) {
    this.renderer = renderer;
    this.composer = composer;
    this.scale = initialScale;
    this.minScale = 0.4;
    this.maxScale = 1.0;
    this.targetFps = 30;
    this.fpsBuffer = [];
    this.fpsBufferSize = 12;
    this.containerWidth = 0;
    this.containerHeight = 0;
    this.updatePending = false;
  }

  setSize(containerWidth, containerHeight) {
    this.containerWidth = containerWidth;
    this.containerHeight = containerHeight;

    const pixelRatio = this.renderer.getPixelRatio();
    const scalingFactor = this.scale * pixelRatio;
    const renderWidth = Math.max(1, Math.floor(containerWidth * scalingFactor));
    const renderHeight = Math.max(1, Math.floor(containerHeight * scalingFactor));

    this.renderer.setSize(renderWidth, renderHeight, false);
    this.composer.setSize(renderWidth, renderHeight);

    for (const pass of this.composer.passes) {
      if (pass instanceof UnrealBloomPass) {
        const bloomW = Math.max(1, Math.floor(renderWidth * 0.5));
        const bloomH = Math.max(1, Math.floor(renderHeight * 0.5));
        pass.resolution.set(bloomW, bloomH);
      }
    }

    return { width: renderWidth, height: renderHeight };
  }

  reportFrame(frameDurationMs) {
    const fps = 1000 / Math.max(1, frameDurationMs);
    this.fpsBuffer.push(fps);
    if (this.fpsBuffer.length > this.fpsBufferSize) {
      this.fpsBuffer.shift();
    }

    if (this.fpsBuffer.length < 6) return;

    const avgFps =
      this.fpsBuffer.reduce((a, b) => a + b, 0) / this.fpsBuffer.length;

    let resized = false;

    if (avgFps < this.targetFps * 0.7 && this.scale > this.minScale) {
      this.scale = Math.max(this.minScale, this.scale - 0.05);
      this.fpsBuffer.length = 0;
      resized = true;
    } else if (avgFps > this.targetFps * 1.5 && this.scale < this.maxScale) {
      this.scale = Math.min(this.maxScale, this.scale + 0.02);
      this.fpsBuffer.length = 0;
      resized = true;
    }

    if (resized && !this.updatePending) {
      this.updatePending = true;
      requestAnimationFrame(() => {
        this.updatePending = false;
        if (this.containerWidth && this.containerHeight) {
          this.setSize(this.containerWidth, this.containerHeight);
        }
      });
    }
  }
}