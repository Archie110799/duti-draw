/**
 * Icon wrapper — delegates to IconSymbol.
 * All icon references in the app should use this component.
 * Color defaults to semantic `icon` token.
 */
import React from 'react';
import { type StyleProp, type TextStyle } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSemanticColor } from '@/hooks/use-semantic-color';

// Re-export the name type so consumers don't need to import icon-symbol
type IconSymbolName = React.ComponentProps<typeof IconSymbol>['name'];

export type IconProps = {
  name: IconSymbolName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export const Icon = React.memo(function Icon({
  name,
  size = 24,
  color,
  style,
}: IconProps) {
  const defaultColor = useSemanticColor('icon');
  return (
    <IconSymbol
      name={name}
      size={size}
      color={color ?? defaultColor}
      style={style}
    />
  );
});
