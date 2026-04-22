import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  createRenderer,
  createScene,
  createCamera,
  loadTextures,
  createShaderProjectionPlane,
  getContainerSize,
  getRenderPixelRatio,
} from './blackhole/render';

// 性能检测：检测设备性能等级
function detectPerformanceLevel() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
  
  // 移动设备直接返回低性能
  if (isMobile) return 'low';
  
  // 检测 GPU 性能（通过 WebGL 扩展）
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        // 检测集成显卡
        if (renderer && /Intel|HD Graphics|UHD Graphics|Iris/.test(renderer)) {
          return 'low';
        }
      }
      // 检测最大纹理尺寸作为性能指标
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      if (maxTextureSize < 4096) return 'low';
      if (maxTextureSize >= 8192) return 'high';
    }
  } catch (e) {
    // WebGL 不可用，使用保守设置
    return 'low';
  }
  
  return 'medium';
}

const BlackholeBackground = React.memo(({
  quality = 'medium',
  enableBloom = true,
  bloomStrength = 0.8,
  autoRotate = true,
}) => {
  const containerRef = useRef(null);
  const blackholeRef = useRef(null);
  const initRef = useRef(false);
  
  // 检测设备性能等级（只计算一次）
  const performanceLevel = useMemo(() => detectPerformanceLevel(), []);
  
  // 根据性能等级调整参数
  const effectiveParams = useMemo(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
    
    let effectiveQuality = quality;
    let effectiveBloom = enableBloom;
    let targetFPS = 30;
    
    if (isMobile || performanceLevel === 'low') {
      effectiveQuality = 'low';
      effectiveBloom = false;
      targetFPS = 24;
    } else if (performanceLevel === 'high') {
      effectiveQuality = quality === 'high' ? 'high' : 'medium';
      effectiveBloom = enableBloom;
      targetFPS = 30;
    }
    
    return {
      effectiveQuality,
      effectiveBloom,
      targetFPS,
      frameInterval: 1000 / targetFPS,
    };
  }, [quality, enableBloom, performanceLevel]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let animationId;
    let disposed = false;
    let lastFrameTime;
    let isInitialized = false;
    
    // 从 effectiveParams 解构参数
    const { effectiveQuality, effectiveBloom, frameInterval } = effectiveParams;

    // 避免重复初始化
    if (initRef.current) return;
    initRef.current = true;
    
    // 使用 RAF 确保 DOM 已渲染完成
    const initDelay = requestAnimationFrame(() => {
      // 再延迟一帧确保布局稳定
      requestAnimationFrame(() => init());
    });

    const init = async () => {
      if (disposed) return;
      
      const renderer = createRenderer(container);

      const { scene, composer } = createScene(renderer, {
        enableBloom: effectiveBloom,
        bloomStrength,
      });

      const { observer, cameraControl } = createCamera(
        container,
        renderer.domElement,
      );
      scene.add(observer);

      const uniforms = {
        time: { type: 'f', value: 0.0 },
        resolution: { type: 'v2', value: new THREE.Vector2() },
        accretion_disk: { type: 'b', value: true },
        use_disk_texture: { type: 'b', value: true },
        lorentz_transform: { type: 'b', value: false },
        doppler_shift: { type: 'b', value: false },
        beaming: { type: 'b', value: false },
        cam_pos: { type: 'v3', value: observer.position },
        cam_vel: { type: 'v3', value: observer.velocity },
        cam_dir: { type: 'v3', value: observer.direction },
        cam_up: { type: 'v3', value: observer.up },
        fov: { type: 'f', value: observer.fov },
        bg_texture: { type: 't', value: null },
        star_texture: { type: 't', value: null },
        disk_texture: { type: 't', value: null },
      };
      const textureUniformMap = {
        bg1: uniforms.bg_texture,
        star: uniforms.star_texture,
        disk: uniforms.disk_texture,
      };

      const textures = loadTextures((name, texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        const uniform = textureUniformMap[name];
        if (uniform) {
          uniform.value = texture;
        }
      });

      const { mesh } = await createShaderProjectionPlane(uniforms, effectiveQuality);

      if (disposed) {
        mesh.geometry.dispose();
        mesh.material.dispose();
        for (const texture of textures.values()) {
          if (texture) texture.dispose();
        }
        cameraControl.dispose();
        composer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        renderer.dispose();
        return;
      }

      scene.add(mesh);

      observer.distance = 10.0;
      observer.moving = autoRotate;
      observer.fov = 60.0;
      uniforms.fov.value = observer.fov;

      const handleResize = () => {
        const { width, height } = getContainerSize(container);
        const pixelRatio = getRenderPixelRatio();
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height, false);
        composer.setSize(width, height);
        uniforms.resolution.value.set(width * pixelRatio, height * pixelRatio);
        observer.aspect = width / height;
        observer.updateProjectionMatrix();
        cameraControl.handleResize();
      };

      handleResize();

      let resizeTimer;
      const debouncedResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleResize, 150);
      };
      window.addEventListener('resize', debouncedResize);

      let lastRenderTime = 0;

      const animate = (frameTime) => {
        if (disposed) return;

        const elapsed = frameTime - lastRenderTime;
        if (elapsed < frameInterval) {
          animationId = requestAnimationFrame(animate);
          return;
        }
        lastRenderTime = frameTime - (elapsed % frameInterval);

        if (lastFrameTime === undefined) {
          lastFrameTime = frameTime;
        }
        const delta = Math.min((frameTime - lastFrameTime) / 1000, 0.1);
        lastFrameTime = frameTime;

        observer.update(delta);
        cameraControl.update(delta);

        uniforms.time.value += delta;
        uniforms.fov.value = observer.fov;

        composer.render(delta);

        animationId = requestAnimationFrame(animate);
      };

      animationId = requestAnimationFrame(animate);

      const handleVisibilityChange = () => {
        if (document.hidden) {
          if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
        } else {
          if (!animationId) {
            lastRenderTime = 0;
            lastFrameTime = undefined;
            animationId = requestAnimationFrame(animate);
          }
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      blackholeRef.current = {
        renderer,
        scene,
        composer,
        observer,
        cameraControl,
        textures,
        handleResize: debouncedResize,
        handleVisibilityChange,
        mesh,
      };
      
    };

    return () => {
      disposed = true;
      initRef.current = false;
      
      // 清理延迟初始化
      cancelAnimationFrame(initDelay);

      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      if (blackholeRef.current) {
        const {
          renderer,
          scene,
          composer,
          cameraControl,
          textures,
          handleResize,
          handleVisibilityChange,
        } = blackholeRef.current;

        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        cameraControl.dispose();

        for (const texture of textures.values()) {
          if (texture) texture.dispose();
        }

        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });

        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        composer.dispose();
        renderer.dispose();
      }

      blackholeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality, enableBloom, bloomStrength, autoRotate]);

  return (
    <div
      ref={containerRef}
      className='absolute inset-0 w-full h-full'
      style={{ zIndex: 0 }}
    />
  );
});

export default BlackholeBackground;