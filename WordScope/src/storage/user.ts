import AsyncStorage from '@react-native-async-storage/async-storage';

const COINS_KEY = 'wordscope.coins';
const SOUND_KEY = 'wordscope.sound';
const MUSIC_KEY = 'wordscope.music';
const HOME_REWARD_KEY = 'wordscope.home.reward';
const HOME_REWARD_COOLDOWN_KEY = 'wordscope.home.reward.cooldown';
const GUIDE_KEY_PREFIX = 'wordscope.guide.';

export const getCoins = async () => {
  const raw = await AsyncStorage.getItem(COINS_KEY);
  if (!raw) return 50;
  return parseInt(raw, 10);
};

export const setCoins = async (coins: number) =>
  AsyncStorage.setItem(COINS_KEY, Math.max(0, coins).toString());

export const addCoins = async (amount: number) => {
  const current = await getCoins();
  const next = current + amount;
  await setCoins(next);
  return next;
};

export const spendCoins = async (amount: number) => {
  const current = await getCoins();
  if (current < amount) return { ok: false, coins: current };
  const next = current - amount;
  await setCoins(next);
  return { ok: true, coins: next };
};

export const getSoundEnabled = async () => {
  const raw = await AsyncStorage.getItem(SOUND_KEY);
  if (!raw) return true;
  return raw === 'true';
};

export const setSoundEnabled = async (value: boolean) =>
  AsyncStorage.setItem(SOUND_KEY, value ? 'true' : 'false');

export const getMusicEnabled = async () => {
  const raw = await AsyncStorage.getItem(MUSIC_KEY);
  if (!raw) return true;
  return raw === 'true';
};

export const setMusicEnabled = async (value: boolean) =>
  AsyncStorage.setItem(MUSIC_KEY, value ? 'true' : 'false');

export type HomeRewardState = {
  lastClaimedDate?: string;
};

export const getHomeRewardState = async () => {
  const raw = await AsyncStorage.getItem(HOME_REWARD_KEY);
  if (!raw) return {} as HomeRewardState;
  return JSON.parse(raw) as HomeRewardState;
};

export const setHomeRewardState = async (state: HomeRewardState) =>
  AsyncStorage.setItem(HOME_REWARD_KEY, JSON.stringify(state));

export const getHomeRewardCooldownUntil = async () => {
  const raw = await AsyncStorage.getItem(HOME_REWARD_COOLDOWN_KEY);
  if (!raw) return 0;
  return parseInt(raw, 10);
};

export const setHomeRewardCooldownUntil = async (timestamp: number) =>
  AsyncStorage.setItem(HOME_REWARD_COOLDOWN_KEY, timestamp.toString());

export const getGuideSeen = async (key: string) => {
  const raw = await AsyncStorage.getItem(`${GUIDE_KEY_PREFIX}${key}`);
  if (!raw) return false;
  return raw === 'true';
};

export const setGuideSeen = async (key: string) =>
  AsyncStorage.setItem(`${GUIDE_KEY_PREFIX}${key}`, 'true');
