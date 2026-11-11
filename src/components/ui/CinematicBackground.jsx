import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Cinematic 3D Studio Background
 * 
 * Features:
 * - High-end 3D creative studio environment with dark charcoal aesthetic & warm orange/amber rim lighting.
 * - Floating faceted titanium icosahedron, glowing concentric neon orange rings, glass crystal octahedron, and chrome knot.
 * - Atmospheric floating amber dust motes / light particles.
 * - Smooth lerped mouse parallax with subtle, slow cinematic float animations.
 * - Ultra-optimized GPU footprint: pixel ratio capped to 1.5, tone mapping, and automatic IntersectionObserver pause on scroll.
 * - Strict accessibility: respects prefers-reduced-motion (renders a single static frame).
 * - Fully non-interactive (pointer-events-none, aria-hidden) to never interfere with text, links, or video playback.
 */
export default function CinematicBackground() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Check reduced-motion accessibility preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Viewport dimensions
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene & Depth Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07070a, 0.045);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);

    // 3. WebGL Renderer with Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // 4. Studio Cinematic Lighting
    // Base dark ambient tone
    const ambientLight = new THREE.AmbientLight(0x0e1017, 1.8);
    scene.add(ambientLight);

    // Warm Orange Key Light (Upper Right)
    const keyLight = new THREE.PointLight(0xff6b00, 4.2, 35);
    keyLight.position.set(7, 5, 6);
    scene.add(keyLight);

    // Amber Rim Light (Lower Left)
    const rimLight = new THREE.PointLight(0xffa040, 2.8, 30);
    rimLight.position.set(-8, -4, 4);
    scene.add(rimLight);

    // Cool studio fill light (Back Top Left for cinematic contrast)
    const fillLight = new THREE.DirectionalLight(0x1e293b, 1.2);
    fillLight.position.set(-5, 8, -5);
    scene.add(fillLight);

    // 5. 3D Elements Group
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);

    // Object A: Polished Metallic Titanium Icosahedron with Orange Wireframe Accents (Top Right)
    const icoGeo = new THREE.IcosahedronGeometry(1.9, 0);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0x14141d,
      metalness: 0.95,
      roughness: 0.18,
      flatShading: true,
    });
    const icosahedron = new THREE.Mesh(icoGeo, icoMat);
    icosahedron.position.set(5.8, 2.2, -1.2);
    objectsGroup.add(icosahedron);

    const icoWireGeo = new THREE.WireframeGeometry(icoGeo);
    const icoWireMat = new THREE.LineBasicMaterial({
      color: 0xff8c00,
      transparent: true,
      opacity: 0.3,
    });
    const icoWire = new THREE.LineSegments(icoWireGeo, icoWireMat);
    icosahedron.add(icoWire);

    // Object B: Concentric Neon Orange Studio Gyro Rings (Mid-Left)
    const ringGroup = new THREE.Group();
    ringGroup.position.set(-5.6, -1.6, -2);
    objectsGroup.add(ringGroup);

    const outerRingGeo = new THREE.TorusGeometry(2.4, 0.045, 16, 64);
    const outerRingMat = new THREE.MeshStandardMaterial({
      color: 0xff6b00,
      emissive: 0xff6b00,
      emissiveIntensity: 0.9,
      roughness: 0.25,
      metalness: 0.8,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    ringGroup.add(outerRing);

    const innerRingGeo = new THREE.TorusGeometry(1.75, 0.035, 16, 64);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0xffa040,
      emissive: 0xff8800,
      emissiveIntensity: 0.7,
      roughness: 0.3,
      metalness: 0.85,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 3.5;
    ringGroup.add(innerRing);

    // Object C: Translucent Obsidian/Glass Octahedron (Upper Left)
    const octaGeo = new THREE.OctahedronGeometry(1.4, 0);
    const octaMat = new THREE.MeshPhysicalMaterial({
      color: 0x141622,
      metalness: 0.35,
      roughness: 0.12,
      transmission: 0.65,
      thickness: 1.2,
      flatShading: true,
      reflectivity: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const octahedron = new THREE.Mesh(octaGeo, octaMat);
    octahedron.position.set(-4.8, 3.4, -2.5);
    objectsGroup.add(octahedron);

    const octaWireGeo = new THREE.WireframeGeometry(octaGeo);
    const octaWireMat = new THREE.LineBasicMaterial({
      color: 0xffa040,
      transparent: true,
      opacity: 0.35,
    });
    const octaWire = new THREE.LineSegments(octaWireGeo, octaWireMat);
    octahedron.add(octaWire);

    // Object D: Floating Chrome Torus Knot (Bottom Right)
    const knotGeo = new THREE.TorusKnotGeometry(1.0, 0.22, 64, 16, 2, 3);
    const knotMat = new THREE.MeshStandardMaterial({
      color: 0x1b1c26,
      metalness: 0.94,
      roughness: 0.2,
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    knot.position.set(6.4, -3.2, -3.2);
    objectsGroup.add(knot);

    // 6. Atmospheric Floating Amber Particles (Dust Motes in Studio Light)
    const isMobile = width < 768;
    const particleCount = isMobile ? 65 : 125;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 26;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 18;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 12;

      particleSpeeds[i3] = (Math.random() - 0.5) * 0.003;
      particleSpeeds[i3 + 1] = Math.random() * 0.006 + 0.002; // slow gentle rise
      particleSpeeds[i3 + 2] = (Math.random() - 0.5) * 0.003;
    }

    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // High performance soft circular gradient texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 180, 80, 1)');
    grad.addColorStop(0.35, 'rgba(255, 120, 30, 0.6)');
    grad.addColorStop(1, 'rgba(255, 107, 0, 0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 32, 32);
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    const particlesMat = new THREE.PointsMaterial({
      size: isMobile ? 0.22 : 0.28,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.75,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // 7. Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      targetX = normX * 0.6;
      targetY = normY * 0.45;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 8. Dynamic Responsive Resize
    const handleResize = () => {
      if (!container || !canvas) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 9. IntersectionObserver: Pause rendering when scrolled out of view for 0% overhead
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // 10. Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return; // Completely idle when out of view

      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerping
      mouseX += (targetX - mouseX) * 0.035;
      mouseY += (targetY - mouseY) * 0.035;

      camera.position.x = mouseX * 1.4;
      camera.position.y = mouseY * 0.9;
      camera.lookAt(0, 0, 0);

      if (!prefersReducedMotion) {
        // Slow majestic rotations and floating bobbing
        icosahedron.rotation.x = elapsedTime * 0.12;
        icosahedron.rotation.y = elapsedTime * 0.15;
        icosahedron.position.y = 2.2 + Math.sin(elapsedTime * 0.6) * 0.22;

        ringGroup.rotation.z = elapsedTime * 0.07;
        outerRing.rotation.y = elapsedTime * 0.16;
        innerRing.rotation.x = elapsedTime * 0.2;
        ringGroup.position.y = -1.6 + Math.cos(elapsedTime * 0.5) * 0.18;

        octahedron.rotation.x = -elapsedTime * 0.09;
        octahedron.rotation.y = elapsedTime * 0.12;
        octahedron.position.y = 3.4 + Math.sin(elapsedTime * 0.7 + 1) * 0.2;

        knot.rotation.x = elapsedTime * 0.13;
        knot.rotation.y = -elapsedTime * 0.15;
        knot.position.y = -3.2 + Math.sin(elapsedTime * 0.5 + 2) * 0.18;

        // Dust motes drift
        const positions = particlesGeo.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          positions[i3] += particleSpeeds[i3];
          positions[i3 + 1] += particleSpeeds[i3 + 1];
          positions[i3 + 2] += particleSpeeds[i3 + 2];

          // Wrap vertically
          if (positions[i3 + 1] > 9) {
            positions[i3 + 1] = -9;
            positions[i3] = (Math.random() - 0.5) * 26;
          }
        }
        particlesGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    if (prefersReducedMotion) {
      renderer.render(scene, camera);
    } else {
      animate();
    }

    // 11. Resource Disposal Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();

      icoGeo.dispose();
      icoMat.dispose();
      icoWireGeo.dispose();
      icoWireMat.dispose();
      outerRingGeo.dispose();
      outerRingMat.dispose();
      innerRingGeo.dispose();
      innerRingMat.dispose();
      octaGeo.dispose();
      octaMat.dispose();
      octaWireGeo.dispose();
      octaWireMat.dispose();
      knotGeo.dispose();
      knotMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Cinematic Studio Warm Vignette & Edge Shadows */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-studio-orange/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-studio-amber/8 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-radial-vignette [background:radial-gradient(circle_at_center,transparent_40%,#07070a_95%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(7,7,10,0.4)_70%,#07070a_100%)] pointer-events-none" />
    </div>
  );
}
