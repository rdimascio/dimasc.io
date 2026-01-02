import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';

// Monospace CLI-style font - 5x9 grid, inspired by terminal fonts like Monaco/Consolas
const PIXEL_FONT: Record<string, number[][]> = {
  d: [
    [1,1,0,0,0],
    [1,1,0,0,0],
    [1,1,0,0,0],
    [1,1,1,1,0],
    [1,1,0,1,1],
    [1,1,0,0,1],
    [1,1,0,0,1],
    [1,1,0,1,1],
    [1,1,1,1,0],
  ],
  i: [
    [0,1,1,0,0],
    [0,1,1,0,0],
    [0,0,0,0,0],
    [1,1,1,0,0],
    [0,1,1,0,0],
    [0,1,1,0,0],
    [0,1,1,0,0],
    [0,1,1,0,0],
    [1,1,1,1,0],
  ],
  m: [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [1,0,1,0,1],
    [1,1,1,1,1],
    [1,0,1,0,1],
    [1,0,1,0,1],
    [1,0,1,0,1],
    [1,0,1,0,1],
  ],
  a: [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,1,1,1,0],
    [0,0,0,1,1],
    [0,1,1,1,1],
    [1,1,0,1,1],
    [1,1,0,1,1],
    [0,1,1,1,1],
  ],
  s: [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,1,1,1,1],
    [1,1,0,0,0],
    [0,1,1,1,0],
    [0,0,0,1,1],
    [0,0,0,1,1],
    [1,1,1,1,0],
  ],
  c: [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,1,1,1,1],
    [1,1,0,0,0],
    [1,1,0,0,0],
    [1,1,0,0,0],
    [1,1,0,0,0],
    [0,1,1,1,1],
  ],
  o: [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,1,1,1,0],
    [1,1,0,1,1],
    [1,1,0,1,1],
    [1,1,0,1,1],
    [1,1,0,1,1],
    [0,1,1,1,0],
  ],
};

// Exact GitHub contribution colors
const GITHUB_COLORS = [
  { r: 0.02, g: 0.11, b: 0.04 },  // #161b22 - empty/level 0 (very dark)
  { r: 0.05, g: 0.27, b: 0.16 },  // #0e4429 - level 1
  { r: 0.00, g: 0.43, b: 0.20 },  // #006d32 - level 2
  { r: 0.15, g: 0.65, b: 0.25 },  // #26a641 - level 3
  { r: 0.22, g: 0.83, b: 0.33 },  // #39d353 - level 4 (brightest)
];

interface PixelData {
  mesh: THREE.Mesh;
  letterIndex: number;
  row: number;
  col: number;
  phase: number;
  revealed: boolean;
  currentOpacity: number;
}

interface PixelSplashProps {
  onComplete?: () => void;
  duration?: number;
}

