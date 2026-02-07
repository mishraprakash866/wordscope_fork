import AsyncStorage from '@react-native-async-storage/async-storage';

const INTERSTITIAL_KEY = 'wordscope.interstitial.count';

export const getInterstitialCount = async () => {
  const raw = await AsyncStorage.getItem(INTERSTITIAL_KEY);
  if (!raw) return 0;
  return parseInt(raw, 10);
};

export const incrementInterstitialCount = async () => {
  const current = await getInterstitialCount();
  const next = current + 1;
  await AsyncStorage.setItem(INTERSTITIAL_KEY, next.toString());
  return next;
};
