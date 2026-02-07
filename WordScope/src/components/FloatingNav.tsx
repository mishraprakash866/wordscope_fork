import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

export type Tab = 'Home' | 'Daily' | 'Moods';

export const FloatingNav: React.FC<{ active: Tab; onNavigate: (tab: Tab) => void }> = ({
  active,
  onNavigate,
}) => {
  const tabs: Tab[] = ['Home', 'Daily', 'Moods'];
  const icons: Record<Tab, string> = {
    Home: 'home',
    Daily: 'calendar',
    Moods: 'grid',
  };
  return (
    <View style={styles.wrapper}>
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <Pressable
            key={tab}
            onPress={() => onNavigate(tab)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Ionicons
              name={icons[tab]}
              size={18}
              color={isActive ? Colors.inkMuted : Colors.warm}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: Colors.white,
    borderRadius: 999,
    padding: 6,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.mist,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 999,
    gap: 4,
  },
  tabActive: {
    backgroundColor: Colors.warm,
  },
  label: {
    ...Typography.label,
    color: Colors.inkMuted,
  },
  labelActive: {
    color: Colors.inkMuted,
  },
});
