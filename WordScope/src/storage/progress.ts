import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEY = 'wordscope.progress';
const HINTS_KEY = 'wordscope.hints';
const DAILY_KEY = 'wordscope.daily';

export type SavedProgress = {
  foundWords: string[];
  elapsedSeconds: number;
};

export const loadProgress = async (puzzleId: string) => {
  const raw = await AsyncStorage.getItem(PROGRESS_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as Record<string, SavedProgress>;
  return parsed[puzzleId] ?? null;
};

export const saveProgress = async (puzzleId: string, progress: SavedProgress) => {
  const raw = await AsyncStorage.getItem(PROGRESS_KEY);
  const parsed = raw ? (JSON.parse(raw) as Record<string, SavedProgress>) : {};
  parsed[puzzleId] = progress;
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(parsed));
};

export const clearProgress = async (puzzleId: string) => {
  const raw = await AsyncStorage.getItem(PROGRESS_KEY);
  if (!raw) return;
  const parsed = JSON.parse(raw) as Record<string, SavedProgress>;
  delete parsed[puzzleId];
  await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(parsed));
};

export const getHints = async () => {
  const raw = await AsyncStorage.getItem(HINTS_KEY);
  if (!raw) return 3;
  return parseInt(raw, 10);
};

export const setHints = async (count: number) =>
  AsyncStorage.setItem(HINTS_KEY, Math.max(count, 0).toString());

export type DailyState = {
  lastCompletedDate?: string;
  lastClaimedDate?: string;
};

export const getDailyState = async () => {
  const raw = await AsyncStorage.getItem(DAILY_KEY);
  if (!raw) return {} as DailyState;
  return JSON.parse(raw) as DailyState;
};

export const setDailyState = async (state: DailyState) =>
  AsyncStorage.setItem(DAILY_KEY, JSON.stringify(state));
