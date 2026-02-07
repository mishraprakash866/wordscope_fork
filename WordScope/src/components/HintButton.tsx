import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

export const HintButton: React.FC<{ hints: number; onPress: () => void }> = ({
  hints,
  onPress,
}) => {
  return (
    <Pressable style={styles.button} onPress={onPress} disabled={hints <= 0}>
      <View style={styles.dot} />
      <Text style={styles.label}>Hint</Text>
      <Text style={styles.count}>{hints}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.paper,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.mist,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: Colors.cool,
  },
  label: {
    ...Typography.label,
    color: Colors.ink,
  },
  count: {
    ...Typography.label,
    color: Colors.inkMuted,
  },
});
