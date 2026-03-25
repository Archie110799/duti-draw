import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';

export type LevelHeaderProps = {
  title: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const LevelHeader = React.memo(function LevelHeader({
  title,
  subtitle,
  style,
  testID,
}: LevelHeaderProps) {
  const c = useSemanticColors();

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text style={[styles.title, { color: c('textPrimary') }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: c('textSecondary') }]}>{subtitle}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
});
