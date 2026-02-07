export type RootStackParamList = {
  Home: undefined;
  Moods: undefined;
  Category: { categoryId: string; mode: 'classic' | 'time' };
  Game: {
    puzzleId: string;
    categoryId?: string;
    title: string;
    size: number;
    words: string[];
    seconds?: number;
    mode: 'classic' | 'time';
  };
  Daily: undefined;
};
