export type Grid = string[][];

export type Placement = {
  word: string;
  path: { row: number; col: number }[];
};

const DIRECTIONS = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
  { dx: 1, dy: 1 },
  { dx: -1, dy: -1 },
  { dx: 1, dy: -1 },
  { dx: -1, dy: 1 },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const mulberry32 = (seed: number) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const toSeed = (seedText: string) => {
  let seed = 2166136261;
  for (let i = 0; i < seedText.length; i += 1) {
    seed ^= seedText.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }
  return seed >>> 0;
};

const inBounds = (row: number, col: number, size: number) =>
  row >= 0 && col >= 0 && row < size && col < size;

const canPlace = (grid: Grid, word: string, row: number, col: number, dx: number, dy: number) => {
  for (let i = 0; i < word.length; i += 1) {
    const r = row + dy * i;
    const c = col + dx * i;
    if (!inBounds(r, c, grid.length)) return false;
    const existing = grid[r][c];
    if (existing !== '' && existing !== word[i]) return false;
  }
  return true;
};

const placeWord = (
  grid: Grid,
  word: string,
  rng: () => number,
): Placement | null => {
  const size = grid.length;
  const attempts = 400;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const dir = DIRECTIONS[Math.floor(rng() * DIRECTIONS.length)];
    const row = Math.floor(rng() * size);
    const col = Math.floor(rng() * size);
    if (!canPlace(grid, word, row, col, dir.dx, dir.dy)) continue;
    const path: { row: number; col: number }[] = [];
    for (let i = 0; i < word.length; i += 1) {
      const r = row + dir.dy * i;
      const c = col + dir.dx * i;
      grid[r][c] = word[i];
      path.push({ row: r, col: c });
    }
    return { word, path };
  }
  return null;
};

export const generateWordSearch = (words: string[], size: number, seedText: string) => {
  const seed = toSeed(seedText);
  const rng = mulberry32(seed);
  const grid: Grid = Array.from({ length: size }, () => Array.from({ length: size }, () => ''));
  const placements: Placement[] = [];
  const ordered = [...words].sort((a, b) => b.length - a.length);
  ordered.forEach((word) => {
    const placement = placeWord(grid, word, rng);
    if (placement) placements.push(placement);
  });
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!grid[row][col]) {
        const index = Math.floor(rng() * ALPHABET.length);
        grid[row][col] = ALPHABET[index];
      }
    }
  }
  const placedWords = placements.map((placement) => placement.word);
  return { grid, placements, placedWords };
};

export const wordFromPath = (grid: Grid, path: { row: number; col: number }[]) =>
  path.map((cell) => grid[cell.row][cell.col]).join('');

export const deriveStraightPath = (
  start: { row: number; col: number },
  end: { row: number; col: number },
): { row: number; col: number }[] => {
  const dx = end.col - start.col;
  const dy = end.row - start.row;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  if (steps === 0) return [start];
  const stepX = dx === 0 ? 0 : dx / steps;
  const stepY = dy === 0 ? 0 : dy / steps;
  if (!Number.isInteger(stepX) || !Number.isInteger(stepY)) return [start];
  const path: { row: number; col: number }[] = [];
  for (let i = 0; i <= steps; i += 1) {
    path.push({ row: start.row + stepY * i, col: start.col + stepX * i });
  }
  return path;
};
