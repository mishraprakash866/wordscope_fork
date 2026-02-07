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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Categories } from '../data/categories';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Layout } from '../theme/layout';
import { ModeToggle } from '../components/ModeToggle';
import { ScreenBackground } from '../components/ScreenBackground';
import { CoinBadge } from '../components/CoinBadge';
import { FloatingNav } from '../components/FloatingNav';
import { SettingsModal } from '../components/SettingsModal';
import { GuideOverlay } from '../components/GuideOverlay';
import { getCoins } from '../storage/user';
import { getGuideSeen, setGuideSeen } from '../storage/user';

export const MoodsScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [mode, setMode] = useState<'classic' | 'time'>('classic');
  const [order, setOrder] = useState(Categories);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [coins, setCoinsState] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    getCoins().then(setCoinsState);
  }, []);

  useEffect(() => {
    getGuideSeen('moods').then(seen => setShowGuide(!seen));
  }, []);

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [mode, fadeAnim]);

  useEffect(() => {
    if (mode === 'classic') {
      setOrder(Categories);
      return;
    }
    const shuffled = [...Categories];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setOrder(shuffled);
  }, [mode]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenBackground tint={Colors.cool} />
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

        <View style={styles.modeRow}>
          <View>
            <Text style={styles.sectionTitle}>Choose Difficulty</Text>
            <Text style={styles.sectionHint}>
              {mode === 'time'
                ? 'Hard mode shuffles moods.'
                : 'Easy mode keeps the flow.'}
            </Text>
          </View>
          <ModeToggle mode={mode} onChange={setMode} />
        </View>

        <Text style={styles.sectionTitle}>Moods</Text>
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
            gap: 12,
          }}
        >
          {order.map(category => (
            <Pressable
              key={category.id}
              style={[styles.card, { borderColor: category.color }]}
              onPress={() =>
                navigation.navigate('Category', {
                  categoryId: category.id,
                  mode,
                })
              }
            >
              <View
                style={[
                  styles.gradientBar,
                  { backgroundColor: category.color },
                ]}
              />
              <View
                style={[
                  styles.illustration,
                  styles.illustrationTop,
                  { borderColor: category.color },
                ]}
              />
              <View
                style={[
                  styles.illustration,
                  styles.illustrationBottom,
                  { borderColor: category.color },
                ]}
              />
              <View style={styles.cardInner}>
                <Text style={styles.cardMood}>{category.mood}</Text>
                <Text style={styles.cardTitle}>{category.name}</Text>
                <Text style={styles.cardBody}>{category.description}</Text>
              </View>
            </Pressable>
          ))}
        </Animated.View>
      </ScrollView>

      {/* <FloatingNav
        active="Moods"
        onNavigate={(tab) => {
          if (tab === 'Moods') return;
          navigation.navigate(tab);
        }}
      /> */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <GuideOverlay
        visible={showGuide}
        title="Easy vs Hard"
        body="Easy mode gives a relaxed timer and simpler grids. Hard mode tightens the timer and shuffles moods for tougher play."
        onClose={() => {
          setShowGuide(false);
          setGuideSeen('moods');
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
  modeRow: {
    gap: 12,
  },
  sectionTitle: {
    ...Typography.subtitle,
    color: Colors.ink,
  },
  sectionHint: {
    ...Typography.label,
    color: Colors.inkMuted,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Layout.radius,
    padding: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  gradientBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 22,
    opacity: 0.9,
  },
  illustration: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 18,
    borderWidth: 2,
    opacity: 0.25,
  },
  illustrationTop: {
    top: 8,
    right: 12,
    transform: [{ rotate: '12deg' }],
  },
  illustrationBottom: {
    bottom: -8,
    right: 40,
    transform: [{ rotate: '-8deg' }],
  },
  cardInner: {
    gap: 4,
    paddingTop: 10,
  },
  cardMood: {
    ...Typography.label,
    color: Colors.inkMuted,
  },
  cardTitle: {
    ...Typography.subtitle,
    color: Colors.ink,
  },
  cardBody: {
    ...Typography.body,
    color: Colors.inkMuted,
  },
});
