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

    const init = async () => {
      // Create renderer
      const renderer = createRenderer(container);
      container.appendChild(renderer.domElement);

      // Create scene and post-processing
      const { scene, composer } = createScene(renderer, {
        enableBloom,
        bloomStrength,
      });

      // Create camera
      const { observer, cameraControl } = createCamera(
        container,
        renderer.domElement,
      );
      scene.add(observer);

      // Set up uniforms
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

      // Load textures
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

      // Create shader plane
      const { mesh } = await createShaderProjectionPlane(uniforms, quality);

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

      // Set camera properties
      observer.distance = 10.0;
      observer.moving = autoRotate;
      observer.fov = 60.0;
      uniforms.fov.value = observer.fov;

      const handleResize = () => {
        const { width, height } = getContainerSize(container);
        const pixelRatio = getRenderPixelRatio();
        renderer.setPixelRatio(pixelRatio);
        composer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height);
        composer.setSize(width, height);
        uniforms.resolution.value.set(width, height);
        observer.aspect = width / height;
        observer.updateProjectionMatrix();
        cameraControl.handleResize();
      };

      handleResize();

      // Animation loop with adaptive frame rate limiting
      const targetFPS = isMobile ? 24 : 30;
      const frameInterval = 1000 / targetFPS;
      let lastRenderTime = 0;
      let skipFrames = 0;

      const animate = (frameTime) => {
        if (disposed) {
          return;
        }

        // Frame rate limiting with adaptive skipping
        const elapsed = frameTime - lastRenderTime;
        if (elapsed < frameInterval) {
          animationId = requestAnimationFrame(animate);
          return;
        }
        
        // Skip every other frame when tab is not focused
        if (!document.hasFocus()) {
          skipFrames++;
          if (skipFrames % 2 !== 0) {
            animationId = requestAnimationFrame(animate);
            return;
          }
        }
        
        lastRenderTime = frameTime - (elapsed % frameInterval);

        if (lastFrameTime === undefined) {
          lastFrameTime = frameTime;
        }

        const delta = Math.min((frameTime - lastFrameTime) / 1000, 0.1);
        lastFrameTime = frameTime;

        // Update camera
        observer.update(delta);
        cameraControl.update(delta);

        // Update uniforms
        uniforms.time.value += delta;
        uniforms.fov.value = observer.fov;

        // Render
        composer.render(delta);

        animationId = requestAnimationFrame(animate);
      };

      window.addEventListener('resize', handleResize);
      animationId = requestAnimationFrame(animate);

      // Visibility change handler - pause when tab is hidden
      const handleVisibilityChange = () => {
        if (document.hidden) {
          if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
        } else {
          if (!animationId) {
            lastRenderTime = 0;
            animationId = requestAnimationFrame(animate);
          }
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Store refs for cleanup
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

    // Cleanup
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
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange,
        );
        cameraControl.dispose();

        // Dispose textures
        for (const texture of textures.values()) {
          if (texture) texture.dispose();
        }

        // Dispose scene
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

        // Dispose renderer
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        composer.dispose();
        renderer.dispose();
      }

      blackholeRef.current = null;
    };
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
