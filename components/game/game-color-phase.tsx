import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { SvgXml } from 'react-native-svg';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { LevelConfig } from '@/constants/levels';
import { Spacing } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';
import type { SemanticColorKey } from '@/constants/semantic-tokens';

type Props = {
  level: LevelConfig;
  symbolSvgXml: string;
  onComplete: () => void;
  compact?: boolean;
  resetToken?: number;
  onCanFinishChange?: (canFinish: boolean) => void;
  colors?: (key: SemanticColorKey) => string;
};

/**
 * Phase 2 — coloring MVP:
 * Regions are placeholders in JSON (no SVG paths yet), so we assign colors per region id.
 * This matches the product flow: pick a palette color, then assign to each body part.
 */
export function GameColorPhase({
  level,
  symbolSvgXml,
  onComplete,
  compact = false,
  resetToken = 0,
  onCanFinishChange,
  colors,
}: Props) {
  const themeC = useSemanticColors();
  const c = colors ?? themeC;
  const [selectedColor, setSelectedColor] = useState<string>(level.palette[0] ?? '#111111');
  const [regionColor, setRegionColor] = useState<Record<string, string>>({});
  const lastFilledIdxRef = useRef(0);

  const hasSvgRegions = useMemo(() => level.regions.some((r) => typeof r.path === 'string' && r.path.length > 0), [level.regions]);

  const allDone = useMemo(() => {
    return level.regions.every((r) => Boolean(regionColor[r.id]));
  }, [level.regions, regionColor]);
  React.useEffect(() => {
    onCanFinishChange?.(allDone);
  }, [allDone, onCanFinishChange]);

  const assignRegion = useCallback(
    (regionId: string) => {
      setRegionColor((prev) => ({ ...prev, [regionId]: selectedColor }));
      Haptics.selectionAsync().catch(() => {});
    },
    [selectedColor]
  );

  const fillNextRegion = useCallback(() => {
    setRegionColor((prev) => {
      const next = { ...prev };
      const regions = level.regions;
      if (regions.length === 0) return next;

      // Start from last index and find next unfilled region
      let idx = Math.max(0, Math.min(regions.length - 1, lastFilledIdxRef.current));
      for (let step = 0; step < regions.length; step++) {
        const r = regions[idx];
        if (r && !next[r.id]) {
          next[r.id] = selectedColor;
          lastFilledIdxRef.current = idx + 1;
          return next;
        }
        idx = (idx + 1) % regions.length;
      }
      return next;
    });
    Haptics.selectionAsync().catch(() => {});
  }, [level.regions, selectedColor]);

  const handleFinish = useCallback(() => {
    if (!allDone) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onComplete();
  }, [allDone, onComplete]);

  const handleReset = useCallback(() => {
    setRegionColor({});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const handleAutoFill = useCallback(() => {
    setRegionColor((prev) => {
      const next = { ...prev };
      level.regions.forEach((r) => {
        if (!next[r.id]) next[r.id] = selectedColor;
      });
      return next;
    });
    Haptics.selectionAsync().catch(() => {});
  }, [level.regions, selectedColor]);

  const paintedCount = useMemo(() => {
    return level.regions.filter((r) => Boolean(regionColor[r.id])).length;
  }, [level.regions, regionColor]);

  React.useEffect(() => {
    setRegionColor({});
    setSelectedColor(level.palette[0] ?? '#111111');
    lastFilledIdxRef.current = 0;
  }, [resetToken, level.palette]);

  const renderSvgRegionStage = useCallback(
    (opts: { compact: boolean }) => {
      return (
        <View style={opts.compact ? styles.compactPreview : styles.preview}>
          <Svg width="100%" height="100%" viewBox="0 0 512 512">
            <G>
              {level.regions.map((r) => {
                if (!r.path) return null;
                const filled = regionColor[r.id];
                // Important: Path press handling in react-native-svg is unreliable when fill is fully transparent.
                // Use a near-transparent fill to keep hit-testing precise (no fat stroke overlaps).
                const fill = filled ?? '#000000';
                const fillOpacity = filled ? 1 : 0.01;
                const stroke = filled ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0.10)';
                const strokeWidth = filled ? 0 : 2;
                return (
                  <Path
                    key={r.id}
                    d={r.path}
                    fill={fill}
                    fillOpacity={fillOpacity}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    onPress={() => assignRegion(r.id)}
                    accessibilityLabel={`Paint region ${r.label}`}
                  />
                );
              })}
            </G>
          </Svg>

          {/* Outline on top (pointerEvents none so taps go to regions). */}
          <View style={styles.outlineOverlay} pointerEvents="none">
            <SvgXml xml={symbolSvgXml} width="100%" height="100%" />
          </View>
        </View>
      );
    },
    [assignRegion, level.regions, regionColor, symbolSvgXml]
  );

  if (compact) {
    const palette = level.palette.slice(0, 3);
    return (
      <ThemedView style={styles.compactRoot}>
        <Pressable
          onPress={hasSvgRegions ? undefined : fillNextRegion}
          accessibilityRole="button"
          accessibilityLabel="Tap to color"
          style={styles.compactStage}
        >
          {hasSvgRegions ? renderSvgRegionStage({ compact: true }) : (
            <View style={styles.compactPreview}>
              <SvgXml xml={symbolSvgXml} width="100%" height="100%" />
            </View>
          )}
        </Pressable>

        <View style={styles.compactPaletteBar} pointerEvents="box-none">
          <View style={styles.compactPaletteRow}>
            {palette.map((colorHex) => {
              const selected = colorHex === selectedColor;
              return (
                <Pressable
                  key={colorHex}
                  onPress={() => setSelectedColor(colorHex)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select color ${colorHex}`}
                  style={[
                    styles.swatch,
                    styles.swatchCompact,
                    { backgroundColor: colorHex, borderColor: selected ? c('textPrimary') : c('borderLight') },
                    selected && styles.swatchSelected,
                  ]}
                />
              );
            })}
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.root}>
      <ThemedText type="subtitle">Phần 2 — Tô màu</ThemedText>
      <ThemedText>Chọn màu rồi chạm từng vùng để tô. Sai cũng không sao, bạn có thể xóa và tô lại ngay.</ThemedText>

      {hasSvgRegions ? (
        renderSvgRegionStage({ compact: false })
      ) : (
        <Pressable onPress={undefined} style={styles.preview}>
          <SvgXml xml={symbolSvgXml} width="100%" height="100%" />
        </Pressable>
      )}

      <ThemedText type="defaultSemiBold">Palette</ThemedText>
      <View style={styles.paletteRow}>
        {level.palette.map((colorHex) => {
          const selected = colorHex === selectedColor;
          return (
            <Pressable
              key={colorHex}
              onPress={() => setSelectedColor(colorHex)}
              accessibilityRole="button"
              accessibilityLabel={`Select color ${colorHex}`}
              style={[
                styles.swatch,
                { backgroundColor: colorHex },
                selected && styles.swatchSelected,
                selected && { borderColor: c('primary') },
              ]}
            />
          );
        })}
      </View>

      <ThemedText type="defaultSemiBold">Vùng</ThemedText>
      <ThemedText>
        Đã tô: <ThemedText type="defaultSemiBold">{paintedCount}</ThemedText>/{level.regions.length}
      </ThemedText>
      <View style={styles.regionList}>
        {level.regions.map((r) => {
          const filled = regionColor[r.id];
          return (
            <Pressable
              key={r.id}
              onPress={() => assignRegion(r.id)}
              style={[styles.regionRow, { borderColor: c('border') }]}
              accessibilityRole="button"
              accessibilityLabel={`Paint region ${r.label}`}>
              <ThemedText type="defaultSemiBold">{r.label}</ThemedText>
              <View
                style={[
                  styles.regionSwatch,
                  { borderColor: c('border') },
                  filled ? { backgroundColor: filled } : styles.regionSwatchEmpty,
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actionRow}>
        <Button title="Xóa hết" variant="outlined" onPress={handleReset} accessibilityLabel="Reset coloring" />
        <Button title="Tô nhanh" variant="text" onPress={handleAutoFill} accessibilityLabel="Auto fill remaining" />
      </View>

      <Button
        title="Hoàn thành level"
        variant="contained"
        disabled={!allDone}
        onPress={handleFinish}
        accessibilityLabel="Finish level"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.md,
  },
  compactRoot: {
    flex: 1,
    justifyContent: 'center',
  },
  compactStage: {
    flex: 1,
    justifyContent: 'center',
  },
  compactPreview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 18,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  outlineOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  compactPaletteBar: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  compactPaletteRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  swatch: {
    width: 76,
    height: 76,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchCompact: {
    width: 110,
    height: 110,
    borderRadius: 26,
    borderWidth: 3.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  swatchSelected: {
    borderColor: '#2B4F6E',
  },
  regionList: {
    gap: Spacing.sm,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  regionSwatch: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  regionSwatchEmpty: {
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
