import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/spacing';

export type FloatingIconRailProps = {
  side: 'left' | 'right';
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const FloatingIconRail = React.memo(function FloatingIconRail({
  side,
  children,
  style,
  testID,
}: FloatingIconRailProps) {
  return (
    <View
      testID={testID}
      pointerEvents="box-none"
      style={[
        styles.rail,
        side === 'left' ? styles.left : styles.right,
        style,
      ]}
    >
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  rail: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    paddingTop: Spacing['3xl'],
    gap: Spacing.md,
    zIndex: 10,
  },
  left: {
    left: Spacing.sm,
    alignItems: 'flex-start',
  },
  right: {
    right: Spacing.sm,
    alignItems: 'flex-end',
  },
});
