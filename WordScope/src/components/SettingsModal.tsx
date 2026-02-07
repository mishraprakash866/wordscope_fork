import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Switch, Linking } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { getMusicEnabled, getSoundEnabled, setMusicEnabled, setSoundEnabled } from '../storage/user';

const PRIVACY_URL = 'https://example.com/privacy';

export const SettingsModal: React.FC<{ visible: boolean; onClose: () => void }> = ({
  visible,
  onClose,
}) => {
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(true);

  useEffect(() => {
    if (!visible) return;
    getSoundEnabled().then(setSound);
    getMusicEnabled().then(setMusic);
  }, [visible]);

  const toggleSound = async (value: boolean) => {
    setSound(value);
    await setSoundEnabled(value);
  };

  const toggleMusic = async (value: boolean) => {
    setMusic(value);
    await setMusicEnabled(value);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Sound Effects</Text>
            <Switch value={sound} onValueChange={toggleSound} />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Music</Text>
            <Switch value={music} onValueChange={toggleMusic} />
          </View>
          <Pressable style={styles.link} onPress={() => Linking.openURL(PRIVACY_URL)}>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Pressable>
          <Pressable style={styles.link} onPress={() => Linking.openURL('mailto:rupesh027shah@gmail.com')}>
            <Text style={styles.linkText}>Support</Text>
          </Pressable>
          <Pressable style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    gap: 12,
  },
  title: {
    ...Typography.subtitle,
    color: Colors.ink,
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
    paddingVertical: 6,
  },
  linkText: {
    ...Typography.label,
    color: Colors.accentDark,
  },
  close: {
    marginTop: 6,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.mist,
    alignItems: 'center',
  },
  closeText: {
    ...Typography.label,
    color: Colors.ink,
  },
});
