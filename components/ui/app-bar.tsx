import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconProps } from '@/components/ui/icon';
import { Spacing } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';

export type AppBarAction = {
  icon: IconProps['name'];
  onPress: () => void;
  accessibilityLabel: string;
};

export type AppBarProps = {
  title: string;
  onBack?: () => void;
  actions?: AppBarAction[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const AppBar = React.memo(function AppBar({
  title,
  onBack,
  actions,
  style,
  testID,
}: AppBarProps) {
  const c = useSemanticColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing.sm,
          backgroundColor: c('surface'),
          borderBottomColor: c('borderLight'),
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <Icon name="chevron.left" size={24} color={c('primary')} />
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}

        <Text
          style={[styles.title, { color: c('textPrimary') }]}
          numberOfLines={1}
        >
          {title}
        </Text>

        <View style={styles.actions}>
          {actions?.map((action, i) => (
            <Pressable
              key={i}
              onPress={action.onPress}
              accessibilityRole="button"
              accessibilityLabel={action.accessibilityLabel}
              hitSlop={8}
              style={styles.actionBtn}
            >
              <Icon name={action.icon} size={22} color={c('icon')} />
            </Pressable>
          ))}
          {!actions?.length && <View style={styles.spacer} />}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    minWidth: 44,
    justifyContent: 'flex-end',
  },
  actionBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: { width: 44 },
});
