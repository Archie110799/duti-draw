import React, { useState, useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
  type StyleProp,
  type ViewStyle,
  type TextInputProps as RNTextInputProps,
} from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Spacing, Radius } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';

export type TextInputProps = Omit<RNTextInputProps, 'style'> & {
  label?: string;
  error?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const TextInput = React.memo(function TextInput({
  label,
  error,
  helperText,
  secureTextEntry: secureProp = false,
  disabled = false,
  style,
  testID,
  onFocus,
  onBlur,
  value,
  ...rest
}: TextInputProps) {
  const c = useSemanticColors();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureProp);

  const hasValue = !!value && value.length > 0;
  const floated = focused || hasValue;

  const handleFocus = useCallback(
    (e: any) => {
      setFocused(true);
      onFocus?.(e);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (e: any) => {
      setFocused(false);
      onBlur?.(e);
    },
    [onBlur],
  );

  const borderColor = error
    ? c('danger')
    : focused
      ? c('primary')
      : c('border');

  return (
    <View style={[styles.wrapper, style]} testID={testID}>
      <View
        style={[
          styles.container,
          {
            borderColor,
            backgroundColor: disabled ? c('disabledBg') : c('surface'),
          },
        ]}
      >
        {label && (
          <Text
            style={[
              styles.label,
              {
                color: error ? c('danger') : focused ? c('primary') : c('textSecondary'),
                top: floated ? 6 : 14,
                fontSize: floated ? 11 : 15,
              },
            ]}
          >
            {label}
          </Text>
        )}
        <RNTextInput
          {...rest}
          value={value}
          editable={!disabled}
          secureTextEntry={hidden}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={c('disabled')}
          style={[
            styles.input,
            {
              color: disabled ? c('disabled') : c('textPrimary'),
              paddingTop: label ? 22 : 12,
            },
          ]}
          accessibilityLabel={label}
        />
        {secureProp && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            style={styles.toggle}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            hitSlop={8}
          >
            <Icon
              name={hidden ? 'eye.slash' : 'eye'}
              size={20}
              color={c('icon')}
            />
          </Pressable>
        )}
      </View>
      {(error || helperText) && (
        <Text
          style={[
            styles.helper,
            { color: error ? c('danger') : c('textSecondary') },
          ]}
        >
          {error ?? helperText}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.xs },
  container: {
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  label: {
    position: 'absolute',
    left: Spacing.lg,
    fontWeight: '500',
  },
  input: {
    fontSize: 15,
    paddingBottom: 8,
  },
  toggle: {
    position: 'absolute',
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  helper: {
    fontSize: 12,
    marginLeft: Spacing.xs,
  },
});
