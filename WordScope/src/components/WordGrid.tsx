import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Layout } from '../theme/layout';
import { Grid } from '../game/wordSearch';

export type Cell = { row: number; col: number };

type Props = {
  grid: Grid;
  selectedPath: Cell[];
  foundPaths: { cells: Cell[]; color: string }[];
  onSelectionChange: (path: Cell[]) => void;
  onSelectionEnd: (path: Cell[]) => void;
  disabled?: boolean;
  fontScale?: number;
  debug?: boolean;
};

const cellKey = (cell: Cell) => `${cell.row}-${cell.col}`;

export const WordGrid: React.FC<Props> = ({
  grid,
  selectedPath,
  foundPaths,
  onSelectionChange,
  onSelectionEnd,
  disabled = false,
  fontScale = 0.5,
  debug = false,
}) => {
  const size = grid.length;
  const [layout, setLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const startCell = useRef<Cell | null>(null);
  const currentPathRef = useRef<Cell[]>([]);
  const wrapperRef = useRef<View>(null);
  const lastEndRef = useRef<Cell | null>(null);
  const [debugInfo, setDebugInfo] = useState<{ row: number; col: number; letter: string } | null>(null);

  const padding = 0;
  const gap = 0;
  const inner = Math.max(0, layout.width - padding * 2);
  const cellSize = size > 0 ? inner / size : 0;
  const cellSpan = cellSize + gap;
  const directions = useMemo(
    () => [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
    ],
    [],
  );

  const foundMap = useMemo(() => {
    const map = new Map<string, string>();
    foundPaths.forEach((entry) =>
      entry.cells.forEach((cell) => map.set(cellKey(cell), entry.color)),
    );
    return map;
  }, [foundPaths]);

  const selectedSet = useMemo(() => {
    const set = new Set<string>();
    selectedPath.forEach((cell) => set.add(cellKey(cell)));
    return set;
  }, [selectedPath]);

  const getCellFromTouch = (x: number, y: number): Cell | null => {
    if (!layout.width || !layout.height || cellSpan <= 0) return null;
    const localX = x - padding;
    const localY = y - padding;
    if (localX < 0 || localY < 0) return null;
    const col = Math.floor(localX / cellSpan);
    const row = Math.floor(localY / cellSpan);
    if (row < 0 || col < 0 || row >= size || col >= size) return null;
    return { row, col };
  };

  const buildSnappedPath = (start: Cell, end: Cell) => {
    const dx = end.col - start.col;
    const dy = end.row - start.row;
    if (dx === 0 && dy === 0) return [start];
    const len = Math.hypot(dx, dy) || 1;
    let best = directions[0];
    let bestScore = -Infinity;
    directions.forEach((dir) => {
      const score = (dx * dir.dx + dy * dir.dy) / len;
      if (score > bestScore) {
        bestScore = score;
        best = dir;
      }
    });
    let steps = Math.max(Math.abs(dx), Math.abs(dy));
    while (
      start.row + best.dy * steps >= size ||
      start.row + best.dy * steps < 0 ||
      start.col + best.dx * steps >= size ||
      start.col + best.dx * steps < 0
    ) {
      steps -= 1;
      if (steps <= 0) return [start];
    }
    const path: Cell[] = [];
    for (let i = 0; i <= steps; i += 1) {
      path.push({ row: start.row + best.dy * i, col: start.col + best.dx * i });
    }
    return path;
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (evt) => {
          if (disabled) return;
          const { locationX, locationY } = evt.nativeEvent;
          const cell = getCellFromTouch(locationX, locationY);
          if (cell) {
            startCell.current = cell;
            currentPathRef.current = [cell];
            onSelectionChange([cell]);
            if (debug) {
              setDebugInfo({ row: cell.row, col: cell.col, letter: grid[cell.row][cell.col] });
            }
          }
        },
        onPanResponderMove: (evt) => {
          if (disabled) return;
          if (!startCell.current) return;
          const { locationX, locationY } = evt.nativeEvent;
          const cell = getCellFromTouch(locationX, locationY);
          if (!cell) return;
          if (lastEndRef.current && lastEndRef.current.row === cell.row && lastEndRef.current.col === cell.col) {
            return;
          }
          lastEndRef.current = cell;
          const path = buildSnappedPath(startCell.current, cell);
          currentPathRef.current = path;
          if (debug) {
            setDebugInfo({ row: cell.row, col: cell.col, letter: grid[cell.row][cell.col] });
          }
          // Throttle visual updates to reduce flicker on Android
          requestAnimationFrame(() => {
            onSelectionChange(path);
          });
        },
        onPanResponderRelease: () => {
          if (currentPathRef.current.length) {
            onSelectionEnd(currentPathRef.current);
          }
          currentPathRef.current = [];
          startCell.current = null;
          lastEndRef.current = null;
        },
      }),
    [
      cellSize,
      layout.width,
      layout.height,
      size,
      onSelectionChange,
      onSelectionEnd,
      disabled,
      padding,
      cellSpan,
      directions,
    ],
  );

  const onLayout = (event: LayoutChangeEvent) => {
    setLayout(event.nativeEvent.layout);
  };

  return (
    <View ref={wrapperRef} style={styles.wrapper} onLayout={onLayout} {...panResponder.panHandlers}>
      {debug && debugInfo ? (
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>{`row ${debugInfo.row} col ${debugInfo.col} = ${debugInfo.letter}`}</Text>
        </View>
      ) : null}
      {grid.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((letter, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            const foundColor = foundMap.get(key);
            const isSelected = selectedSet.has(key);
            return (
              <View
                key={key}
                style={[
                  styles.cell,
                  {
                    width: cellSize,
                    height: cellSize,
                    borderRadius: Math.max(6, cellSize * 0.2),
                  },
                  foundColor && { backgroundColor: foundColor },
                  isSelected && styles.cellSelected,
                ]}
              >
                <Text style={[styles.letter, { fontSize: Math.max(14, cellSize * fontScale) }]}>{letter}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.paper,
    borderRadius: Layout.radius,
    padding: 0,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  cellFound: {
    backgroundColor: Colors.accent,
  },
  cellSelected: {
    backgroundColor: Colors.warm,
  },
  letter: {
    fontWeight: '700',
    color: Colors.ink,
  },
  debugBox: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 10,
  },
  debugText: {
    fontSize: 12,
    color: Colors.white,
  },
});
