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
} from './blackhole/render';

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
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const effectiveQuality = prefersReducedMotion ? 'low' : (isMobile ? 'low' : quality);
    const effectiveBloom = prefersReducedMotion ? false : (isMobile ? false : enableBloom);
    const targetFPS = isMobile ? 24 : 30;
    const frameInterval = 1000 / targetFPS;

    const init = async () => {
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
      observer.moving = prefersReducedMotion ? false : autoRotate;
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
      window.addEventListener('resize', handleResize);

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
        handleResize,
        handleVisibilityChange,
        mesh,
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
};

export default BlackholeBackground;