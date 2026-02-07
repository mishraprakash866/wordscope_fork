export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type ThemePack = {
  id: string;
  name: string;
  mood: string;
  description: string;
  color: string;
  words: Record<Difficulty, string[]>;
};

export const ThemePacks: ThemePack[] = [
  {
    id: 'calm',
    name: 'Calm Focus',
    mood: 'Relaxed',
    description: 'Soft starts, slow pace, gentle words.',
    color: '#8AA4FF',
    words: {
      1: ['BREEZE', 'CALM', 'DAWN', 'SOFT', 'MIST', 'CLOUD', 'BLUE', 'HUSH'],
      2: ['SILENCE', 'WATER', 'REED', 'LOON', 'GLASS', 'SHORE', 'DRIFT'],
      3: ['MEADOW', 'TWILIGHT', 'BLOOM', 'CRICKET', 'WILLOW', 'SLEEP'],
      4: ['DRIFTING', 'STILLNESS', 'LULLABY', 'REFLECT', 'HALO', 'RIPPLE'],
      5: ['MOONLIGHT', 'WHISPER', 'TRANQUIL', 'SILHOUETTE', 'MIDNIGHT', 'SERENITY'],
    },
  },
  {
    id: 'spark',
    name: 'Spark Energy',
    mood: 'Playful',
    description: 'Short bursts and bright finds.',
    color: '#F5C66F',
    words: {
      1: ['FLASH', 'BOLT', 'GLOW', 'VIBE', 'NOVA', 'FIRE', 'ZAP'],
      2: ['RIOT', 'ENERGY', 'SHOCK', 'PULSE', 'BURST', 'SPARK', 'RUSH'],
      3: ['VOLTAGE', 'GLARE', 'SPEED', 'ECHO', 'SPIRIT', 'FIZZ'],
      4: ['SHIMMER', 'CHARGE', 'RADIANT', 'FREQUENCY', 'SURGE', 'IGNITE'],
      5: ['KINETIC', 'LIGHTNING', 'MOMENTUM', 'OVERDRIVE', 'CATALYST', 'AFTERBURN'],
    },
  },
  {
    id: 'deep',
    name: 'Deep Flow',
    mood: 'Focused',
    description: 'Longer words and stronger paths.',
    color: '#2E7D6B',
    words: {
      1: ['FOCUS', 'STUDY', 'GRIND', 'QUIET', 'STEADY', 'FLOW'],
      2: ['MIDNIGHT', 'RHYTHM', 'SILENT', 'HABIT', 'INTENT'],
      3: ['PERSIST', 'RESOLVE', 'PATTERN', 'DISCOVER', 'ARCHIVE', 'DEDICATE'],
      4: ['CONCENTRATE', 'OBSERVE', 'HARMONY', 'RITUAL', 'THREAD', 'BALANCE'],
      5: ['PERSEVERANCE', 'DISCIPLINE', 'MEDITATION', 'INTENTION', 'CLARITY', 'COMPOSE'],
    },
  },
  {
    id: 'mystic',
    name: 'Mystic Trails',
    mood: 'Dreamy',
    description: 'Enchanted words and hidden paths.',
    color: '#B2A4FF',
    words: {
      1: ['RUNE', 'ORBIT', 'SPELL', 'GLOW', 'DUSK', 'MOSS'],
      2: ['SIGIL', 'EMBER', 'PORTAL', 'WHISP', 'LORE', 'NIGHT'],
      3: ['AURORA', 'GRIMOIRE', 'LANTERN', 'STARDUST', 'PHANTOM'],
      4: ['ENCHANT', 'CELESTIAL', 'ASTRAL', 'ECLIPSE', 'WANDER'],
      5: ['CONSTELLATION', 'TRANSCEND', 'ILLUMINATION', 'SPECTRAL', 'INCANTATION'],
    },
  },
  {
    id: 'metro',
    name: 'City Pulse',
    mood: 'Urban',
    description: 'Fast grids inspired by city rhythms.',
    color: '#FF9F80',
    words: {
      1: ['NEON', 'CAB', 'RUSH', 'LANE', 'SIGN', 'PARK'],
      2: ['SUBWAY', 'TOWER', 'BRIDGE', 'TRAFFIC', 'ALLEY', 'METRO'],
      3: ['CROSSWALK', 'SKYLINE', 'STREET', 'MARKET', 'CIRCUIT'],
      4: ['INTERSECTION', 'BOULEVARD', 'HEADLIGHT', 'OVERPASS', 'OUTLET'],
      5: ['METROPOLITAN', 'SKYSCRAPER', 'NEIGHBORHOOD', 'INNOVATION', 'FOUNDATION'],
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Drift',
    mood: 'Coastal',
    description: 'Salt air, deep blue, and rolling waves.',
    color: '#4FC3F7',
    words: {
      1: ['TIDE', 'SHELL', 'FOAM', 'REEF', 'WAVE', 'BLUE'],
      2: ['SEAGULL', 'HARBOR', 'ANCHOR', 'CURRENT', 'COAST', 'SAIL'],
      3: ['WHIRLPOOL', 'DOLPHIN', 'HORIZON', 'DRIFT', 'LAGOON'],
      4: ['BREAKWATER', 'UNDERCURRENT', 'NAVIGATE', 'SEABREEZE', 'FATHOM'],
      5: ['BIOLUMINESCENT', 'SUBMERSIBLE', 'CONTINENTAL', 'MARINER', 'TIDALFLOW'],
    },
  },
  {
    id: 'ember',
    name: 'Ember Forge',
    mood: 'Intense',
    description: 'Heat, steel, and sparks in motion.',
    color: '#FF7043',
    words: {
      1: ['FLAME', 'COAL', 'HEAT', 'SMOKE', 'ASH', 'EMBER'],
      2: ['FORGE', 'ANVIL', 'SPARK', 'MOLTEN', 'FIRELIT', 'SMELT'],
      3: ['CRUCIBLE', 'HAMMER', 'TEMPER', 'INGOT', 'FURNACE'],
      4: ['BLACKSMITH', 'INCANDESCENT', 'HARDEN', 'ALLOY', 'WORKSHOP'],
      5: ['PYROTECHNIC', 'METALLURGY', 'CARBONIZE', 'CONFLAGRATION', 'REFRACTORY'],
    },
  },
  {
    id: 'garden',
    name: 'Garden Muse',
    mood: 'Fresh',
    description: 'Floral paths and soft greenery.',
    color: '#81C784',
    words: {
      1: ['ROSE', 'MOSS', 'LEAF', 'BLOOM', 'GROW', 'VINE'],
      2: ['PETAL', 'GARDEN', 'MEADOW', 'THORNS', 'NEST', 'SEED'],
      3: ['GREENHOUSE', 'DAFFODIL', 'FERN', 'NECTAR', 'IRIS'],
      4: ['BOTANICAL', 'HABITAT', 'EVERGREEN', 'POLLINATE', 'HERBARIUM'],
      5: ['HORTICULTURE', 'PHOTOSYNTHESIS', 'CHLOROPHYLL', 'PERENNIAL', 'BLOOMING'],
    },
  },
  {
    id: 'summit',
    name: 'Summit Line',
    mood: 'Adventurous',
    description: 'High altitudes and bold climbs.',
    color: '#90A4AE',
    words: {
      1: ['PEAK', 'RIDGE', 'TRAIL', 'ROCK', 'SNOW', 'HIKE'],
      2: ['SUMMIT', 'GLACIER', 'CABIN', 'PINE', 'CLIMB', 'ALTAR'],
      3: ['AVALANCHE', 'ALPINE', 'EXPEDITION', 'CANYON', 'OVERLOOK'],
      4: ['ALTITUDE', 'MOUNTAINEER', 'CRESTLINE', 'BACKCOUNTRY', 'WAYPOINT'],
      5: ['PERSEVERANCE', 'RIDGELINE', 'NAVIGATION', 'WILDERNESS', 'TRAILHEAD'],
    },
  },
];

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

const pick = <T,>(rng: () => number, items: T[], count: number) => {
  const pool = [...items];
  const chosen: T[] = [];
  while (pool.length && chosen.length < count) {
    const index = Math.floor(rng() * pool.length);
    chosen.push(pool.splice(index, 1)[0]);
  }
  return chosen;
};

export const buildPuzzlesForTheme = (theme: ThemePack) => {
  return (['1', '2', '3', '4', '5'] as const).map((level, idx) => {
    const difficulty = (idx + 1) as Difficulty;
    const baseSize = 7 + idx;
    const wordCount = 4 + idx;
    const words = theme.words[difficulty].slice(0, wordCount);
    return {
      id: `${theme.id}-${difficulty}`,
      title: `${theme.name} ${difficulty}`,
      size: baseSize + (difficulty >= 4 ? 1 : 0),
      words,
      difficulty,
      seconds: 110 + difficulty * 10,
    };
  });
};

export const buildDailyPuzzle = (date: Date) => {
  const seed = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const rng = mulberry32(toSeed(seed));
  const theme = ThemePacks[Math.floor(rng() * ThemePacks.length)];
  const difficulty = (1 + Math.floor(rng() * 5)) as Difficulty;
  const size = 9 + difficulty;
  const wordCount = 6 + difficulty;
  const words = pick(rng, theme.words[difficulty], wordCount);
  return {
    id: `daily-${seed}`,
    title: `${theme.name} Daily`,
    size,
    words,
    seconds: 120 + difficulty * 10,
    difficulty,
  };
};
