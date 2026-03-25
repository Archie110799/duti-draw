import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameColorPhase } from '@/components/game/game-color-phase';
import { GameTracePhase } from '@/components/game/game-trace-phase';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { ModalDialog } from '@/components/ui/modal-dialog';
import { FloatingIconRail, HintBubble, LevelHeader, OrbIconButton } from '@/components/drawing';
import { LEVEL_COUNT, getLevelByNumber } from '@/constants/levels';
import { SemanticColors, type SemanticColorKey } from '@/constants/semantic-tokens';
import { buildSingleSymbolSvgXml, loadAnimalsSymbolSheetXml } from '@/lib/svgSymbols';
import { useSemanticColors } from '@/hooks/use-semantic-color';
import { Spacing } from '@/constants/spacing';
import * as Haptics from 'expo-haptics';

type Phase = 'trace' | 'color';

export default function DrawLevelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const _c = useSemanticColors();
  // Force the gameplay screen to match light reference screenshots.
  const c = ((key: SemanticColorKey) => SemanticColors.light[key]) satisfies (key: SemanticColorKey) => string;

  const levelNumber = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : NaN;
  }, [id]);

  const level = Number.isFinite(levelNumber) ? getLevelByNumber(levelNumber) : undefined;

  const [phase, setPhase] = useState<Phase>('trace');
  const [sheet, setSheet] = useState<string | null>(null);
  const [symbolXml, setSymbolXml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState(0);
  const [canTraceContinue, setCanTraceContinue] = useState(false);
  const [canColorFinish, setCanColorFinish] = useState(false);
  const [showTraceCongrats, setShowTraceCongrats] = useState(false);
  const [showColorCongrats, setShowColorCongrats] = useState(false);

  useEffect(() => {
    setPhase('trace');
    setCanTraceContinue(false);
    setCanColorFinish(false);
    setShowTraceCongrats(false);
    setShowColorCongrats(false);
  }, [levelNumber]);

  useEffect(() => {
    if (phase !== 'trace') return;
    if (!canTraceContinue) return;
    setShowTraceCongrats(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [canTraceContinue, phase]);

  useEffect(() => {
    if (phase !== 'color') return;
    if (!canColorFinish) return;
    setShowColorCongrats(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [canColorFinish, phase]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const xml = await loadAnimalsSymbolSheetXml();
        if (cancelled) return;
        setSheet(xml);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Không tải được SVG');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sheet || !level) return;
    try {
      setSymbolXml(buildSingleSymbolSvgXml(sheet, level.symbolId));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không build được symbol SVG');
    }
  }, [sheet, level]);

  const goNextLevel = () => {
    if (!level) return;
    if (level.levelNumber >= LEVEL_COUNT) {
      router.replace('/(tabs)');
      return;
    }
    router.replace(`/draw/${level.levelNumber + 1}`);
  };
  const goLevelPicker = () => {
    router.push('/(tabs)/draw');
  };

  const openSettings = () => {
    router.push('/modal');
  };

  if (!level) {
    return (
      <SafeAreaView style={styles.safe}>
        <ThemedView style={styles.center}>
          <ThemedText type="title">Level không hợp lệ</ThemedText>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
            <ThemedText type="link">Quay lại</ThemedText>
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <ThemedView style={styles.center}>
          <ThemedText>{error}</ThemedText>
          <Pressable onPress={() => router.back()}>
            <ThemedText type="link">Quay lại</ThemedText>
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!symbolXml) {
    return (
      <SafeAreaView style={styles.safe}>
        <ThemedView style={styles.center}>
          <ActivityIndicator />
          <ThemedText>Đang tải…</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c('background') }]}>
      <View style={styles.root}>
        <LevelHeader title={`LEVEL ${level.levelNumber}`} />
        <HintBubble
          label={level.animal ?? level.title}
          variant="accent"
          illustration={require('@/assets/images/react-logo.png')}
          style={{ borderColor: c('frost'), backgroundColor: c('frostLight') }}
        />

        <View style={[styles.stage, { backgroundColor: c('background') }]}>
          {phase === 'trace' ? (
            <GameTracePhase
              title={level.title}
              symbolSvgXml={symbolXml}
              compact
              resetToken={resetToken}
              onCanContinueChange={setCanTraceContinue}
              colors={c}
              onComplete={() => {
                setCanColorFinish(false);
                setPhase('color');
              }}
            />
          ) : (
            <GameColorPhase
              level={level}
              symbolSvgXml={symbolXml}
              compact
              resetToken={resetToken}
              onCanFinishChange={setCanColorFinish}
              colors={c}
              onComplete={goNextLevel}
            />
          )}
        </View>

        <FloatingIconRail side="left">
          <OrbIconButton icon="gearshape" accessibilityLabel="Settings" onPress={openSettings} />
          <OrbIconButton icon="paintbrush" accessibilityLabel="Pen tool" onPress={() => setPhase('trace')} />
          <OrbIconButton icon="crown" accessibilityLabel="VIP" onPress={() => {}} badge="VIP" />
        </FloatingIconRail>

        <FloatingIconRail side="right">
          <OrbIconButton
            icon="chevron.right"
            accessibilityLabel="Next"
            disabled={phase === 'trace' ? !canTraceContinue : !canColorFinish}
            onPress={() => {
              if (phase === 'trace') {
                setCanColorFinish(false);
                setPhase('color');
                return;
              }
              goNextLevel();
            }}
          />
          <OrbIconButton icon="square.grid.2x2" accessibilityLabel="Levels" onPress={goLevelPicker} />
          <OrbIconButton icon="nosign" accessibilityLabel="No Ads" onPress={() => {}} badge="NO" />
        </FloatingIconRail>
      </View>

      {/* AdBanner removed for clean gameplay */}
      <ModalDialog
        visible={showTraceCongrats && phase === 'trace'}
        title="Chúc mừng!"
        confirmLabel="Tiếp tục"
        cancelLabel="Ở lại"
        onCancel={() => setShowTraceCongrats(false)}
        onConfirm={() => {
          setShowTraceCongrats(false);
          setPhase('color');
        }}
        onDismiss={() => setShowTraceCongrats(false)}
      >
        <ThemedText>Bạn đã hoàn thành tracing. Sẵn sàng chuyển sang tô màu nhé.</ThemedText>
      </ModalDialog>

      <ModalDialog
        visible={showColorCongrats && phase === 'color'}
        title="Tuyệt vời!"
        confirmLabel="Sang level tiếp"
        cancelLabel="Ở lại"
        onCancel={() => setShowColorCongrats(false)}
        onConfirm={() => {
          setShowColorCongrats(false);
          goNextLevel();
        }}
        onDismiss={() => setShowColorCongrats(false)}
      >
        <ThemedText>Bạn đã tô xong rồi. Mình qua level tiếp theo nhé.</ThemedText>
      </ModalDialog>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  root: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  stage: {
    flex: 1,
    paddingBottom: Spacing.lg,
    justifyContent: 'center',
    borderRadius: 18,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
});
