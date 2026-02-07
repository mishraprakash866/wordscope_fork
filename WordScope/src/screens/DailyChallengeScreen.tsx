import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import analytics from '@react-native-firebase/analytics';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Layout } from '../theme/layout';
import { getDailyPuzzle } from '../data/categories';
import { getDailyState } from '../storage/progress';
import { ScreenBackground } from '../components/ScreenBackground';
import { CoinBadge } from '../components/CoinBadge';
import { FloatingNav } from '../components/FloatingNav';
import { getCoins, getGuideSeen, setGuideSeen } from '../storage/user';
import { SettingsModal } from '../components/SettingsModal';
import { GuideOverlay } from '../components/GuideOverlay';

export const DailyChallengeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [done, setDone] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [coins, setCoinsState] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    getDailyState().then((state) => {
      const today = new Date().toDateString();
      setDone(state.lastCompletedDate === today);
    });
    analytics().logEvent('daily_view').catch(() => null);
  }, []);

  useEffect(() => {
    getCoins().then(setCoinsState);
  }, []);

  useEffect(() => {
    getGuideSeen('daily').then((seen) => setShowGuide(!seen));
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getCoins().then(setCoinsState);
    }, []),
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 240,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const puzzle = getDailyPuzzle(new Date());

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenBackground tint={Colors.cool} />
      <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <Pressable style={styles.iconButton} onPress={() => setShowSettings(true)}>
          <Text style={styles.iconText}>⚙</Text>
        </Pressable>
        <CoinBadge coins={coins} />
      </View>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            },
          ],
        }}
      >
        <Text style={styles.title}>Daily Challenge</Text>
        <Text style={styles.subtitle}>Solve today to earn bonus hints.</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{puzzle.title}</Text>
          <Text style={styles.cardBody}>{puzzle.words.length} words · {puzzle.size}x{puzzle.size}</Text>
          <Text style={styles.cardMeta}>{puzzle.seconds ?? 140}s time</Text>
        </View>
        <Pressable
          style={[styles.button, done && styles.buttonDisabled]}
          onPress={() =>
            navigation.navigate('Game', {
              puzzleId: puzzle.id,
              title: puzzle.title,
              size: puzzle.size,
              words: puzzle.words,
              seconds: puzzle.seconds ?? 140,
              mode: 'time',
            })
          }
          disabled={done}
        >
          <Text style={styles.buttonText}>{done ? 'Completed' : 'Start Daily (Hard)'}</Text>
        </Pressable>
      </Animated.View>
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
      <GuideOverlay
        visible={showGuide}
        title="Daily Challenge"
        body="Complete the daily puzzle for bonus rewards and hints."
        onClose={() => {
          setShowGuide(false);
          setGuideSeen('daily');
        }}
      />
      </ScrollView>

      <FloatingNav
        active="Daily"
        onNavigate={(tab) => {
          if (tab === 'Moods') {
            navigation.navigate('Moods');
            return;
          }
          navigation.navigate(tab);
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
  title: {
    ...Typography.title,
    color: Colors.ink,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.inkMuted,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Layout.radius,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.mist,
    gap: 10,
    marginTop:10
  },
  cardTitle: {
    ...Typography.subtitle,
    color: Colors.ink,
  },
  cardBody: {
    ...Typography.body,
    color: Colors.inkMuted,
  },
  cardMeta: {
    ...Typography.label,
    color: Colors.accentDark,
  },
  button: {
    backgroundColor: Colors.warm,
    paddingVertical: 14,
    marginTop:10,
    alignItems: 'center',
    borderRadius: 999,
  },
  buttonDisabled: {
    backgroundColor: Colors.mist,
  },
  buttonText: {
    ...Typography.subtitle,
    color: Colors.inkMuted,
    fontWeight: 800
  },
});
