import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Icon, type IconProps } from '@/components/ui/icon';
import { Radius, Layout, Spacing } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';

export type OrbIconButtonProps = {
  icon: IconProps['name'];
  onPress?: () => void;
  badge?: string;
  disabled?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel: string;
};

export const OrbIconButton = React.memo(function OrbIconButton({
  icon,
  onPress,
  badge,
  disabled = false,
  size = Layout.touchTarget + 4,
  style,
  testID,
  accessibilityLabel,
}: OrbIconButtonProps) {
  const c = useSemanticColors();

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      testID={testID}
      style={({ pressed }) => [
        styles.orb,
        {
          width: size,
          height: size,
          backgroundColor: pressed ? c('frostLight') : c('surface'),
          borderColor: c('borderLight'),
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Icon
        name={icon}
        size={size * 0.45}
        color={disabled ? c('disabled') : c('icon')}
      />
      {badge && (
        <View style={[styles.badge, { backgroundColor: c('accentPink') }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  orb: {
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
