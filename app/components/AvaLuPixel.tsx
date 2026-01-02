import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';

// Pixel font for "ava lu" - 5x9 grid
const PIXEL_FONT: Record<string, number[][]> = {
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
  v: [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [1,1,0,1,1],
    [1,1,0,1,1],
    [1,1,0,1,1],
    [0,1,0,1,0],
    [0,1,1,1,0],
    [0,0,1,0,0],
  ],
  l: [
    [1,1,0,0,0],
    [1,1,0,0,0],
    [1,1,0,0,0],
    [1,1,0,0,0],
    [1,1,0,0,0],
    [1,1,0,0,0],
    [1,1,0,0,0],
    [1,1,0,0,0],
    [1,1,1,1,0],
  ],
  u: [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [1,1,0,1,1],
    [1,1,0,1,1],
    [1,1,0,1,1],
    [1,1,0,1,1],
    [1,1,0,1,1],
    [0,1,1,1,0],
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

// Wendy the Frog pixel art - color codes:
// 0 = transparent, 1 = purple (body), 2 = dark purple (outline/shadow)
// 3 = white/cream (belly), 4 = black (eyes/nose), 5 = pink (cheeks), 6 = white (eye whites)
const WENDY_FROG: number[][] = [
  [0,0,0,0,0,2,2,2,2,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,0,0],
  [0,0,0,0,2,6,6,6,6,2,0,0,0,0,0,0,2,6,6,6,6,2,0,0,0,0],
  [0,0,0,2,6,6,6,6,6,6,2,0,0,0,0,2,6,6,6,6,6,6,2,0,0,0],
  [0,0,0,2,6,6,4,4,6,6,2,0,0,0,0,2,6,6,4,4,6,6,2,0,0,0],
  [0,0,0,2,6,6,4,4,6,6,2,2,2,2,2,2,6,6,4,4,6,6,2,0,0,0],
  [0,0,0,0,2,6,6,6,6,2,1,1,1,1,1,1,2,6,6,6,6,2,0,0,0,0],
  [0,0,0,0,0,2,2,2,2,1,1,1,1,1,1,1,1,2,2,2,2,0,0,0,0,0],
  [0,0,0,0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0,0],
  [0,0,0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,0,0,0],
  [0,0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,0,0],
  [0,2,1,1,1,1,1,1,1,1,1,4,4,4,4,1,1,1,1,1,1,1,1,1,2,0],
  [0,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,0],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
  [0,2,1,1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,1,1,2,0],
  [0,2,1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,1,2,0],
  [0,0,2,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,2,0,0],
  [0,0,2,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,2,0,0],
  [0,0,0,2,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,2,0,0,0],
  [0,0,0,0,2,1,1,1,3,3,3,3,3,3,3,3,3,3,1,1,1,2,0,0,0,0],
  [0,0,0,0,0,2,2,1,1,1,1,1,1,1,1,1,1,1,1,2,2,0,0,0,0,0],
  [0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0],
];

// Frog colors - purple like in the photo
const FROG_COLORS: Record<number, { r: number; g: number; b: number }> = {
  1: { r: 0.75, g: 0.60, b: 0.85 }, // Light purple body
  2: { r: 0.55, g: 0.40, b: 0.65 }, // Dark purple outline
  3: { r: 0.97, g: 0.95, b: 0.92 }, // Cream belly
  4: { r: 0.08, g: 0.08, b: 0.08 }, // Black eyes/nose
  5: { r: 1.00, g: 0.60, b: 0.70 }, // Pink (unused now)
  6: { r: 1.00, g: 1.00, b: 1.00 }, // White eye
};

// Pink and purple color palette for text
const PINK_PURPLE_COLORS = [
  { r: 0.15, g: 0.05, b: 0.20 },  // Deep purple (dark)
  { r: 0.55, g: 0.10, b: 0.55 },  // Purple
  { r: 0.80, g: 0.20, b: 0.60 },  // Magenta
  { r: 0.95, g: 0.40, b: 0.70 },  // Pink
  { r: 1.00, g: 0.60, b: 0.85 },  // Light pink (brightest)
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

interface AvaLuPixelProps {
  onComplete?: () => void;
  duration?: number;
}

export function AvaLuPixel({ onComplete, duration = 999999 }: AvaLuPixelProps) {
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
    scene.background = new THREE.Color(0x0a0510); // Dark purple bg

    const aspect = width / height;
    const frustumSize = 50;
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

    const word = 'ava lu';
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
    const textYOffset = 8;

    // Create text pixels
    word.split('').forEach((letter, letterIndex) => {
      const grid = PIXEL_FONT[letter];
      if (!grid) return;

      grid.forEach((row, rowIndex) => {
        row.forEach((pixel, colIndex) => {
          if (pixel === 1) {
            const material = new THREE.MeshBasicMaterial({
              color: 0xff69b4,
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

    // Create frog pixels
    const frogPixelSize = 0.55;
    const frogGap = 0.08;
    const frogEffectiveSize = frogPixelSize + frogGap;
    const frogGeometry = new THREE.PlaneGeometry(frogPixelSize, frogPixelSize);

    const frogWidth = WENDY_FROG[0].length * frogEffectiveSize;
    const frogHeight = WENDY_FROG.length * frogEffectiveSize;
    const frogStartX = -frogWidth / 2;
    const frogStartY = -frogHeight / 2 - 2; // Position below text

    WENDY_FROG.forEach((row, rowIndex) => {
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
          const y = frogStartY + (WENDY_FROG.length - rowIndex) * frogEffectiveSize;

          mesh.position.set(x, y, 0);
          scene.add(mesh);

          pixels.push({
            mesh,
            letterIndex: 10 + Math.floor(colIndex / 5), // Stagger reveal across frog
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
          // Pink/purple wave animation for text
          const wave = Math.sin(time * 1.5 + pixel.phase + pixel.letterIndex * 0.4);
          const normalized = (wave + 1) / 2;
          const biased = Math.pow(normalized, 0.6);
          const levelIndex = Math.floor(biased * 4) + 1;
          const clampedLevel = Math.min(4, Math.max(1, levelIndex));
          const color = PINK_PURPLE_COLORS[clampedLevel];
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
      style={{ touchAction: 'none', backgroundColor: '#0a0510' }}
    />
  );
}
