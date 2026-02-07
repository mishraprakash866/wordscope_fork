import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Categories } from '../data/categories';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Layout } from '../theme/layout';
import { getRemoteConfig } from '../config/remoteConfig';
import { ModeToggle } from '../components/ModeToggle';
import { ScreenBackground } from '../components/ScreenBackground';
import { CoinBadge } from '../components/CoinBadge';
import { FloatingNav } from '../components/FloatingNav';
import { SettingsModal } from '../components/SettingsModal';
import { getCoins } from '../storage/user';

const getTimeSeconds = (size: number, multiplier: number) =>
  Math.max(90, Math.round(size * 12 * multiplier));

export const CategoryScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Category'>>();
  const { categoryId, mode } = route.params;

  const category = Categories.find(item => item.id === categoryId);
  if (!category) return null;

  const [multiplier, setMultiplier] = useState(
    getRemoteConfig().time_multiplier,
  );
  const [localMode, setLocalMode] = useState(mode);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [coins, setCoinsState] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setMultiplier(getRemoteConfig().time_multiplier);
  }, []);

  useEffect(() => {
    getCoins().then(setCoinsState);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getCoins().then(setCoinsState);
    }, []),
  );

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [localMode, fadeAnim, categoryId]);

  const puzzles = [...category.puzzles]
    .filter(puzzle =>
      localMode === 'classic' ? puzzle.difficulty <= 3 : puzzle.difficulty >= 3,
    )
    .sort((a, b) => a.difficulty - b.difficulty);

  const randomizedPuzzles =
    localMode === 'time'
      ? [...puzzles].sort(() => Math.random() - 0.5)
      : puzzles;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenBackground tint={category.color} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <Pressable
            style={styles.iconButton}
            onPress={() => setShowSettings(true)}
          >
            <Text style={styles.iconText}>⚙</Text>
          </Pressable>
          <CoinBadge coins={coins} />
        </View>
        <Text style={styles.title}>{category.name}</Text>
        <Text style={styles.subtitle}>{category.description}</Text>
        <View style={styles.modeRow}>
          <Text style={styles.modeLabel}>Difficulty</Text>
          <ModeToggle mode={localMode} onChange={setLocalMode} />
        </View>
        <Text style={styles.sectionTitle}>Puzzles</Text>
        <Animated.View
          style={[
            styles.list,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {randomizedPuzzles.map(puzzle => {
            const seconds =
              puzzle.seconds ?? getTimeSeconds(puzzle.size, multiplier);
            return (
              <Pressable
                key={puzzle.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate('Game', {
                    puzzleId: puzzle.id,
                    title: puzzle.title,
                    size: puzzle.size,
                    words: puzzle.words,
                    seconds: localMode === 'time' ? seconds : undefined,
                    mode: localMode,
                    categoryId: category.id,
                  })
                }
              >
                <Text style={styles.cardTitle}>{puzzle.title}</Text>
                <Text style={styles.cardBody}>
                  {puzzle.words.length} words · {puzzle.size}x{puzzle.size}
                </Text>
                <Text style={styles.cardMeta}>
                  {`Difficulty ${puzzle.difficulty} · ${
                    localMode === 'time' ? `${seconds}s time` : 'Easy mode'
                  }`}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>
        <SettingsModal
          visible={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </ScrollView>

      {/* <FloatingNav
        active="Moods"
        onNavigate={(tab) => {
          if (tab === 'Moods') return;
          navigation.navigate(tab);
        }}
      /> */}
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
    gap: 12,
  },
  title: {
    ...Typography.title,
    color: Colors.ink,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.inkMuted,
  },
  sectionTitle: {
    ...Typography.subtitle,
    color: Colors.ink,
    marginTop: 12,
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
  modeRow: {
    marginTop: 6,
    gap: 10,
  },
  modeLabel: {
    ...Typography.label,
    color: Colors.inkMuted,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Layout.radius,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.mist,
    gap: 6,
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
});
