import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Spacing } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';

export type AdBannerProps = {
  height?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Placeholder slot for an ad banner.
 * Replace inner content with actual ad SDK when integrating.
 */
export const AdBanner = React.memo(function AdBanner({
  height = 50,
  style,
  testID = 'ad-banner',
}: AdBannerProps) {
  const c = useSemanticColors();

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          height,
          backgroundColor: c('disabledBg'),
          borderTopColor: c('borderLight'),
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: c('textSecondary') }]}>Ad Banner</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
