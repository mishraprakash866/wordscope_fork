import React, { useEffect, useRef, useState } from 'react';
import {
  StatusBar,
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { NavigationContainer, NavigationState } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import mobileAds from 'react-native-google-mobile-ads';
import { enableScreens } from 'react-native-screens';
import analytics from '@react-native-firebase/analytics';
import { RootStackParamList } from './src/types/navigation';
import { HomeScreen } from './src/screens/HomeScreen';
import { MoodsScreen } from './src/screens/MoodsScreen';
import { CategoryScreen } from './src/screens/CategoryScreen';
import { GameScreen } from './src/screens/GameScreen';
import { DailyChallengeScreen } from './src/screens/DailyChallengeScreen';
import { Colors } from './src/theme/colors';
import { initRemoteConfig } from './src/config/remoteConfig';
import { FloatingNav } from './src/components/FloatingNav';
import { navigate, navigationRef } from './src/navigation/RootNavigation';
import { Tab } from './src/components/FloatingNav';

const Stack = createNativeStackNavigator<RootStackParamList>();
enableScreens();

const App = () => {
  const [booting, setBooting] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('Home');
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    mobileAds()
      .initialize()
      .catch(() => null);
    initRemoteConfig().catch(() => null);
    analytics()
      .setAnalyticsCollectionEnabled(true)
      .catch(() => null);
    const timer = setTimeout(() => setBooting(false), 900);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!booting) return;
    Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 900,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
    ).start();
  }, [booting, progress]);

  if (booting) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashTitle}>WordScope</Text>
        <Text style={styles.splashSubtitle}>Loading...</Text>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['10%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.paper} />
      <NavigationContainer
        onStateChange={(state: Readonly<NavigationState> | undefined) => {
          const currentRoute = state ? state.routes[state.index] : undefined;
          if (currentRoute) {
            setActiveTab(currentRoute.name as Tab);
          }
        }}
        ref={navigationRef}
      >
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            headerStyle: { backgroundColor: Colors.paper },
            headerShadowVisible: false,
            headerTintColor: Colors.ink,
          }}
        >
          <Stack.Group screenOptions={{ animation: 'fade' }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Moods" component={MoodsScreen} />
            <Stack.Screen name="Daily" component={DailyChallengeScreen} />
          </Stack.Group>
          <Stack.Group screenOptions={{ animation: 'slide_from_bottom' }}>
            <Stack.Screen name="Category" component={CategoryScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
          </Stack.Group>
        </Stack.Navigator>
        <FloatingNav
          active={activeTab}
          onNavigate={tab => {
            navigate(tab);
          }}
        />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#101725',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  splashTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  splashSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  progressTrack: {
    width: 180,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#F4C84B',
  },
});

export default App;
