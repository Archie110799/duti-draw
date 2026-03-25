import React, { useEffect } from 'react';
import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Spacing, Radius, Layout } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';

export type ModalDialogProps = {
  visible: boolean;
  title?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const ModalDialog = React.memo(function ModalDialog({
  visible,
  title,
  children,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  onDismiss,
  style,
  testID,
}: ModalDialogProps) {
  const c = useSemanticColors();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.back(1.2)) });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.9, { duration: 150 });
    }
  }, [visible, opacity, scale]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const dialogStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss ?? onCancel}
      testID={testID}
    >
      <View style={styles.center}>
        <Animated.View style={[styles.backdrop, { backgroundColor: c('overlay') }, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss ?? onCancel} />
        </Animated.View>

        <Animated.View
          style={[
            styles.dialog,
            { backgroundColor: c('surfaceElevated') },
            dialogStyle,
            style,
          ]}
        >
          {title && (
            <Text style={[styles.title, { color: c('textPrimary') }]}>{title}</Text>
          )}
          {children && <View style={styles.body}>{children}</View>}
          <View style={styles.actions}>
            {onCancel && (
              <Button
                title={cancelLabel}
                variant="text"
                size="sm"
                onPress={onCancel}
              />
            )}
            {onConfirm && (
              <Button
                title={confirmLabel}
                variant="contained"
                size="sm"
                onPress={onConfirm}
              />
            )}
          </View>
        </Animated.View>
      </View>
    </RNModal>
  );
});

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  dialog: {
    width: '100%',
    maxWidth: Layout.contentMaxWidth * 0.6,
    borderRadius: Radius['2xl'],
    padding: Spacing.xl,
    gap: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    gap: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
});
