import React from 'react';
import { View, StyleSheet } from 'react-native';

export const ScreenBackground: React.FC<{ tint: string }> = ({ tint }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.glow, { backgroundColor: tint }]} />
      <View style={[styles.blob, styles.blobTop, { backgroundColor: tint }]} />
      <View style={[styles.blob, styles.blobBottom, { backgroundColor: tint }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 999,
    opacity: 0.18,
    top: -120,
    right: -100,
  },
  blob: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
    opacity: 0.12,
  },
  blobTop: {
    top: 120,
    left: -60,
  },
  blobBottom: {
    bottom: -60,
    right: 20,
  },
});
