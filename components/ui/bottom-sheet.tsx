import React, { useEffect, useCallback } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import { Spacing, Radius } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.5 };

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  snapPoints?: [number, number];
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const BottomSheet = React.memo(function BottomSheet({
  visible,
  onClose,
  snapPoints = [0.4, 0.75],
  children,
  style,
  testID,
}: BottomSheetProps) {
  const c = useSemanticColors();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const currentSnap = useSharedValue(0);

  const snapHeights = snapPoints.map((p) => SCREEN_HEIGHT * (1 - p));
  const closedY = SCREEN_HEIGHT;

  const open = useCallback(() => {
    translateY.value = withSpring(snapHeights[0], SPRING_CONFIG);
    backdropOpacity.value = withTiming(1, { duration: 200 });
    currentSnap.value = 0;
  }, [translateY, backdropOpacity, currentSnap, snapHeights]);

  const close = useCallback(() => {
    translateY.value = withSpring(closedY, SPRING_CONFIG);
    backdropOpacity.value = withTiming(0, { duration: 200 });
  }, [translateY, backdropOpacity, closedY]);

  useEffect(() => {
    if (visible) {
      open();
    } else {
      close();
    }
  }, [visible, open, close]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const base = snapHeights[currentSnap.value];
      translateY.value = Math.max(base + e.translationY, snapHeights[snapHeights.length - 1]);
    })
    .onEnd((e) => {
      if (e.translationY > 100) {
        if (currentSnap.value === 0) {
          translateY.value = withSpring(closedY, SPRING_CONFIG);
          backdropOpacity.value = withTiming(0, { duration: 200 });
          runOnJS(onClose)();
          return;
        }
        currentSnap.value = 0;
        translateY.value = withSpring(snapHeights[0], SPRING_CONFIG);
      } else if (e.translationY < -80 && currentSnap.value < snapHeights.length - 1) {
        currentSnap.value = currentSnap.value + 1;
        translateY.value = withSpring(snapHeights[currentSnap.value], SPRING_CONFIG);
      } else {
        translateY.value = withSpring(snapHeights[currentSnap.value], SPRING_CONFIG);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} testID={testID}>
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[styles.backdrop, { backgroundColor: c('overlay') }, backdropAnimStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.sheet,
              { backgroundColor: c('surfaceElevated') },
              sheetStyle,
              style,
            ]}
          >
            <View style={[styles.handle, { backgroundColor: c('disabled') }]} />
            <View style={styles.content}>{children}</View>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    paddingTop: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
});
