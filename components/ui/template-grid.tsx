import React, { useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { TemplateCard, type TemplateCardProps } from '@/components/ui/template-card';
import { Spacing } from '@/constants/spacing';

export type TemplateItem = {
  id: string;
  thumbnail: TemplateCardProps['thumbnail'];
  title?: string;
  category?: string;
};

export type TemplateGridProps = {
  data: TemplateItem[];
  selectedId?: string;
  loadingId?: string;
  onSelectTemplate: (id: string) => void;
  columns?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export const TemplateGrid = React.memo(function TemplateGrid({
  data,
  selectedId,
  loadingId,
  onSelectTemplate,
  columns: columnsProp,
  style,
  testID,
}: TemplateGridProps) {
  const { width } = useWindowDimensions();
  const columns = columnsProp ?? (width < 600 ? 2 : width < 1024 ? 3 : 4);
  const gap = Spacing.md;

  const renderItem = useCallback(
    ({ item }: { item: TemplateItem }) => (
      <View style={{ flex: 1, maxWidth: `${100 / columns}%` as any, padding: gap / 2 }}>
        <TemplateCard
          thumbnail={item.thumbnail}
          title={item.title}
          category={item.category}
          selected={item.id === selectedId}
          loading={item.id === loadingId}
          onPress={() => onSelectTemplate(item.id)}
        />
      </View>
    ),
    [columns, gap, selectedId, loadingId, onSelectTemplate],
  );

  const keyExtractor = useCallback((item: TemplateItem) => item.id, []);

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={columns}
      key={columns}
      contentContainerStyle={[styles.content, style]}
      windowSize={7}
      maxToRenderPerBatch={12}
      initialNumToRender={8}
      showsVerticalScrollIndicator={false}
      testID={testID}
    />
  );
});

const styles = StyleSheet.create({
  content: {
    padding: Spacing.sm,
  },
});
