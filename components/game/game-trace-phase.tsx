import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';
import type { SemanticColorKey } from '@/constants/semantic-tokens';
import { parseSvgOutline, samplePathToPolyline } from '@/lib/svgOutline';

type Props = {
  title: string;
  symbolSvgXml: string;
  onComplete: () => void;
  compact?: boolean;
  resetToken?: number;
  onCanContinueChange?: (canContinue: boolean) => void;
  colors?: (key: SemanticColorKey) => string;
};

/**
 * Phase 1 — tracing MVP:
 * User drags along a dotted guide derived from the animal outline SVG path.
 * This matches the gameplay spec: trace the outline from start to end with light snapping.
 */
export function GameTracePhase({
  title,
  symbolSvgXml,
  onComplete,
  compact = false,
  resetToken = 0,
  onCanContinueChange,
  colors,
}: Props) {
  const themeC = useSemanticColors();
  const c = colors ?? themeC;
  const [layout, setLayout] = useState({ w: 1, h: 1 });
  const [progress, setProgress] = useState(0); // 0..1
  const [pen, setPen] = useState<{ x: number; y: number } | null>(null);

  const currentIdxRef = useRef(0);

  useEffect(() => {
    setProgress(0);
    currentIdxRef.current = 0;
    setPen(null);
  }, [resetToken]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ w: Math.max(1, width), h: Math.max(1, height) });
  }, []);

  const guideW = layout.w;
  const guideH = layout.h;

  const guideData = useMemo(() => {
    const outline = parseSvgOutline(symbolSvgXml);
    if (!outline.paths.length) return null;

    // Pick the main outline by length (usually the outer body shape).
    // This avoids accidentally selecting tiny facial feature paths like "M210 230h0".
    let bestD: string | null = null;
    let bestPoly: ReturnType<typeof samplePathToPolyline> | null = null;
    for (const p of outline.paths) {
      if (!p.d) continue;
      try {
        const poly = samplePathToPolyline(p.d, 12);
        if (!bestPoly || poly.totalLength > bestPoly.totalLength) {
          bestD = p.d;
          bestPoly = poly;
        }
      } catch {
        // Ignore invalid path segments.
      }
    }
    if (!bestD || !bestPoly) return null;

    // Fit viewBox to square canvas area.
    const vb = outline.viewBox;
    const pad = 14;
    const targetW = Math.max(1, guideW - pad * 2);
    const targetH = Math.max(1, guideH - pad * 2);
    const s = Math.min(targetW / vb.width, targetH / vb.height);
    const offX = (guideW - vb.width * s) / 2 - vb.minX * s;
    const offY = (guideH - vb.height * s) / 2 - vb.minY * s;

    const points = bestPoly.points.map((p) => ({ x: p.x * s + offX, y: p.y * s + offY }));
    const transform = `translate(${offX.toFixed(3)} ${offY.toFixed(3)}) scale(${s.toFixed(6)})`;

    return {
      points,
      d: bestD,
      totalLength: bestPoly.totalLength,
      transform,
    };
  }, [guideH, guideW, symbolSvgXml]);

  const guidePoints = useMemo(() => {
    // Fallback to a simple demo curve if SVG parsing fails.
    if (guideData?.points?.length) return guideData.points;
    const w = guideW;
    const h = guideH;
    const start = { x: w * 0.22, y: h * 0.44 };
    const c1 = { x: w * 0.26, y: h * 0.30 };
    const c2 = { x: w * 0.40, y: h * 0.56 };
    const mid = { x: w * 0.52, y: h * 0.55 };
    const c3 = { x: w * 0.62, y: h * 0.54 };
    const c4 = { x: w * 0.70, y: h * 0.62 };
    const end = { x: w * 0.78, y: h * 0.56 };

    const sampleCubic = (p0: any, p1: any, p2: any, p3: any, t: number) => {
      const u = 1 - t;
      const tt = t * t;
      const uu = u * u;
      const uuu = uu * u;
      const ttt = tt * t;
      return {
        x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
        y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
      };
    };

    const pts: { x: number; y: number }[] = [];
    const segs = 42;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      pts.push(sampleCubic(start, c1, c2, mid, t));
    }
    for (let i = 1; i <= segs; i++) {
      const t = i / segs;
      pts.push(sampleCubic(mid, c3, c4, end, t));
    }
    return pts;
  }, [guideData, guideH, guideW]);

  const tolerancePx = Math.max(16, Math.min(layout.w, layout.h) * 0.05);

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const x = evt.nativeEvent.locationX;
        const y = evt.nativeEvent.locationY;
        setPen({ x, y });
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const y = evt.nativeEvent.locationY;
        setPen({ x, y });

        // Snap tracking: advance along dotted guide when finger is close enough.
        const pts = guidePoints;
        const startIdx = currentIdxRef.current;
        let bestIdx = -1;
        let bestD2 = Infinity;
        const window = 10;
        const from = Math.max(0, startIdx - 2);
        const to = Math.min(pts.length - 1, startIdx + window);
        for (let i = from; i <= to; i++) {
          const dx = pts[i].x - x;
          const dy = pts[i].y - y;
          const d2 = dx * dx + dy * dy;
          if (d2 < bestD2) {
            bestD2 = d2;
            bestIdx = i;
          }
        }
        if (bestIdx >= 0 && Math.sqrt(bestD2) <= tolerancePx) {
          currentIdxRef.current = Math.max(startIdx, bestIdx);
          setProgress(currentIdxRef.current / Math.max(1, pts.length - 1));
        }
      },
      onPanResponderRelease: () => {
        setPen(null);
      },
    });
  }, [guidePoints, tolerancePx]);

  const canContinue = progress >= 0.95;
  useEffect(() => {
    onCanContinueChange?.(canContinue);
  }, [canContinue, onCanContinueChange]);

  const handleContinue = useCallback(() => {
    if (!canContinue) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onComplete();
  }, [canContinue, onComplete]);

  return (
    <ThemedView style={styles.root}>
      {!compact ? (
        <>
          <ThemedText type="subtitle">Phần 1 — Tracing</ThemedText>
          <ThemedText>
            Kéo ngón tay theo đường chấm để hoàn thành:{' '}
            <ThemedText type="defaultSemiBold">{title}</ThemedText>
          </ThemedText>
        </>
      ) : null}

      <View style={styles.canvasWrap} onLayout={onLayout}>
        <View
          style={[
            styles.overlay,
            {
              backgroundColor: c('background'),
              borderColor: 'transparent',
            },
          ]}
          {...panResponder.panHandlers}>
          {/* Faint outline preview underneath the dotted guide */}
          <View style={styles.previewUnderlay} pointerEvents="none">
            <SvgXml xml={symbolSvgXml} width="100%" height="100%" opacity={0.18} />
          </View>

          <SvgXml
            xml={`<svg xmlns="http://www.w3.org/2000/svg" width="${layout.w}" height="${layout.h}" viewBox="0 0 ${layout.w} ${layout.h}">
              <rect x="0" y="0" width="${layout.w}" height="${layout.h}" fill="transparent" />
              ${
                (() => {
                  // Prefer rendering progress along the actual SVG path.
                  if (guideData?.d && Number.isFinite(guideData.totalLength) && guideData.totalLength > 0 && guideData.transform) {
                    const L = guideData.totalLength;
                    const p = Math.max(0, Math.min(1, progress));
                    const a = (p * L).toFixed(2);
                    const b = Math.max(0, L - p * L).toFixed(2);
                    return `<g transform="${guideData.transform}">
                      <path d="${guideData.d}"
                        fill="none"
                        stroke="#111111"
                        stroke-width="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-dasharray="${a} ${b}"
                      />
                    </g>`;
                  }

                  // Fallback: draw progress along sampled polyline.
                  const doneIdx = Math.max(0, Math.min(guidePoints.length - 1, Math.floor(progress * (guidePoints.length - 1))));
                  if (doneIdx < 1) return '';
                  const pts = guidePoints.slice(0, doneIdx + 1);
                  const d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)} ` + pts
                    .slice(1)
                    .map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
                    .join(' ');
                  return `<path d="${d}" fill="none" stroke="#111111" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />`;
                })()
              }
              ${
                (() => {
                  if (!guideData?.d || !guideData?.transform) return '';
                  // Render the *actual* SVG path as a dotted guide so it matches the vector exactly.
                  // Dots: short dash + long gap, with round caps to look like circles.
                  return `<g transform="${guideData.transform}">
                    <path d="${guideData.d}"
                      fill="none"
                      stroke="#111111"
                      stroke-width="10"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-dasharray="0.01 26"
                      opacity="0.55"
                    />
                  </g>`;
                })()
              }
              <g>
                ${
                  (() => {
                    const end = guidePoints[guidePoints.length - 1];
                    const s = 10;
                    const stroke = "#111111";
                    return `<line x1="${(end.x - s).toFixed(2)}" y1="${(end.y - s).toFixed(2)}" x2="${(end.x + s).toFixed(2)}" y2="${(end.y + s).toFixed(2)}" stroke="${stroke}" stroke-width="5" stroke-linecap="round" />
                            <line x1="${(end.x - s).toFixed(2)}" y1="${(end.y + s).toFixed(2)}" x2="${(end.x + s).toFixed(2)}" y2="${(end.y - s).toFixed(2)}" stroke="${stroke}" stroke-width="5" stroke-linecap="round" />`;
                  })()
                }
              </g>
            </svg>`}
            width={layout.w}
            height={layout.h}
          />

          {pen ? (
            <View
              style={[
                styles.penTip,
                {
                  left: pen.x - 10,
                  top: pen.y - 10,
                  backgroundColor: c('frostLight'),
                  borderColor: c('frost'),
                },
              ]}
            />
          ) : null}
        </View>
      </View>

      {!compact ? (
        <>
          <View style={[styles.progressTrack, { backgroundColor: c('border') }]}>
            <View
              style={[styles.progressFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: c('primary') }]}
            />
          </View>
          <ThemedText type="defaultSemiBold">Tiến độ: {Math.round(progress * 100)}%</ThemedText>
        </>
      ) : null}

      {!compact ? (
        <>
          <Button
            title="Tiếp tục → Tô màu"
            variant="contained"
            disabled={!canContinue}
            onPress={handleContinue}
            accessibilityLabel="Continue to coloring phase"
          />
          <Button title="Bỏ qua tracing" variant="text" onPress={onComplete} accessibilityLabel="Skip tracing phase" />
        </>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: Spacing.md,
  },
  canvasWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderRadius: 16,
  },
  previewUnderlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  penTip: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 999,
    borderWidth: 2,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: 10,
    borderRadius: 999,
  },
});
