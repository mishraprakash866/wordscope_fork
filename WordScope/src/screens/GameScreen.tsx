import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Modal, Animated, Easing, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import analytics from '@react-native-firebase/analytics';
import { AdEventType, InterstitialAd, RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';
import Sound from 'react-native-sound';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Layout } from '../theme/layout';
import { WordGrid } from '../components/WordGrid';
import { WordList } from '../components/WordList';
import { HintButton } from '../components/HintButton';
import { RootStackParamList } from '../types/navigation';
import { generateWordSearch, wordFromPath } from '../game/wordSearch';
import { clearProgress, getHints, loadProgress, saveProgress, setDailyState, setHints } from '../storage/progress';
import { incrementInterstitialCount } from '../storage/ads';
import { addCoins, getCoins, getSoundEnabled, setGuideSeen, getGuideSeen } from '../storage/user';
import { Ads } from '../ads/ads';
import { getRemoteConfig } from '../config/remoteConfig';
import { Categories } from '../data/categories';
import { ScreenBackground } from '../components/ScreenBackground';
import { CoinBadge } from '../components/CoinBadge';
import { SettingsModal } from '../components/SettingsModal';
import { GuideOverlay } from '../components/GuideOverlay';

export const GameScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Game'>>();
  const { puzzleId, title, size, words, seconds, mode, categoryId } = route.params;
  const requestedWords = useMemo(() => words.map((word) => word.toUpperCase()), [words]);

  const { grid, placements, placedWords } = useMemo(
    () => generateWordSearch(requestedWords, size, puzzleId),
    [requestedWords, size, puzzleId],
  );

  const normalizedWords = placedWords.length ? placedWords : requestedWords;

  const [selectedPath, setSelectedPath] = useState<{ row: number; col: number }[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundPaths, setFoundPaths] = useState<{ cells: { row: number; col: number }[]; color: string }[]>([]);
  const [wordColors, setWordColors] = useState<Record<string, string>>({});
  const [hints, setHintsState] = useState(3);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(seconds ?? 0);
  const [rewarded, setRewarded] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const completeAnim = useRef(new Animated.Value(0)).current;
  const [showTimeUp, setShowTimeUp] = useState(false);
  const [interstitialReady, setInterstitialReady] = useState(false);
  const [rewardedReady, setRewardedReady] = useState(false);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [rewardCooldown, setRewardCooldown] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const interstitial = useMemo(() => InterstitialAd.createForAdRequest(Ads.interstitial), []);
  const rewardedAd = useMemo(() => RewardedAd.createForAdRequest(Ads.rewarded), []);
  const remote = getRemoteConfig();
  const rewardGrantedRef = useRef(false);
  const adsEnabled = Ads.isAndroid;
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const matchSoundRef = useRef<Sound | null>(null);
  const completeSoundRef = useRef<Sound | null>(null);
  const coinSoundRef = useRef<Sound | null>(null);
  const [coins, setCoinsState] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const coinPulse = useRef(new Animated.Value(1)).current;
  const coinFly = useRef(new Animated.Value(0)).current;
  const completionAwardedRef = useRef(false);
  const replayRewardsDisabledRef = useRef(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const palette = useMemo(() => {
    const map: Record<string, string[]> = {
      calm: ['#6BA6FF', '#9BB7FF', '#7AD3A6', '#BBDFF7', '#C0CFFB'],
      spark: ['#FFB357', '#FF8A5B', '#FFD166', '#F06D8B', '#FFA07A'],
      deep: ['#4DB6AC', '#81C784', '#26A69A', '#7AD3A6', '#5CC8A8'],
      mystic: ['#B388FF', '#9C7BFF', '#C48BFA', '#8C9EFF', '#D0A3FF'],
      metro: ['#FF9F80', '#FFB085', '#FFC1A1', '#FF8A65', '#FFAD93'],
      ocean: ['#4FC3F7', '#81D4FA', '#4DD0E1', '#80DEEA', '#64B5F6'],
      ember: ['#FF7043', '#FF8A65', '#FF6F61', '#FFAB91', '#F4511E'],
      garden: ['#81C784', '#A5D6A7', '#66BB6A', '#AED581', '#7CB342'],
      summit: ['#90A4AE', '#B0BEC5', '#78909C', '#9FA8DA', '#8D9CB0'],
    };
    const category = categoryId ?? 'calm';
    return map[category] ?? ['#6BA6FF', '#F29D64', '#7AD3A6', '#C48BFA', '#F06D8B'];
  }, [categoryId]);

  useEffect(() => {
    let alive = true;
    Promise.all([loadProgress(puzzleId), getHints()]).then(([saved, hintCount]) => {
      if (!alive) return;
      setHintsState(hintCount);
      if (saved) {
        setFoundWords(saved.foundWords);
        setElapsedSeconds(saved.elapsedSeconds);
        if (seconds) {
          setTimeLeft(Math.max(seconds - saved.elapsedSeconds, 0));
        }
      }
    });
    getCoins().then(setCoinsState);
    getSoundEnabled().then(setSoundEnabled);
    Sound.setCategory('Playback');
    matchSoundRef.current = new Sound('match.wav', Sound.MAIN_BUNDLE, () => null);
    completeSoundRef.current = new Sound('complete.wav', Sound.MAIN_BUNDLE, () => null);
    coinSoundRef.current = new Sound('coin.wav', Sound.MAIN_BUNDLE, () => null);
    return () => {
      matchSoundRef.current?.release();
      completeSoundRef.current?.release();
      coinSoundRef.current?.release();
      alive = false;
    };
  }, [puzzleId, seconds]);

  useEffect(() => {
    completionAwardedRef.current = false;
    replayRewardsDisabledRef.current = false;
  }, [puzzleId]);

  useFocusEffect(
    React.useCallback(() => {
      getCoins().then(setCoinsState);
      getSoundEnabled().then(setSoundEnabled);
      getGuideSeen('game').then((seen) => setShowGuide(!seen));
    }, []),
  );

  useEffect(() => {
    analytics().logEvent('game_start', { puzzleId, mode }).catch(() => null);
  }, [puzzleId, mode]);

  useEffect(() => {
    if (!adsEnabled) return;
    const unsub = interstitial.addAdEventListener(AdEventType.LOADED, () =>
      setInterstitialReady(true),
    );
    interstitial.load();
    return () => unsub();
  }, [interstitial, adsEnabled]);

  useEffect(() => {
    if (!adsEnabled) return;
    const unsub = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () =>
      setRewardedReady(true),
    );
    const closedSub = rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      setRewardLoading(false);
      setRewardCooldown(true);
      const initial = Math.max(1, remote.rewarded_cooldown_seconds);
      setCooldownRemaining(initial);
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
      cooldownIntervalRef.current = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            if (cooldownIntervalRef.current) {
              clearInterval(cooldownIntervalRef.current);
              cooldownIntervalRef.current = null;
            }
            setRewardCooldown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });
    const rewardSub = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      async () => {
        if (rewardGrantedRef.current) return;
        rewardGrantedRef.current = true;
        const extra = Math.max(1, remote.daily_hint_reward);
        const nextHints = hints + extra;
        setHintsState(nextHints);
        await setHints(nextHints);
        analytics().logEvent('rewarded_hint', { extra }).catch(() => null);
      },
    );
    rewardedAd.load();
    return () => {
      unsub();
      closedSub();
      rewardSub();
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
      }
    };
  }, [rewardedAd, hints, remote.daily_hint_reward, remote.rewarded_cooldown_seconds, adsEnabled]);

  useEffect(() => {
    if (!adsEnabled) return;
    if (!rewardCooldown && !rewardedReady) {
      rewardedAd.load();
    }
  }, [rewardCooldown, rewardedReady, rewardedAd, adsEnabled]);

  useEffect(() => {
    const tick = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      if (mode === 'time' && seconds) {
        setTimeLeft((prev) => Math.max(prev - 1, 0));
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [mode, seconds]);

  useEffect(() => {
    if (mode === 'time' && timeLeft <= 0) {
      setShowTimeUp(true);
    }
  }, [mode, timeLeft]);

  useEffect(() => {
    saveProgress(puzzleId, { foundWords, elapsedSeconds }).catch(() => null);
  }, [puzzleId, foundWords, elapsedSeconds]);

  const handleSelectionEnd = (path: { row: number; col: number }[]) => {
    const word = wordFromPath(grid, path);
    const reversed = word.split('').reverse().join('');
    const match = normalizedWords.find(
      (w) => word.startsWith(w) || reversed.startsWith(w),
    );
    if (match && !foundWords.includes(match)) {
      const placement = placements.find((p) => p.word === match);
      const color = palette[foundWords.length % palette.length];
      setFoundWords((prev) => [...prev, match]);
      setWordColors((prev) => ({ ...prev, [match]: color }));
      if (placement) {
        setFoundPaths((prev) => [...prev, { cells: placement.path, color }]);
      }
      if (!replayRewardsDisabledRef.current) {
        addCoins(10).then(setCoinsState);
      }
      if (soundEnabled) {
        matchSoundRef.current?.stop(() => matchSoundRef.current?.play());
        coinSoundRef.current?.stop(() => coinSoundRef.current?.play());
      }
      Animated.sequence([
        Animated.timing(coinPulse, { toValue: 1.15, duration: 120, useNativeDriver: true }),
        Animated.timing(coinPulse, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
      coinFly.setValue(0);
      Animated.timing(coinFly, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
    setSelectedPath([]);
  };

  const revealWord = (target: string) => {
    if (foundWords.includes(target)) return;
    const placement = placements.find((p) => p.word === target);
    const color = palette[foundWords.length % palette.length];
    setFoundWords((prev) => [...prev, target]);
    setWordColors((prev) => ({ ...prev, [target]: color }));
    if (placement) {
      setFoundPaths((prev) => [...prev, { cells: placement.path, color }]);
    }
  };

  const handleHint = async () => {
    if (hints <= 0) {
      Alert.alert('No hints', 'Earn hints by watching ads or daily rewards.');
      return;
    }
    const remaining = normalizedWords.filter((word) => !foundWords.includes(word));
    if (!remaining.length) return;
    const target = remaining[Math.floor(Math.random() * remaining.length)];
    revealWord(target);
    const nextHints = hints - 1;
    setHintsState(nextHints);
    await setHints(nextHints);
  };

  const handleRewardedHint = async () => {
    if (!adsEnabled || rewardLoading || rewardCooldown) return;
    if (!rewardedReady) {
      rewardedAd.load();
      return;
    }
    rewardGrantedRef.current = false;
    setRewardLoading(true);
    rewardedAd.show();
    setRewardedReady(false);
    rewardedAd.load();
  };

  useEffect(() => {
    if (foundWords.length === normalizedWords.length) {
      clearProgress(puzzleId).catch(() => null);
      setShowComplete(true);
      setConfettiKey((prev) => prev + 1);
      if (!completionAwardedRef.current) {
        completionAwardedRef.current = true;
      if (puzzleId.startsWith('daily') && !rewarded) {
        const today = new Date().toDateString();
        setDailyState({ lastCompletedDate: today, lastClaimedDate: today }).catch(() => null);
        const bonus = Math.max(1, remote.daily_hint_reward);
        const nextHints = hints + bonus;
        setHintsState(nextHints);
        setHints(nextHints).catch(() => null);
        setRewarded(true);
      }

      analytics()
        .logEvent('game_complete', { puzzleId, mode, elapsedSeconds })
        .catch(() => null);

        addCoins(50).then(setCoinsState);
        if (soundEnabled) {
          completeSoundRef.current?.stop(() => completeSoundRef.current?.play());
          coinSoundRef.current?.stop(() => coinSoundRef.current?.play());
        }
      }
      replayRewardsDisabledRef.current = true;

      if (adsEnabled && interstitialReady) {
        incrementInterstitialCount()
          .then((count) => {
            const every = Math.max(1, remote.interstitial_every_n);
            if (count % every === 0) {
              interstitial.show();
              setInterstitialReady(false);
              interstitial.load();
            }
          })
          .catch(() => null);
      }
    }
  }, [
    foundWords.length,
    normalizedWords.length,
    puzzleId,
    hints,
    rewarded,
    interstitialReady,
    adsEnabled,
    remote.interstitial_every_n,
  ]);

  useEffect(() => {
    if (!showComplete) {
      completeAnim.setValue(0);
      return;
    }
    Animated.timing(completeAnim, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [showComplete, completeAnim]);

  const handleReset = () => {
    setFoundWords([]);
    setFoundPaths([]);
    setWordColors({});
    setSelectedPath([]);
    setElapsedSeconds(0);
    setTimeLeft(seconds ?? 0);
    clearProgress(puzzleId).catch(() => null);
    setShowComplete(false);
    setShowTimeUp(false);
  };

  const handleNext = () => {
    if (!categoryId) {
      setShowComplete(false);
      navigation.popToTop();
      return;
    }
    const category = Categories.find((item) => item.id === categoryId);
    if (!category) {
      setShowComplete(false);
      navigation.popToTop();
      return;
    }
    const list = [...category.puzzles]
      .filter((p) => (mode === 'classic' ? p.difficulty <= 3 : p.difficulty >= 3))
      .sort((a, b) => a.difficulty - b.difficulty || a.size - b.size);
    const index = list.findIndex((p) => p.id === puzzleId);
    const next = index >= 0 && index < list.length - 1 ? list[index + 1] : null;
    if (!next) {
      setShowComplete(false);
      navigation.popToTop();
      return;
    }
    setShowComplete(false);
    navigation.replace('Game', {
      puzzleId: next.id,
      title: next.title,
      size: next.size,
      words: next.words,
      seconds: mode === 'time' ? next.seconds : undefined,
      mode,
      categoryId,
    });
  };

  const category = categoryId ? Categories.find((item) => item.id === categoryId) : null;
  const tint = category?.color ?? Colors.cool;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenBackground tint={tint} />
      <View style={styles.topRow}>
        <Pressable style={styles.iconButton} onPress={() => setShowSettings(true)}>
          <Text style={styles.iconText}>⚙</Text>
        </Pressable>
        <Animated.View style={{ transform: [{ scale: coinPulse }] }}>
          <CoinBadge coins={coins} />
        </Animated.View>
      </View>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{mode === 'time' ? 'Hard Mode' : 'Easy Mode'}</Text>
        </View>
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>{mode === 'time' ? 'Time' : 'Elapsed'}</Text>
          <Text style={styles.timerValue}>{mode === 'time' ? `${timeLeft}s` : `${elapsedSeconds}s`}</Text>
        </View>
      </View>

      <WordGrid
        grid={grid}
        selectedPath={selectedPath}
        foundPaths={foundPaths}
        onSelectionChange={setSelectedPath}
        onSelectionEnd={handleSelectionEnd}
        disabled={mode === 'time' && timeLeft <= 0}
        fontScale={mode === 'time' ? 0.42 : 0.5}
        debug={__DEV__}
      />

      {__DEV__ ? (
        <View style={styles.debugRow}>
          <Text style={styles.debugLabel}>Selection</Text>
          <Text style={styles.debugValue}>{wordFromPath(grid, selectedPath) || '-'}</Text>
        </View>
      ) : null}

      <View style={styles.controls}>
        <HintButton hints={hints} onPress={handleHint} />
        <Pressable style={styles.reset} onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      {adsEnabled ? (
        <Pressable
          style={[
            styles.rewardButton,
            (!rewardedReady || rewardLoading || rewardCooldown) && styles.rewardDisabled,
          ]}
          onPress={handleRewardedHint}
          disabled={rewardLoading || rewardCooldown}
        >
          <Text style={styles.rewardText}>
            {rewardLoading
              ? 'Loading ad...'
              : rewardCooldown
              ? `Cooldown: ${cooldownRemaining}s`
              : `Watch Ad for +${Math.max(1, remote.daily_hint_reward)} Hints`}
          </Text>
        </Pressable>
      ) : null}

      <WordList words={normalizedWords} found={foundWords} colors={wordColors} />

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

      <GuideOverlay
        visible={showGuide}
        title="How to play"
        body="Drag across letters to find words. Easy mode is calm, Hard adds pressure and shuffles. Use Hint to auto‑highlight a word."
        onClose={() => {
          setShowGuide(false);
          setGuideSeen('game');
        }}
      />

      <Modal visible={showComplete} transparent animationType="none">
        <View style={styles.modalBackdrop}>
          {showComplete ? (
            <ConfettiCannon
              key={`confetti-${confettiKey}`}
              count={120}
              origin={{ x: -20, y: 0 }}
              fadeOut
              fallSpeed={3000}
            />
          ) : null}
          <Animated.View
            style={[
              styles.modalCard,
              {
                opacity: completeAnim,
                transform: [
                  {
                    scale: completeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.92, 1],
                    }),
                  },
                  {
                    translateY: completeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.modalTitle}>Great job!</Text>
            <Text style={styles.modalBody}>You found all the words.</Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalButton} onPress={handleNext}>
                <Text style={styles.modalButtonText}>Next</Text>
              </Pressable>
              <Pressable style={styles.modalButtonGhost} onPress={handleReset}>
                <Text style={styles.modalGhostText}>Replay</Text>
              </Pressable>
              <Pressable style={styles.modalButtonGhost} onPress={() => navigation.goBack()}>
                <Text style={styles.modalGhostText}>Back</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={showTimeUp} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Time is up</Text>
            <Text style={styles.modalBody}>Reset to try again or switch difficulty.</Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalButton} onPress={handleReset}>
                <Text style={styles.modalButtonText}>Play Again</Text>
              </Pressable>
              <Pressable style={styles.modalButtonGhost} onPress={() => setShowTimeUp(false)}>
                <Text style={styles.modalGhostText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paper,
    padding: 20,
    gap: 16,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...Typography.subtitle,
    color: Colors.ink,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.inkMuted,
  },
  timerCard: {
    backgroundColor: Colors.white,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Layout.radius,
    borderWidth: 1,
    borderColor: Colors.mist,
    alignItems: 'center',
  },
  timerLabel: {
    ...Typography.label,
    color: Colors.inkMuted,
  },
  timerValue: {
    ...Typography.subtitle,
    color: Colors.ink,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: Colors.mist,
  },
  debugLabel: {
    ...Typography.label,
    color: Colors.inkMuted,
  },
  debugValue: {
    ...Typography.label,
    color: Colors.ink,
  },
  rewardButton: {
    marginTop: 8,
    backgroundColor: Colors.cool,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 999,
  },
  rewardDisabled: {
    backgroundColor: Colors.mist,
  },
  rewardText: {
    ...Typography.label,
    color: Colors.white,
  },
  reset: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.mist,
  },
  resetText: {
    ...Typography.label,
    color: Colors.inkMuted,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  modalTitle: {
    ...Typography.subtitle,
    color: Colors.ink,
    textAlign: 'center',
  },
  modalBody: {
    ...Typography.body,
    color: Colors.inkMuted,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  modalButton: {
    flex: 1,
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  modalButtonText: {
    ...Typography.label,
    color: Colors.white,
  },
  modalButtonGhost: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.mist,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  modalGhostText: {
    ...Typography.label,
    color: Colors.ink,
  },
});
