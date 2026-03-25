import React, { useCallback, useRef, useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Spacing, Radius } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';

export type TabItem = {
  key: string;
  label: string;
};

export type TabsProps = {
  items: TabItem[];
  activeKey: string;
  onTabPress: (key: string) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const Tabs = React.memo(function Tabs({
  items,
  activeKey,
  onTabPress,
  style,
  testID,
}: TabsProps) {
  const c = useSemanticColors();
  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);
  const tabLayouts = useRef<Record<string, { x: number; width: number }>>({});

  const onTabLayout = useCallback(
    (key: string) => (e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      tabLayouts.current[key] = { x, width };
      if (key === activeKey) {
        indicatorX.value = withSpring(x, { damping: 18, stiffness: 200 });
        indicatorW.value = withSpring(width, { damping: 18, stiffness: 200 });
      }
    },
    [activeKey, indicatorX, indicatorW],
  );

  useEffect(() => {
    const layout = tabLayouts.current[activeKey];
    if (layout) {
      indicatorX.value = withSpring(layout.x, { damping: 18, stiffness: 200 });
      indicatorW.value = withSpring(layout.width, { damping: 18, stiffness: 200 });
    }
  }, [activeKey, indicatorX, indicatorW]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorW.value,
  }));

  return (
    <View style={[styles.wrapper, style]} testID={testID}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {items.map((item) => {
            const active = item.key === activeKey;
            return (
              <Pressable
                key={item.key}
                onPress={() => onTabPress(item.key)}
                onLayout={onTabLayout(item.key)}
                style={styles.tab}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={item.label}
              >
                <Text
                  style={[
                    styles.label,
                    {
                      color: active ? c('primary') : c('textSecondary'),
                      fontWeight: active ? '600' : '400',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: c('primary') },
            indicatorStyle,
          ]}
        />
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  row: {
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2.5,
    borderRadius: Radius.full,
  },
});
