import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

const ANDROID_INTERSTITIAL = 'ca-app-pub-7811069113396432/9569668870';
const ANDROID_REWARDED = 'ca-app-pub-7811069113396432/2745249967';

export const Ads = {
  interstitial: __DEV__ ? TestIds.INTERSTITIAL : ANDROID_INTERSTITIAL,
  rewarded: __DEV__ ? TestIds.REWARDED : ANDROID_REWARDED,
  isAndroid: Platform.OS === 'android',
};
