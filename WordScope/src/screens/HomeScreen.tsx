import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Easing, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import analytics from '@react-native-firebase/analytics';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { getDailyPuzzle } from '../data/categories';
import { RootStackParamList } from '../types/navigation';
import { getDailyState } from '../storage/progress';
import { ScreenBackground } from '../components/ScreenBackground';
import { CoinBadge } from '../components/CoinBadge';
import { FloatingNav } from '../components/FloatingNav';
import { SettingsModal } from '../components/SettingsModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GuideOverlay } from '../components/GuideOverlay';
import {
  addCoins,
  getCoins,
  getSoundEnabled,
  getGuideSeen,
  setGuideSeen,
  setHomeRewardState,
} from '../storage/user';
import { RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';
import { Ads } from '../ads/ads';
import Sound from 'react-native-sound';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [dailyDone, setDailyDone] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const didMountRef = useRef(false);
  const [coins, setCoinsState] = useState(0);
  const [showReward, setShowReward] = useState(true);
  const [rewardReady, setRewardReady] = useState(false);
  const [rewardCooldownRemaining, setRewardCooldownRemaining] = useState(0);
  const rewardedAd = useMemo(() => RewardedAd.createForAdRequest(Ads.rewarded), []);
  const coinSoundRef = useRef<Sound | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const pendingRewardRef = useRef(false);
  const [showSettings, setShowSettings] = useState(false);
  const coinPulse = useRef(new Animated.Value(1)).current;
  const coinFly = useRef(new Animated.Value(0)).current;
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    getDailyState().then((state) => {
      const today = new Date().toDateString();
      setDailyDone(state.lastCompletedDate === today);
    });
    analytics().logEvent('home_view').catch(() => null);
  }, []);

  useEffect(() => {
    getCoins().then(setCoinsState);
    getSoundEnabled().then(setSoundEnabled);
    Sound.setCategory('Playback');
    coinSoundRef.current = new Sound('coin.wav', Sound.MAIN_BUNDLE, () => null);
    return () => {
      coinSoundRef.current?.release();
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getCoins().then(setCoinsState);
      getSoundEnabled().then(setSoundEnabled);
      getGuideSeen('home').then((seen) => setShowGuide(!seen));
    }, []),
  );

  useEffect(() => {
    const unsub = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () =>
      setRewardReady(true),
    );
    const earned = rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, async () => {
      if (!pendingRewardRef.current) return;
      pendingRewardRef.current = false;
      const next = await addCoins(100);
      setCoinsState(next);
      if (soundEnabled) {
        coinSoundRef.current?.stop(() => coinSoundRef.current?.play());
      }
      Animated.sequence([
        Animated.timing(coinPulse, { toValue: 1.15, duration: 140, useNativeDriver: true }),
        Animated.timing(coinPulse, { toValue: 1, duration: 140, useNativeDriver: true }),
      ]).start();
      coinFly.setValue(0);
      Animated.timing(coinFly, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
      const today = new Date().toDateString();
      await setHomeRewardState({ lastClaimedDate: today });
    });
    rewardedAd.load();
    return () => {
      unsub();
      earned();
    };
  }, [rewardedAd, soundEnabled]);

  useEffect(() => {
    if (!rewardCooldownRemaining) return;
    const timer = setInterval(() => {
      setRewardCooldownRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [rewardCooldownRemaining]);

  useEffect(() => {
    setShowReward(true);
  }, []);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const dailyPuzzle = getDailyPuzzle(new Date());

  const claimReward = async () => {
    if (rewardCooldownRemaining > 0) return;
    setRewardCooldownRemaining(60);
    if (!rewardReady) {
      rewardedAd.load();
      return;
    }
    pendingRewardRef.current = true;
    rewardedAd.show();
    setRewardReady(false);
    rewardedAd.load();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenBackground tint="#8AA4FF" />
      <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <Pressable style={styles.iconButton} onPress={() => setShowSettings(true)}>
          <Text style={styles.iconText}>⚙</Text>
        </Pressable>
        <Animated.View style={{ transform: [{ scale: coinPulse }] }}>
          <CoinBadge coins={coins} onPress={claimReward} />
        </Animated.View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>WordScope</Text>
        <Text style={styles.heroSubtitle}>Trace every hidden word in the grid.</Text>
      </View>

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0],
              }),
            },
          ],
          alignItems: 'center',
        }}
      >
        <Pressable style={styles.dailyCenter} onPress={() => navigation.navigate('Daily')}>
          <Text style={styles.dailyCenterTitle}>Daily Challenge</Text>
          <Text style={styles.dailyCenterBody}>{dailyPuzzle.title}</Text>
          <Text style={styles.dailyCenterMeta}>
            {dailyDone ? 'Completed today' : 'Play now for bonus coins'}
          </Text>
        </Pressable>
      </Animated.View>

      <View style={styles.rewardCard}>
        <Text style={styles.rewardTitle}>Free Coins</Text>
        <Text style={styles.rewardBody}>Watch a short ad to get +100 coins.</Text>
        {rewardCooldownRemaining > 0 ? (
          <Text style={styles.rewardCooldown}>{`Watch ad again after ${rewardCooldownRemaining}s`}</Text>
        ) : null}
        <View style={styles.rewardActions}>
          <Pressable
            style={[styles.rewardButton, rewardCooldownRemaining > 0 && styles.rewardButtonDisabled]}
            onPress={claimReward}
            disabled={rewardCooldownRemaining > 0}
          >
            <Text style={styles.rewardButtonText}>
              Watch Ad
            </Text>
          </Pressable>
        </View>
      </View>

      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />

      </ScrollView>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.coinFly,
          {
            opacity: coinFly.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }),
            transform: [
              {
                translateX: coinFly.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Dimensions.get('window').width / 2 - 40],
                }),
              },
              {
                translateY: coinFly.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -Dimensions.get('window').height / 3],
                }),
              },
              { scale: coinFly.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] }) },
            ],
          },
        ]}
      />

      <FloatingNav
        active="Home"
        onNavigate={(tab) => {
          if (tab === 'Moods') {
            navigation.navigate('Moods');
            return;
          }
          navigation.navigate(tab);
        }}
      />

      <GuideOverlay
        visible={showGuide}
        title="Welcome"
        body="Daily Challenge is in the center. Use Moods to browse levels. Tap the coin badge for rewards."
        onClose={() => {
          setShowGuide(false);
          setGuideSeen('home');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paper,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
    gap: 20,
  },
  hero: {
    backgroundColor: Colors.warm,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.mist,
    gap: 6,
    height: 150, 
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.inkMuted,
  },
  heroSubtitle: {
    ...Typography.body,
    color: Colors.inkMuted,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.mist,
  },
  iconText: {
    fontSize: 18,
  },
  dailyCenter: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.mist,
    alignItems: 'flex-start',
    gap: 6,
  },
  dailyCenterTitle: {
    ...Typography.label,
    color: Colors.accentDark,
  },
  dailyCenterBody: {
    ...Typography.subtitle,
    color: Colors.ink,
    textAlign: 'left',
  },
  dailyCenterMeta: {
    ...Typography.body,
    color: Colors.inkMuted,
    textAlign: 'left',
  },
  rewardButton: {
    flex: 1,
    backgroundColor: Colors.warm,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  rewardButtonText: {
    ...Typography.label,
    color: Colors.ink,
    fontWeight: '700',
  },
  rewardButtonDisabled: {
    backgroundColor: Colors.mist,
  },
  rewardCooldown: {
    ...Typography.label,
    color: Colors.accentDark,
  },
  rewardCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.mist,
    gap: 8,
  },
  rewardTitle: {
    ...Typography.subtitle,
    color: Colors.ink,
  },
  rewardBody: {
    ...Typography.body,
    color: Colors.inkMuted,
  },
  rewardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  coinFly: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: '#F4C84B',
    left: 24,
    top: '45%',
  },
});
