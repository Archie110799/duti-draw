import React, { useCallback, useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Spacing, Radius } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';

const DEFAULT_PALETTE = [
  '#FF6B6B', '#FF8FAB', '#FFB6C1', '#FFD1DC',
  '#FFE66D', '#FFF3B0', '#BAFFC9', '#7DCEA0',
  '#A8D8EA', '#82C4E0', '#4A90D9', '#C3AED6',
  '#E8DAEF', '#F5CBA7', '#FDEBD0', '#FFFFFF',
  '#D5DBDB', '#AEB6BF', '#5D6D7E', '#2C3E50',
];

export type ColorPickerProps = {
  palette?: string[];
  selectedColor: string;
  recentColors?: string[];
  onSelectColor: (color: string) => void;
  columns?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const ColorPicker = React.memo(function ColorPicker({
  palette = DEFAULT_PALETTE,
  selectedColor,
  recentColors = [],
  onSelectColor,
  columns = 5,
  style,
  testID,
}: ColorPickerProps) {
  const c = useSemanticColors();

  const handlePress = useCallback(
    (color: string) => () => onSelectColor(color),
    [onSelectColor],
  );

  const uniqueRecent = useMemo(
    () => recentColors.filter((rc) => !palette.includes(rc)).slice(0, columns),
    [recentColors, palette, columns],
  );

  const renderSwatch = useCallback(
    (color: string) => {
      const isSelected = color.toLowerCase() === selectedColor.toLowerCase();
      return (
        <Pressable
          key={color}
          onPress={handlePress(color)}
          accessibilityRole="button"
          accessibilityLabel={`Color ${color}`}
          accessibilityState={{ selected: isSelected }}
          style={[
            styles.swatch,
            {
              backgroundColor: color,
              borderColor: isSelected ? c('primary') : c('borderLight'),
              borderWidth: isSelected ? 3 : 1,
            },
          ]}
        >
          {isSelected && (
            <View style={[styles.checkDot, { backgroundColor: getContrastColor(color) }]} />
          )}
        </Pressable>
      );
    },
    [selectedColor, c, handlePress],
  );

  return (
    <View style={[styles.container, style]} testID={testID}>
      {uniqueRecent.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { color: c('textSecondary') }]}>Recent</Text>
          <View style={[styles.grid, { gap: Spacing.sm }]}>
            {uniqueRecent.map(renderSwatch)}
          </View>
          <View style={[styles.divider, { backgroundColor: c('borderLight') }]} />
        </>
      )}
      <View style={[styles.grid, { gap: Spacing.sm }]}>
        {palette.map(renderSwatch)}
      </View>
    </View>
  );
});

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
});
