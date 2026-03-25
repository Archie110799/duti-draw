import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Icon, type IconProps } from '@/components/ui/icon';
import { Spacing, Radius } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';

export type ButtonVariant = 'contained' | 'outlined' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: IconProps['name'];
  iconRight?: IconProps['name'];
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
};

const SIZE_MAP: Record<ButtonSize, { height: number; paddingH: number; fontSize: number; iconSize: number }> = {
  sm: { height: 32, paddingH: Spacing.md, fontSize: 13, iconSize: 16 },
  md: { height: 44, paddingH: Spacing.lg, fontSize: 15, iconSize: 20 },
  lg: { height: 52, paddingH: Spacing.xl, fontSize: 17, iconSize: 22 },
};

export const Button = React.memo(function Button({
  title,
  variant = 'contained',
  size = 'md',
  disabled = false,
  loading = false,
  iconLeft,
  iconRight,
  onPress,
  style,
  testID,
  accessibilityLabel,
}: ButtonProps) {
  const c = useSemanticColors();
  const s = SIZE_MAP[size];
  const isDisabled = disabled || loading;

  const getContainerStyle = useCallback(
    (pressed: boolean): ViewStyle => {
      const base: ViewStyle = {
        height: s.height,
        paddingHorizontal: s.paddingH,
        borderRadius: Radius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
      };

      if (variant === 'contained') {
        base.backgroundColor = isDisabled
          ? c('disabledBg')
          : pressed
            ? c('primaryPressed')
            : c('primary');
      } else if (variant === 'outlined') {
        base.backgroundColor = pressed ? c('frostLight') : 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = isDisabled ? c('disabled') : c('primary');
      } else {
        base.backgroundColor = pressed ? c('frostLight') : 'transparent';
      }

      return base;
    },
    [variant, isDisabled, s, c],
  );

  const textColor =
    variant === 'contained'
      ? isDisabled
        ? c('disabled')
        : c('textOnPrimary')
      : isDisabled
        ? c('disabled')
        : c('primary');

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled }}
      testID={testID}
      style={(state) => [getContainerStyle(state.pressed), style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {iconLeft && <Icon name={iconLeft} size={s.iconSize} color={textColor} />}
          <Text style={[styles.label, { fontSize: s.fontSize, color: textColor }]}>
            {title}
          </Text>
          {iconRight && <Icon name={iconRight} size={s.iconSize} color={textColor} />}
        </>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  label: {
    fontWeight: '600',
  },
});
