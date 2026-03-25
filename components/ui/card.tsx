import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Spacing, Radius } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';

export type CardProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const Card = React.memo(function Card({
  children,
  header,
  footer,
  style,
  testID,
}: CardProps) {
  const c = useSemanticColors();

  return (
    <View
      testID={testID}
      style={[
        styles.card,
        {
          backgroundColor: c('surface'),
          shadowColor: c('textPrimary'),
          borderColor: c('borderLight'),
        },
        style,
      ]}
    >
      {header && <View style={styles.header}>{header}</View>}
      <View style={styles.content}>{children}</View>
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    padding: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  content: {
    padding: Spacing.lg,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.06)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
});
