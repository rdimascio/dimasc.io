import type { CSSProperties, ReactElement } from "react";

const GLYPH_ROWS = 7;
const LETTER_GAP = 1;
const PIXEL_INSET = 0.07;
const PIXEL_SIZE = 1 - PIXEL_INSET * 2;

const GLYPHS: Readonly<Record<string, readonly string[]>> = {
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  i: ["#", ".", "#", "#", "#", "#", "#"],
  M: ["#.....#", "##...##", "#.#.#.#", "#..#..#", "#.....#", "#.....#", "#.....#"],
  a: [".....", ".....", ".###.", "....#", ".####", "#...#", ".####"],
  s: [".....", ".....", ".####", "#....", ".###.", "....#", "####."],
  c: [".....", ".....", ".###.", "#...#", "#....", "#...#", ".###."],
  o: [".....", ".....", ".###.", "#...#", "#...#", "#...#", ".###."],
  ".": ["..", "..", "..", "..", "..", "##", "##"],
};

const ACCENT_GLYPHS = new Set(["."]);

interface Pixel {
  readonly x: number;
  readonly y: number;
  readonly accent: boolean;
}

function glyphFor(char: string): readonly string[] {
  const glyph = GLYPHS[char];
  if (glyph === undefined || glyph.length !== GLYPH_ROWS) throw new Error(`no ${GLYPH_ROWS}-row pixel glyph for "${char}"`);
  return glyph;
}

function layout(word: string): { pixels: Pixel[]; columns: number } {
  const pixels: Pixel[] = [];
  let cursor = 0;
  [...word].forEach((char, index) => {
    const glyph = glyphFor(char);
    const width = glyph[0]?.length ?? 0;
    glyph.forEach((row, y) => {
      [...row].forEach((cell, x) => {
        if (cell === "#") pixels.push({ x: cursor + x, y, accent: ACCENT_GLYPHS.has(char) });
      });
    });
    cursor += width + (index < word.length - 1 ? LETTER_GAP : 0);
  });
  return { pixels, columns: cursor };
}

function scatter(x: number, y: number): number {
  const seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return Math.round((seed - Math.floor(seed)) * 1000) / 1000;
}

export function PixelWordmark({ word, label }: { word: string; label: string }): ReactElement {
  const { pixels, columns } = layout(word);
  return (
    <svg
      aria-label={label}
      className="pixel-wordmark block w-full h-auto"
      role="img"
      viewBox={`0 0 ${columns} ${GLYPH_ROWS}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{label}</title>
      <defs>
        <pattern height="1" id="pixel-grid" patternUnits="userSpaceOnUse" width="1">
          <rect className="pixel-off" height={PIXEL_SIZE} width={PIXEL_SIZE} x={PIXEL_INSET} y={PIXEL_INSET} />
        </pattern>
      </defs>
      <rect fill="url(#pixel-grid)" height={GLYPH_ROWS} width={columns} />
      {pixels.map((pixel) => (
        <rect
          className={pixel.accent ? "pixel pixel-accent" : "pixel"}
          height={PIXEL_SIZE}
          key={`${pixel.x}-${pixel.y}`}
          style={{ "--d": scatter(pixel.x, pixel.y), "--x": Math.round((pixel.x / columns) * 1000) / 1000, "--y": pixel.y } as CSSProperties}
          width={PIXEL_SIZE}
          x={pixel.x + PIXEL_INSET}
          y={pixel.y + PIXEL_INSET}
        />
      ))}
    </svg>
  );
}
