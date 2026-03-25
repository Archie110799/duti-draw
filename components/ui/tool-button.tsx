import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Icon, type IconProps } from '@/components/ui/icon';
import { Radius, Layout } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';

export type ToolButtonProps = {
  icon: IconProps['name'];
  active?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel: string;
};

export const ToolButton = React.memo(function ToolButton({
  icon,
  active = false,
  disabled = false,
  loading = false,
  onPress,
  size = Layout.touchTarget,
  style,
  testID,
  accessibilityLabel,
}: ToolButtonProps) {
  const c = useSemanticColors();
  const isDisabled = disabled || loading;

  const iconColor = isDisabled
    ? c('disabled')
    : active
      ? c('primary')
      : c('icon');

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, selected: active }}
      testID={testID}
      style={({ pressed }) => [
        styles.btn,
        {
          width: size,
          height: size,
          backgroundColor: active
            ? c('frostLight')
            : pressed
              ? c('frostLight')
              : 'transparent',
          borderColor: active ? c('primary') : 'transparent',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <Icon name={icon} size={size * 0.5} color={iconColor} />
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  btn: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
