import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/spacing';

export type ExportShareControlsProps = {
  onExportPNG?: () => void;
  onShare?: () => void;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const ExportShareControls = React.memo(function ExportShareControls({
  onExportPNG,
  onShare,
  loading = false,
  style,
  testID,
}: ExportShareControlsProps) {
  return (
    <View style={[styles.container, style]} testID={testID}>
      <Button
        title="Export PNG"
        variant="outlined"
        iconLeft="square.and.arrow.down"
        onPress={onExportPNG}
        loading={loading}
        accessibilityLabel="Export as PNG"
      />
      <Button
        title="Share"
        variant="contained"
        iconLeft="square.and.arrow.up"
        onPress={onShare}
        accessibilityLabel="Share artwork"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
