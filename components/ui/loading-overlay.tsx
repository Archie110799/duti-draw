import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Spacing, Radius } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';

export type LoadingOverlayProps = {
  visible: boolean;
  text?: string;
  testID?: string;
};

export const LoadingOverlay = React.memo(function LoadingOverlay({
  visible,
  text,
  testID,
}: LoadingOverlayProps) {
  const c = useSemanticColors();

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: c('overlay') }]} testID={testID}>
      <View style={[styles.box, { backgroundColor: c('surfaceElevated') }]}>
        <ActivityIndicator size="large" color={c('primary')} />
        {text && (
          <Text style={[styles.text, { color: c('textPrimary') }]}>{text}</Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  box: {
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.xl,
    borderRadius: Radius['2xl'],
    alignItems: 'center',
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});
