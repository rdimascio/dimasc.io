import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';

// Pixel font for "rhys" - 5x9 grid
const PIXEL_FONT: Record<string, number[][]> = {
  r: [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [1,1,0,1,1],
    [1,1,1,0,0],
    [1,1,0,0,0],
    [1,1,0,0,0],
    [1,1,0,0,0],
    [1,1,0,0,0],
  ],
  h: [
    [1,1,0,0,0],
    [1,1,0,0,0],
    [1,1,0,0,0],
    [1,1,1,1,0],
    [1,1,0,1,1],
    [1,1,0,1,1],
    [1,1,0,1,1],
    [1,1,0,1,1],
    [1,1,0,1,1],
  ],
  y: [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [1,1,0,1,1],
    [1,1,0,1,1],
    [1,1,0,1,1],
    [0,1,1,1,1],
    [0,0,0,1,1],
    [1,1,1,1,0],
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
  ' ': [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
  ],
};

// Ludwig the Frog pixel art - bigger teal frog with prominent smile
// 0 = transparent, 1 = teal (body), 2 = dark teal (outline/shadow)
// 3 = light teal/mint (belly), 4 = black (eyes/nose), 5 = pink (cheeks), 6 = white (eye whites)
const LUDWIG_FROG: number[][] = [
  [0,0,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,2,6,6,6,6,6,2,0,0,0,0,0,0,0,0,0,2,6,6,6,6,6,2,0,0,0,0,0,0],
  [0,0,0,0,0,2,6,6,6,6,6,6,6,2,0,0,0,0,0,0,0,2,6,6,6,6,6,6,6,2,0,0,0,0,0],
  [0,0,0,0,0,2,6,6,6,4,4,6,6,2,0,0,0,0,0,0,0,2,6,6,4,4,6,6,6,2,0,0,0,0,0],
  [0,0,0,0,0,2,6,6,6,4,4,6,6,2,2,2,2,2,2,2,2,2,6,6,4,4,6,6,6,2,0,0,0,0,0],
  [0,0,0,0,0,0,2,6,6,6,6,6,2,1,1,1,1,1,1,1,1,1,2,6,6,6,6,6,2,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0],
  [0,0,0,0,0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0],
  [0,0,0,0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0],
  [0,0,0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0],
  [0,0,2,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,2,0,0],
  [0,0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,0,0],
  [0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
  [0,2,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,2,0],
  [0,2,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,2,0],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,1,1,1,2],
  [0,2,1,1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,1,1,2,0],
  [0,2,1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,1,2,0],
  [0,0,2,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,2,0,0],
  [0,0,2,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,2,0,0],
  [0,0,0,2,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,2,0,0,0],
  [0,0,0,0,2,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,2,0,0,0,0],
  [0,0,0,0,0,2,1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,1,2,0,0,0,0,0],
  [0,0,0,0,0,0,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0],
];

// Frog colors - teal like Ludwig
const FROG_COLORS: Record<number, { r: number; g: number; b: number }> = {
  1: { r: 0.20, g: 0.65, b: 0.65 }, // Teal body
  2: { r: 0.10, g: 0.45, b: 0.50 }, // Dark teal outline
  3: { r: 0.55, g: 0.85, b: 0.75 }, // Light mint belly
  4: { r: 0.05, g: 0.05, b: 0.05 }, // Black eyes/nose
  5: { r: 0.85, g: 0.65, b: 0.70 }, // Pink cheeks
  6: { r: 1.00, g: 1.00, b: 1.00 }, // White eye
};

// Blue and cyan color palette for text
const BLUE_CYAN_COLORS = [
  { r: 0.05, g: 0.15, b: 0.25 },  // Deep blue (dark)
  { r: 0.10, g: 0.35, b: 0.50 },  // Dark cyan
  { r: 0.15, g: 0.55, b: 0.65 },  // Teal
  { r: 0.25, g: 0.75, b: 0.80 },  // Cyan
  { r: 0.45, g: 0.90, b: 0.90 },  // Light cyan (brightest)
];

interface PixelData {
  mesh: THREE.Mesh;
  letterIndex: number;
  row: number;
  col: number;
  phase: number;
  revealed: boolean;
  currentOpacity: number;
  isText: boolean;
  baseColor?: { r: number; g: number; b: number };
}

interface RhysPixelProps {
  onComplete?: () => void;
  duration?: number;
}

export function RhysPixel({ onComplete, duration = 999999 }: RhysPixelProps) {
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
    scene.background = new THREE.Color(0x051520); // Dark teal bg

    const aspect = width / height;
    const frustumSize = 55;
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

    const word = 'rhys';
    const pixels: PixelData[] = [];

    const pixelSize = 0.65;
    const gap = 0.12;
    const effectiveSize = pixelSize + gap;

    const letterWidth = 5 * effectiveSize;
    const letterSpacing = effectiveSize * 0.8;
    const totalWidth = word.length * letterWidth + (word.length - 1) * letterSpacing;
    let currentX = -totalWidth / 2;

    const geometry = new THREE.PlaneGeometry(pixelSize, pixelSize);

    // Text vertical offset (move up to make room for frog)
    const textYOffset = 12;

    // Create text pixels
    word.split('').forEach((letter, letterIndex) => {
      const grid = PIXEL_FONT[letter];
      if (!grid) return;

      grid.forEach((row, rowIndex) => {
        row.forEach((pixel, colIndex) => {
          if (pixel === 1) {
            const material = new THREE.MeshBasicMaterial({
              color: 0x00cccc,
              transparent: true,
              opacity: 0,
            });

            const mesh = new THREE.Mesh(geometry, material);

            const x = currentX + colIndex * effectiveSize;
            const y = (grid.length / 2 - rowIndex) * effectiveSize + textYOffset;

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
              isText: true,
            });
          }
        });
      });

      currentX += letterWidth + letterSpacing;
    });

    // Create frog pixels - bigger!
    const frogPixelSize = 0.55;
    const frogGap = 0.08;
    const frogEffectiveSize = frogPixelSize + frogGap;
    const frogGeometry = new THREE.PlaneGeometry(frogPixelSize, frogPixelSize);

    const frogWidth = LUDWIG_FROG[0].length * frogEffectiveSize;
    const frogHeight = LUDWIG_FROG.length * frogEffectiveSize;
    const frogStartX = -frogWidth / 2;
    const frogStartY = -frogHeight / 2 - 3; // Position below text

    LUDWIG_FROG.forEach((row, rowIndex) => {
      row.forEach((colorCode, colIndex) => {
        if (colorCode !== 0) {
          const baseColor = FROG_COLORS[colorCode];
          const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(baseColor.r, baseColor.g, baseColor.b),
            transparent: true,
            opacity: 0,
          });

          const mesh = new THREE.Mesh(frogGeometry, material);

          const x = frogStartX + colIndex * frogEffectiveSize;
          const y = frogStartY + (LUDWIG_FROG.length - rowIndex) * frogEffectiveSize;

          mesh.position.set(x, y, 0);
          scene.add(mesh);

          pixels.push({
            mesh,
            letterIndex: 8 + Math.floor(colIndex / 6), // Stagger reveal across frog
            row: rowIndex,
            col: colIndex,
            phase: Math.random() * Math.PI * 2,
            revealed: false,
            currentOpacity: 0,
            isText: false,
            baseColor,
          });
        }
      });
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

        const material = pixel.mesh.material as THREE.MeshBasicMaterial;
        material.opacity = pixel.currentOpacity;

        if (pixel.isText) {
          // Blue/cyan wave animation for text
          const wave = Math.sin(time * 1.5 + pixel.phase + pixel.letterIndex * 0.4);
          const normalized = (wave + 1) / 2;
          const biased = Math.pow(normalized, 0.6);
          const levelIndex = Math.floor(biased * 4) + 1;
          const clampedLevel = Math.min(4, Math.max(1, levelIndex));
          const color = BLUE_CYAN_COLORS[clampedLevel];
          material.color.setRGB(color.r, color.g, color.b);
        } else if (pixel.baseColor) {
          // Subtle brightness wave for frog
          const wave = Math.sin(time * 0.8 + pixel.phase) * 0.1 + 1;
          material.color.setRGB(
            Math.min(1, pixel.baseColor.r * wave),
            Math.min(1, pixel.baseColor.g * wave),
            Math.min(1, pixel.baseColor.b * wave)
          );
        }
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
      frogGeometry.dispose();
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
      style={{ touchAction: 'none', backgroundColor: '#051520' }}
    />
  );
}
