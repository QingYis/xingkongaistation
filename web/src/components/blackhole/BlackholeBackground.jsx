import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  createRenderer,
  createScene,
  createCamera,
  loadTextures,
  createShaderProjectionPlane,
  getContainerSize,
  getRenderPixelRatio,
  ResolutionScaler,
} from './blackhole/render';

const ACTIVE_FPS = 28;
const IDLE_FPS = 10;
const IDLE_TIMEOUT_MS = 3000;

const BlackholeBackground = ({
  quality = 'medium',
  enableBloom = true,
  bloomStrength = 0.8,
  autoRotate = true,
}) => {
  const containerRef = useRef(null);
  const blackholeRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let animationId;
    let disposed = false;
    let lastFrameTime;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
    const effectiveQuality = isMobile ? 'low' : quality;
    const effectiveBloom = isMobile ? false : enableBloom;

    const init = async () => {
      const renderer = createRenderer(container);

      const { scene, composer, bloomPass } = createScene(renderer, {
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

      const scaler = new ResolutionScaler(renderer, composer);
      const { width: initW, height: initH } = getContainerSize(container);
      const initSize = scaler.setSize(initW, initH);
      uniforms.resolution.value.set(
        renderer.domElement.width || initSize.width,
        renderer.domElement.height || initSize.height,
      );
      observer.aspect = initW / initH;
      observer.updateProjectionMatrix();
      cameraControl.handleResize();

      let idleTimer = null;
      let isIdle = false;
      let idleFrameInterval = 1000 / IDLE_FPS;
      let activeFrameInterval = 1000 / ACTIVE_FPS;
      let frameInterval = activeFrameInterval;
      let lastRenderTime = 0;

      const markActive = () => {
        isIdle = false;
        frameInterval = activeFrameInterval;
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          isIdle = true;
          frameInterval = idleFrameInterval;
        }, IDLE_TIMEOUT_MS);
      };

      const interactionHandler = () => markActive();
      container.addEventListener('pointerdown', interactionHandler);
      container.addEventListener('pointermove', interactionHandler);

      markActive();

      const handleResize = () => {
        const { width, height } = getContainerSize(container);
        const size = scaler.setSize(width, height);
        const pixelRatio = getRenderPixelRatio();
        renderer.setPixelRatio(pixelRatio);
        composer.setPixelRatio(pixelRatio);
        uniforms.resolution.value.set(
          renderer.domElement.width || size.width,
          renderer.domElement.height || size.height,
        );
        observer.aspect = width / height;
        observer.updateProjectionMatrix();
        cameraControl.handleResize();
      };

      let resizeTimer;
      const debouncedResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleResize, 150);
      };
      window.addEventListener('resize', debouncedResize);

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

        if (!isIdle) {
          const frameDuration = performance.now() - (lastRenderTime || performance.now());
          scaler.reportFrame(Math.max(1, frameDuration));
        }

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
        bloomPass,
        observer,
        cameraControl,
        textures,
        scaler,
        handleResize: debouncedResize,
        handleVisibilityChange,
        mesh,
        cleanupInteraction: () => {
          container.removeEventListener('pointerdown', interactionHandler);
          container.removeEventListener('pointermove', interactionHandler);
          clearTimeout(idleTimer);
        },
      };
    };

    init();

    return () => {
      disposed = true;

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
          scaler,
          mesh,
        } = blackholeRef.current;

        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', handleVisibilityChange);

        if (blackholeRef.current.cleanupInteraction) {
          blackholeRef.current.cleanupInteraction();
        }
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
};

export default BlackholeBackground;