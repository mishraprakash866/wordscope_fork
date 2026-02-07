import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing, LayoutChangeEvent } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

export const ModeToggle: React.FC<{
  mode: 'classic' | 'time';
  onChange: (mode: 'classic' | 'time') => void;
}> = ({ mode, onChange }) => {
  const translate = useRef(new Animated.Value(mode === 'classic' ? 0 : 1)).current;
  const [width, setWidth] = useState(0);

  useEffect(() => {
    Animated.timing(translate, {
      toValue: mode === 'classic' ? 0 : 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [mode, translate]);

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.wrapper} onLayout={onLayout}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.thumb,
          {
            width: Math.max(0, (width - 8) / 2),
            transform: [
              {
                translateX: translate.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.max(0, (width - 8) / 2)],
                }),
              },
            ],
          },
        ]}
      />
      {(['classic', 'time'] as const).map((item) => {
        const active = item === mode;
        return (
          <Pressable
            key={item}
            onPress={() => onChange(item)}
            style={styles.button}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {item === 'classic' ? 'Easy' : 'Hard'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.mist,
    borderRadius: 999,
    padding: 4,
    height: 44,
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '50%',
    backgroundColor: Colors.warm,
    borderRadius: 999,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 999,
  },
  label: {
    ...Typography.label,
    color: Colors.inkMuted,
  },
  labelActive: {
    color: Colors.inkMuted,
    fontWeight: 800
  },
});