export function PixelSplash({ onComplete, duration = 4500 }: PixelSplashProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    renderer: THREE.WebGLRenderer;
    pixels: PixelData[];
    startTime: number;
    completed: boolean;
    animationId: number;
  } | null>(null);

  const initScene = useCallback(() => {
    if (!containerRef.current || sceneRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117); // GitHub dark bg

    const aspect = width / height;
    const frustumSize = 40;
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const word = 'dimascio';
    const pixels: PixelData[] = [];

    const pixelSize = 0.65;
    const gap = 0.12;
    const effectiveSize = pixelSize + gap;

    // Monospace: all letters same width (5 columns)
    const letterWidth = 5 * effectiveSize;
    const letterSpacing = effectiveSize * 0.8; // Tighter spacing for monospace feel
    const totalWidth = word.length * letterWidth + (word.length - 1) * letterSpacing;
    let currentX = -totalWidth / 2;

    const geometry = new THREE.PlaneGeometry(pixelSize, pixelSize);

    word.split('').forEach((letter, letterIndex) => {
      const grid = PIXEL_FONT[letter];
      if (!grid) return;

      grid.forEach((row, rowIndex) => {
        row.forEach((pixel, colIndex) => {
          if (pixel === 1) {
            const material = new THREE.MeshBasicMaterial({
              color: 0x39d353,
              transparent: true,
              opacity: 0,
            });

            const mesh = new THREE.Mesh(geometry, material);

            const x = currentX + colIndex * effectiveSize;
            const y = (grid.length / 2 - rowIndex) * effectiveSize;

            mesh.position.set(x, y, 0);
            scene.add(mesh);

            pixels.push({
              mesh,
              letterIndex,
              row: rowIndex,
              col: colIndex,
              phase: Math.random() * Math.PI * 2,
              revealed: false,
              currentOpacity: 0,
            });
          }
        });
      });

      currentX += letterWidth + letterSpacing;
    });

    sceneRef.current = {
      scene,
      camera,
      renderer,
      pixels,
      startTime: performance.now(),
      completed: false,
      animationId: 0,
    };

    const animate = () => {
      if (!sceneRef.current) return;

      const { scene, camera, renderer, pixels, startTime, completed } = sceneRef.current;
      const elapsed = performance.now() - startTime;
      const time = elapsed * 0.001;

      const revealStartDelay = 400;
      const letterRevealDuration = 500;
      const letterStaggerDelay = 100;
      const fadeOutStart = duration - 1000;

      pixels.forEach((pixel) => {
        const letterStartTime = revealStartDelay + pixel.letterIndex * letterStaggerDelay;

        if (elapsed > letterStartTime && !pixel.revealed) {
          pixel.revealed = true;
        }

        let targetOpacity = 0;
        if (pixel.revealed) {
          const revealProgress = Math.min(1, (elapsed - letterStartTime) / letterRevealDuration);
          targetOpacity = 1 - Math.pow(1 - revealProgress, 3);

          if (elapsed > fadeOutStart) {
            const fadeProgress = (elapsed - fadeOutStart) / 1000;
            targetOpacity *= (1 - Math.pow(fadeProgress, 2));
          }
        }

        pixel.currentOpacity += (targetOpacity - pixel.currentOpacity) * 0.1;

        // GitHub-style discrete color levels with smooth wave
        const wave = Math.sin(time * 1.2 + pixel.phase + pixel.letterIndex * 0.3);

        // Map wave to discrete GitHub levels (1-4, not 0 which is empty)
        const normalized = (wave + 1) / 2; // 0 to 1
        const biased = Math.pow(normalized, 0.7); // Bias toward brighter
        const levelIndex = Math.floor(biased * 4) + 1; // 1-4
        const clampedLevel = Math.min(4, Math.max(1, levelIndex));

        const color = GITHUB_COLORS[clampedLevel];

        const material = pixel.mesh.material as THREE.MeshBasicMaterial;
        material.opacity = pixel.currentOpacity;
        material.color.setRGB(color.r, color.g, color.b);
      });

      renderer.render(scene, camera);

      if (elapsed > fadeOutStart - 100 && !fadeOut) {
        setFadeOut(true);
      }

      if (!completed && elapsed > duration) {
        sceneRef.current.completed = true;
        onComplete?.();
        return;
      }

      sceneRef.current.animationId = requestAnimationFrame(animate);
    };

    sceneRef.current.animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!sceneRef.current || !containerRef.current) return;

      const { camera, renderer } = sceneRef.current;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      const newAspect = w / h;

      camera.left = (frustumSize * newAspect) / -2;
      camera.right = (frustumSize * newAspect) / 2;
      camera.top = frustumSize / 2;
      camera.bottom = frustumSize / -2;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current?.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
      geometry.dispose();
      pixels.forEach(p => {
        (p.mesh.material as THREE.MeshBasicMaterial).dispose();
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sceneRef.current = null;
    };
  }, [duration, onComplete, fadeOut]);

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 w-full h-full z-50 transition-opacity duration-1000 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ touchAction: 'none', backgroundColor: '#0d1117' }}
    />
  );
}
