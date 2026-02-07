import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

export const WordList: React.FC<{
  words: string[];
  found: string[];
  colors?: Record<string, string>;
}> = ({ words, found, colors = {} }) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Words</Text>
      <View style={styles.list}>
        {words.map((word) => {
          const isFound = found.includes(word);
          const color = colors[word];
          return (
            <View
              key={word}
              style={[
                styles.pill,
                isFound && styles.pillFound,
                isFound && color ? { backgroundColor: color } : null,
              ]}
            >
              <Text style={[styles.word, isFound && styles.wordFound]}>{word}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  title: {
    ...Typography.subtitle,
    color: Colors.ink,
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.mist,
  },
  pillFound: {
    backgroundColor: Colors.accent,
  },
  word: {
    ...Typography.label,
    color: Colors.inkMuted,
  },
  wordFound: {
    color: Colors.white,
  },
});
