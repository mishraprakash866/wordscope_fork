import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  Linking,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { ScreenBackground } from '../components/ScreenBackground';
import {
  getMusicEnabled,
  getSoundEnabled,
  setMusicEnabled,
  setSoundEnabled,
} from '../storage/user';
import { FloatingNav } from '../components/FloatingNav';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

const PRIVACY_URL = 'https://example.com/privacy';

export const SettingsScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(true);

  useEffect(() => {
    getSoundEnabled().then(setSound);
    getMusicEnabled().then(setMusic);
  }, []);

  const toggleSound = async (value: boolean) => {
    setSound(value);
    await setSoundEnabled(value);
  };

  const toggleMusic = async (value: boolean) => {
    setMusic(value);
    await setMusicEnabled(value);
  };

  return (
    <View style={styles.container}>
      <ScreenBackground tint={Colors.cool} />
      <Text style={styles.title}>Settings</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Sound Effects</Text>
          <Switch value={sound} onValueChange={toggleSound} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Music</Text>
          <Switch value={music} onValueChange={toggleMusic} />
        </View>
      </View>
      <Pressable
        style={styles.link}
        onPress={() => Linking.openURL(PRIVACY_URL)}
      >
        <Text style={styles.linkText}>Privacy Policy</Text>
      </Pressable>
      <Pressable
        style={styles.link}
        onPress={() => Linking.openURL('mailto:rupesh027shah@gmail.com')}
      >
        <Text style={styles.linkText}>Support</Text>
      </Pressable>
      {/* <FloatingNav active="Settings" onNavigate={(tab) => navigation.navigate(tab)} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.paper,
    padding: 20,
    gap: 12,
  },
  title: {
    ...Typography.title,
    color: Colors.ink,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.mist,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...Typography.body,
    color: Colors.ink,
  },
  link: {
    paddingVertical: 12,
  },
  linkText: {
    ...Typography.label,
    color: Colors.accentDark,
  },
});
