import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ToolButton } from '@/components/ui/tool-button';
import { Spacing, Radius } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';

export type CanvasTool = 'fill' | 'eraser' | 'undo' | 'redo' | 'zoom';

export type CanvasToolbarProps = {
  activeTool: CanvasTool;
  onToolPress: (tool: CanvasTool) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const TOOLS: { tool: CanvasTool; icon: React.ComponentProps<typeof ToolButton>['icon']; label: string }[] = [
  { tool: 'fill', icon: 'paintbrush', label: 'Fill tool' },
  { tool: 'eraser', icon: 'eraser', label: 'Eraser tool' },
  { tool: 'undo', icon: 'arrow.uturn.backward', label: 'Undo' },
  { tool: 'redo', icon: 'arrow.uturn.forward', label: 'Redo' },
  { tool: 'zoom', icon: 'magnifyingglass.circle', label: 'Zoom' },
];

export const CanvasToolbar = React.memo(function CanvasToolbar({
  activeTool,
  onToolPress,
  canUndo = true,
  canRedo = true,
  style,
  testID,
}: CanvasToolbarProps) {
  const c = useSemanticColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, Spacing.sm),
          backgroundColor: c('surface'),
          borderTopColor: c('borderLight'),
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {TOOLS.map(({ tool, icon, label }) => (
          <ToolButton
            key={tool}
            icon={icon}
            accessibilityLabel={label}
            active={tool === activeTool && tool !== 'undo' && tool !== 'redo'}
            disabled={
              (tool === 'undo' && !canUndo) || (tool === 'redo' && !canRedo)
            }
            onPress={() => onToolPress(tool)}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: 360,
    alignSelf: 'center',
    width: '100%',
  },
});
