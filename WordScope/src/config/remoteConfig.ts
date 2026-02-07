import remoteConfig from '@react-native-firebase/remote-config';

export type RemoteConfigValues = {
  time_multiplier: number;
  daily_hint_reward: number;
  interstitial_every_n: number;
  rewarded_cooldown_seconds: number;
};

const defaults: RemoteConfigValues = {
  time_multiplier: 1,
  daily_hint_reward: 1,
  interstitial_every_n: 2,
  rewarded_cooldown_seconds: 5,
};

let cached: RemoteConfigValues = { ...defaults };

export const initRemoteConfig = async () => {
  const rc = remoteConfig();
  await rc.setDefaults(defaults);
  await rc.setConfigSettings({
    minimumFetchIntervalMillis: __DEV__ ? 0 : 60 * 60 * 1000,
  });
  try {
    await rc.fetchAndActivate();
  } catch {
    // Keep defaults if fetch fails.
  }

  cached = {
    time_multiplier: rc.getNumber('time_multiplier') || defaults.time_multiplier,
    daily_hint_reward: rc.getNumber('daily_hint_reward') || defaults.daily_hint_reward,
    interstitial_every_n: rc.getNumber('interstitial_every_n') || defaults.interstitial_every_n,
    rewarded_cooldown_seconds:
      rc.getNumber('rewarded_cooldown_seconds') || defaults.rewarded_cooldown_seconds,
  };

  return cached;
};

export const getRemoteConfig = () => cached;
