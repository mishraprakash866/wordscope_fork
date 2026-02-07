import { ThemePacks, buildDailyPuzzle, buildPuzzlesForTheme } from './wordBank';

export type Mode = 'classic' | 'time';

export type Puzzle = ReturnType<typeof buildPuzzlesForTheme>[number];

export type Category = {
  id: string;
  name: string;
  mood: string;
  description: string;
  color: string;
  puzzles: Puzzle[];
};

export const Categories: Category[] = ThemePacks.map((theme) => ({
  id: theme.id,
  name: theme.name,
  mood: theme.mood,
  description: theme.description,
  color: theme.color,
  puzzles: buildPuzzlesForTheme(theme),
}));

export const getDailyPuzzle = (date: Date) => buildDailyPuzzle(date);
