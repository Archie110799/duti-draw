import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LEVEL_COUNT, LEVELS_FILE } from '@/constants/levels';

export default function HomeScreen() {
  const levels = LEVELS_FILE.levels ?? [];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A8D8EA', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/docs/elsa-1.png')}
          style={styles.heroImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Duti Draw</ThemedText>
        <ThemedText>Chọn level — tracing rồi tô màu.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">
          Levels ({levels.length}/{LEVEL_COUNT})
        </ThemedText>
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

      <ThemedView style={styles.stepContainer}>
        <Link href="/component-system">
          <ThemedText type="link">Component System</ThemedText>
        </Link>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    marginBottom: 4,
    gap: 6,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 14,
  },
  heroImage: {
    height: 230,
    width: 260,
    bottom: 0,
    right: 20,
    position: 'absolute',
    borderRadius: 20,
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
