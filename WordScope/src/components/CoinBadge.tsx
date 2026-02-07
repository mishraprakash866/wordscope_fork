import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

export const CoinBadge: React.FC<{ coins: number; onPress?: () => void }> = ({
  coins,
  onPress,
}) => {
  return (
    <Pressable style={styles.badge} onPress={onPress}>
      <View style={styles.dot} />
      <Text style={styles.text}>{coins}</Text>
      <Text style={styles.plus}>+</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.mist,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#F4C84B',
  },
  text: {
    ...Typography.label,
    color: Colors.ink,
  },
  plus: {
    ...Typography.label,
    color: Colors.accentDark,
  },
});
