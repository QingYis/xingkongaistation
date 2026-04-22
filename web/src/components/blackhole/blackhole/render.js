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

export const MAX_RENDER_PIXEL_RATIO = 1.0; // 降低最大像素比以提升性能

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
  // 移动端使用更低的像素比
  const maxRatio = isMobile ? 0.75 : pixelRatioCap;
  // 限制最大像素比为 1.0 以提升性能
  return Math.min(window.devicePixelRatio || 1, maxRatio, 1.0);
}

export function createRenderer(
  container,
  { pixelRatioCap = MAX_RENDER_PIXEL_RATIO } = {},
) {
  const { width, height } = getContainerSize(container);
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(getRenderPixelRatio(pixelRatioCap));
  renderer.setSize(width, height, false);
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
    // 降低 Bloom 分辨率以提升性能
    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(Math.floor(width * 0.4), Math.floor(height * 0.4)),
      bloomStrength,
      1.2, // 降低半径
      0.15, // 提高阈值，减少需要处理的像素
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

// 创建程序化 fallback 纹理（保持原始黑洞视觉效果）
function createFallbackTexture(type) {
  const size = type === 'bg1' ? 256 : (type === 'disk' ? 256 : 128);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = type === 'disk' ? 64 : size;
  const ctx = canvas.getContext('2d');
  
  if (type === 'bg1') {
    // 银河背景 - 深空黑色，带微弱星云
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);
    // 添加微弱的紫蓝色星云效果
    const gradient = ctx.createRadialGradient(size*0.3, size*0.6, 0, size*0.3, size*0.6, size*0.5);
    gradient.addColorStop(0, 'rgba(20, 10, 40, 0.3)');
    gradient.addColorStop(0.5, 'rgba(10, 5, 25, 0.15)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    // 添加少量亮星
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const brightness = Math.random() * 0.3 + 0.1;
      ctx.fillStyle = `rgba(255, 250, 240, ${brightness})`;
      ctx.fillRect(x, y, 1, 1);
    }
  } else if (type === 'star') {
    // 星噪声纹理 - 用于shader中的星星渲染
    // R通道=温度(0-1映射到1000K-40000K), G通道=亮度, B通道=速度(0.5=静止)
    const imageData = ctx.createImageData(size, size);
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (Math.random() > 0.985) {
        // 星星：随机温度产生不同颜色
        imageData.data[i] = Math.floor(Math.random() * 200 + 55);     // r - 温度
        imageData.data[i+1] = Math.floor(Math.random() * 180 + 75);   // g - 亮度
        imageData.data[i+2] = 128;  // b - 速度(0.5=静止)
      } else {
        imageData.data[i] = 0;
        imageData.data[i+1] = 0;
        imageData.data[i+2] = 128;
      }
      imageData.data[i+3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  } else if (type === 'disk') {
    // 吸积盘纹理 - 高温白色/蓝白色效果
    const height = canvas.height;
    const imageData = ctx.createImageData(size, height);
    for (let y = 0; y < height; y++) {
      const radialFactor = y / height;
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        const angle = (x / size) * Math.PI * 2;
        const swirl = Math.sin(angle * 4 + radialFactor * 6) * 0.1 + 0.9;
        
        // 白色/蓝白色吸积盘
        const brightness = (1 - radialFactor * 0.3) * swirl;
        imageData.data[i] = Math.floor(255 * brightness);       // R
        imageData.data[i+1] = Math.floor(252 * brightness);     // G
        imageData.data[i+2] = Math.floor(255 * brightness);     // B - 略偏蓝
        imageData.data[i+3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  return texture;
}

export function loadTextures(onTextureLoad) {
  const textures = new Map();
  const textureLoader = new THREE.TextureLoader();
  
  // 预先创建 fallback 纹理，确保立即可渲染
  const fallbacks = {
    bg1: createFallbackTexture('bg1'),
    star: createFallbackTexture('star'),
    disk: createFallbackTexture('disk'),
  };
  
  // 立即设置 fallback 纹理
  for (const [name, fallback] of Object.entries(fallbacks)) {
    textures.set(name, fallback);
    onTextureLoad?.(name, fallback);
  }

  // 异步加载真实纹理（如果存在）
  loadTexture('bg1', '/assets/blackhole/milkyway.jpg', THREE.NearestFilter);
  loadTexture('star', '/assets/blackhole/star_noise.png', THREE.LinearFilter);
  loadTexture('disk', '/assets/blackhole/accretion_disk.png', THREE.LinearFilter);

  function loadTexture(
    name,
    image,
    interpolation,
    wrap = THREE.ClampToEdgeWrapping,
  ) {
    textureLoader.load(
      image,
      (texture) => {
        // 成功加载真实纹理
        texture.generateMipmaps = false;
        texture.magFilter = interpolation;
        texture.minFilter = interpolation;
        texture.wrapT = wrap;
        texture.wrapS = wrap;
        // 释放 fallback 纹理
        const oldTexture = textures.get(name);
        if (oldTexture && oldTexture !== texture) {
          oldTexture.dispose();
        }
        textures.set(name, texture);
        onTextureLoad?.(name, texture);
      },
      undefined,
      () => {
        // 加载失败，保持使用 fallback 纹理（已设置）
        console.debug(`Blackhole texture ${name} not found, using fallback`);
      }
    );
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