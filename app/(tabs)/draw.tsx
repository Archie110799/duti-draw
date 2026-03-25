import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button } from '@/components/ui/button';
import { LEVEL_COUNT, LEVELS_FILE } from '@/constants/levels';
import { Spacing } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';

export default function DrawTabScreen() {
  const router = useRouter();
  const c = useSemanticColors();
  const levels = LEVELS_FILE.levels ?? [];
  const randomLevel = levels[Math.floor(Math.random() * Math.max(1, levels.length))];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: c('frostLight'), dark: c('surface') }}
      headerImage={<IconSymbol size={260} color={c('primary')} name="paintbrush" style={styles.headerIcon} />}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Play</ThemedText>
        <ThemedText>
          {levels.length}/{LEVEL_COUNT} levels • Tracing → Coloring
        </ThemedText>
        <ThemedView style={styles.ctaRow}>
          <Button title="Chơi ngay" onPress={() => router.push('/draw/1')} />
          <Button
            title="Ngẫu nhiên"
            variant="outlined"
            onPress={() => randomLevel && router.push(`/draw/${randomLevel.levelNumber}`)}
          />
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Chọn level</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.levelRow}>
          {levels.map((level) => (
            <Link key={level.levelNumber} href={`/draw/${level.levelNumber}`} asChild>
              <Pressable style={({ pressed }) => [styles.levelChip, pressed && styles.pressed]}>
                <ThemedText type="defaultSemiBold">{level.levelNumber}</ThemedText>
                <ThemedText style={styles.levelChipTitle} numberOfLines={1}>
                  {level.title}
                </ThemedText>
              </Pressable>
            </Link>
          ))}
        </ScrollView>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Danh sách</ThemedText>
        <ThemedView style={styles.levelList}>
          {levels.map((level) => (
            <Link key={level.levelNumber} href={`/draw/${level.levelNumber}`} asChild>
              <Pressable style={({ pressed }) => [styles.levelItem, pressed && styles.pressed]}>
                <ThemedText type="defaultSemiBold">
                  {level.levelNumber}. {level.title}
                </ThemedText>
                <ThemedText>
                  {level.symbolId} · {level.palette.length} màu
                </ThemedText>
              </Pressable>
            </Link>
          ))}
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    position: 'absolute',
    bottom: -18,
    right: 10,
    opacity: 0.22,
  },
  titleContainer: {
    marginBottom: 4,
    gap: 6,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 14,
  },
  levelRow: {
    gap: 10,
    paddingVertical: 4,
  },
  levelChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    minWidth: 88,
    alignItems: 'center',
    gap: 4,
  },
  levelChipTitle: {
    fontSize: 12,
    maxWidth: 100,
  },
  levelList: {
    gap: 8,
  },
  levelItem: {
    padding: 10,
    borderRadius: 12,
  },
  pressed: {
    opacity: 0.88,
  },
});

