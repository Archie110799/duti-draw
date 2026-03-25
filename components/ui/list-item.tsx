import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Icon, type IconProps } from '@/components/ui/icon';
import { Spacing, Radius } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';

export type ListItemProps = {
  title: string;
  subtitle?: string;
  avatar?: ImageSourcePropType;
  rightIcon?: IconProps['name'];
  rightAction?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
};

export const ListItem = React.memo(function ListItem({
  title,
  subtitle,
  avatar,
  rightIcon = 'chevron.right',
  rightAction,
  onPress,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}: ListItemProps) {
  const c = useSemanticColors();

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled }}
      testID={testID}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed && onPress ? c('frostLight') : 'transparent',
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {avatar && <Image source={avatar} style={styles.avatar} />}
      <View style={styles.body}>
        <Text style={[styles.title, { color: c('textPrimary') }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: c('textSecondary') }]} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightAction ?? (
        onPress && <Icon name={rightIcon} size={18} color={c('disabled')} />
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    minHeight: 52,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 13,
  },
});
