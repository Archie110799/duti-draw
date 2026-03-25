import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Spacing, Radius } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';

export type TemplateCardProps = {
  thumbnail: ImageSourcePropType | string;
  title?: string;
  category?: string;
  selected?: boolean;
  loading?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const TemplateCard = React.memo(function TemplateCard({
  thumbnail,
  title,
  category,
  selected = false,
  loading = false,
  onPress,
  style,
  testID,
}: TemplateCardProps) {
  const c = useSemanticColors();

  const imageSource =
    typeof thumbnail === 'string' ? { uri: thumbnail } : thumbnail;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title ?? 'Template'}
      accessibilityState={{ selected }}
      testID={testID}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: c('surface'),
          borderColor: selected ? c('primary') : c('borderLight'),
          borderWidth: selected ? 2.5 : 1,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <View style={styles.thumbWrap}>
        <Image source={imageSource} style={styles.thumb} resizeMode="cover" />
        {loading && (
          <View style={[styles.overlay, { backgroundColor: c('overlay') }]}>
            <ActivityIndicator color={c('textOnPrimary')} />
          </View>
        )}
      </View>
      {(title || category) && (
        <View style={styles.info}>
          {title && (
            <Text style={[styles.title, { color: c('textPrimary') }]} numberOfLines={1}>
              {title}
            </Text>
          )}
          {category && (
            <Text style={[styles.category, { color: c('textSecondary') }]} numberOfLines={1}>
              {category}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbWrap: {
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: Spacing.sm,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
  },
  category: {
    fontSize: 11,
  },
});
