import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Spacing, Radius } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';

export type HintBubbleVariant = 'default' | 'accent';

export type HintBubbleProps = {
  label: string;
  illustration?: ImageSourcePropType;
  variant?: HintBubbleVariant;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const HintBubble = React.memo(function HintBubble({
  label,
  illustration,
  variant = 'default',
  style,
  testID,
}: HintBubbleProps) {
  const c = useSemanticColors();
  const bgColor = variant === 'accent' ? c('frostLight') : c('surface');

  return (
    <View
      testID={testID}
      style={[
        styles.bubble,
        {
          backgroundColor: bgColor,
          borderColor: c('border'),
        },
        style,
      ]}
    >
      {illustration && (
        <Image source={illustration} style={styles.illustration} resizeMode="contain" />
      )}
      <Text style={[styles.label, { color: c('textSecondary') }]}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignSelf: 'center',
    maxWidth: 240,
  },
  illustration: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
});
