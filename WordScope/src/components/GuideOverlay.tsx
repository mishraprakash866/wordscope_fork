import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

export const GuideOverlay: React.FC<{
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
}> = ({ visible, title, body, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Got it</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  title: {
    ...Typography.subtitle,
    color: Colors.ink,
  },
  body: {
    ...Typography.body,
    color: Colors.inkMuted,
  },
  button: {
    marginTop: 4,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.accent,
    alignItems: 'center',
  },
  buttonText: {
    ...Typography.label,
    color: Colors.white,
  },
});
