import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
    AdBanner,
    FloatingIconRail,
    HintBubble,
    LevelHeader,
    OrbIconButton,
} from '@/components/drawing';
import {
    AppBar,
    Button,
    CanvasToolbar,
    Card,
    ColorPicker,
    ExportShareControls,
    Icon,
    ListItem,
    LoadingOverlay,
    ModalDialog,
    Tabs,
    TextInput,
    ToolButton,
} from '@/components/ui';
import type { CanvasTool } from '@/components/ui/canvas-toolbar';
import { Radius, Spacing } from '@/constants/spacing';
import { useSemanticColors } from '@/hooks/use-semantic-color';

function SectionTitle({ title }: { title: string }) {
  const c = useSemanticColors();
  return (
    <Text style={[styles.sectionTitle, { color: c('primary') }]}>{title}</Text>
  );
}

function DemoRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.demoRow}>{children}</View>;
}

export default function ComponentSystemScreen() {
  const c = useSemanticColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // State for interactive demos
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('buttons');
  const [selectedColor, setSelectedColor] = useState('#4A90D9');
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<CanvasTool>('fill');
  const [inputValue, setInputValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [loadingVisible, setLoadingVisible] = useState(false);

  const handleColorSelect = useCallback(
    (color: string) => {
      setSelectedColor(color);
      setRecentColors((prev) => {
        const filtered = prev.filter((c) => c !== color);
        return [color, ...filtered].slice(0, 5);
      });
    },
    [],
  );

  const showAlert = useCallback(
    (msg: string) => () => Alert.alert('Action', msg),
    [],
  );

  const tabItems = [
    { key: 'buttons', label: 'Buttons' },
    { key: 'inputs', label: 'Inputs' },
    { key: 'cards', label: 'Cards' },
    { key: 'drawing', label: 'Drawing' },
    { key: 'gameplay', label: 'Gameplay' },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: c('background') }]}>
      <AppBar
        title="Component System"
        onBack={() => router.back()}
        actions={[
          { icon: 'info.circle', onPress: showAlert('Duti Draw UI Component System'), accessibilityLabel: 'Info' },
        ]}
      />

      <Tabs items={tabItems} activeKey={activeTab} onTabPress={setActiveTab} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* =========== BUTTONS TAB =========== */}
        {activeTab === 'buttons' && (
          <>
            <SectionTitle title="Button — Variants" />
            <DemoRow>
              <Button title="Contained" variant="contained" onPress={showAlert('Contained')} />
              <Button title="Outlined" variant="outlined" onPress={showAlert('Outlined')} />
              <Button title="Text" variant="text" onPress={showAlert('Text')} />
            </DemoRow>

            <SectionTitle title="Button — Sizes" />
            <DemoRow>
              <Button title="Small" size="sm" onPress={showAlert('SM')} />
              <Button title="Medium" size="md" onPress={showAlert('MD')} />
              <Button title="Large" size="lg" onPress={showAlert('LG')} />
            </DemoRow>

            <SectionTitle title="Button — States" />
            <DemoRow>
              <Button title="Disabled" disabled />
              <Button title="Loading" loading />
            </DemoRow>

            <SectionTitle title="Button — With Icons" />
            <DemoRow>
              <Button title="Share" iconLeft="square.and.arrow.up" onPress={showAlert('Share')} />
              <Button title="Next" iconRight="chevron.right" variant="outlined" onPress={showAlert('Next')} />
            </DemoRow>

            <SectionTitle title="Icon Showcase" />
            <DemoRow>
              <Icon name="house.fill" size={28} color={c('primary')} />
              <Icon name="star.fill" size={28} color={c('accentYellow')} />
              <Icon name="heart.fill" size={28} color={c('accentPink')} />
              <Icon name="paintbrush" size={28} color={c('frost')} />
              <Icon name="gearshape" size={28} />
              <Icon name="crown" size={28} color={c('accentYellow')} />
            </DemoRow>

            <SectionTitle title="Tool Button" />
            <DemoRow>
              <ToolButton icon="paintbrush" active accessibilityLabel="Fill" />
              <ToolButton icon="eraser" accessibilityLabel="Eraser" />
              <ToolButton icon="arrow.uturn.backward" accessibilityLabel="Undo" />
              <ToolButton icon="arrow.uturn.forward" disabled accessibilityLabel="Redo" />
              <ToolButton icon="magnifyingglass.circle" loading accessibilityLabel="Zoom" />
            </DemoRow>

            <SectionTitle title="Export / Share Controls" />
            <ExportShareControls
              onExportPNG={showAlert('Export PNG')}
              onShare={showAlert('Share')}
            />

            <SectionTitle title="Modal Dialog" />
            <Button title="Open Modal" onPress={() => setModalVisible(true)} />
            <ModalDialog
              visible={modalVisible}
              title="Confirm Action"
              onConfirm={() => setModalVisible(false)}
              onCancel={() => setModalVisible(false)}
            >
              <Text style={{ color: c('textPrimary'), fontSize: 14 }}>
                Are you sure you want to proceed?
              </Text>
            </ModalDialog>

            <SectionTitle title="Loading Overlay" />
            <Button
              title="Show Loading (2s)"
              variant="outlined"
              onPress={() => {
                setLoadingVisible(true);
                setTimeout(() => setLoadingVisible(false), 2000);
              }}
            />
          </>
        )}

        {/* =========== INPUTS TAB =========== */}
        {activeTab === 'inputs' && (
          <>
            <SectionTitle title="TextInput — Basic" />
            <TextInput
              label="Username"
              value={inputValue}
              onChangeText={setInputValue}
              helperText="Enter your display name"
            />

            <SectionTitle title="TextInput — Password" />
            <TextInput
              label="Password"
              value={passwordValue}
              onChangeText={setPasswordValue}
              secureTextEntry
            />

            <SectionTitle title="TextInput — Error" />
            <TextInput
              label="Email"
              value="bad-email"
              error="Invalid email format"
            />

            <SectionTitle title="TextInput — Disabled" />
            <TextInput
              label="Locked field"
              value="Cannot edit"
              disabled
            />
          </>
        )}

        {/* =========== CARDS TAB =========== */}
        {activeTab === 'cards' && (
          <>
            <SectionTitle title="Card — Basic" />
            <Card>
              <Text style={{ color: c('textPrimary'), fontSize: 14 }}>
                A simple card with content inside. Rounded corners and soft shadow create a playful feel.
              </Text>
            </Card>

            <SectionTitle title="Card — With Header & Footer" />
            <Card
              header={
                <Text style={{ color: c('textPrimary'), fontWeight: '600', fontSize: 16 }}>
                  Card Title
                </Text>
              }
              footer={
                <>
                  <Button title="Cancel" variant="text" size="sm" onPress={showAlert('Cancel')} />
                  <Button title="Save" size="sm" onPress={showAlert('Save')} />
                </>
              }
            >
              <Text style={{ color: c('textSecondary'), fontSize: 14 }}>
                Card body content with header and footer actions.
              </Text>
            </Card>

            <SectionTitle title="List Items" />
            <Card>
              <View style={{ marginHorizontal: -Spacing.lg }}>
                <ListItem title="Settings" subtitle="Manage preferences" onPress={showAlert('Settings')} />
                <ListItem title="Profile" subtitle="View your profile" onPress={showAlert('Profile')} />
                <ListItem title="Help" subtitle="Get assistance" onPress={showAlert('Help')} />
                <ListItem title="Disabled item" disabled />
              </View>
            </Card>
          </>
        )}

        {/* =========== DRAWING TAB =========== */}
        {activeTab === 'drawing' && (
          <>
            <SectionTitle title="Color Picker" />
            <Card>
              <ColorPicker
                selectedColor={selectedColor}
                recentColors={recentColors}
                onSelectColor={handleColorSelect}
              />
              <View style={[styles.selectedPreview, { backgroundColor: selectedColor, borderColor: c('border') }]}>
                <Text style={{ color: getContrastColor(selectedColor), fontSize: 12, fontWeight: '600' }}>
                  {selectedColor}
                </Text>
              </View>
            </Card>

            <SectionTitle title="Canvas Toolbar" />
            <CanvasToolbar
              activeTool={activeTool}
              onToolPress={setActiveTool}
              canUndo
              canRedo={false}
            />
          </>
        )}

        {/* =========== GAMEPLAY TAB =========== */}
        {activeTab === 'gameplay' && (
          <>
            <SectionTitle title="Level Header" />
            <LevelHeader title="LEVEL 12" subtitle="Winter Wonderland" />

            <SectionTitle title="Hint Bubble" />
            <HintBubble label="Draw a snowflake" variant="default" />
            <View style={{ height: Spacing.sm }} />
            <HintBubble label="Trace the candy cane" variant="accent" />

            <SectionTitle title="Orb Icon Buttons" />
            <DemoRow>
              <OrbIconButton icon="gearshape" accessibilityLabel="Settings" onPress={showAlert('Settings')} />
              <OrbIconButton icon="paintbrush" accessibilityLabel="Pen" onPress={showAlert('Pen')} />
              <OrbIconButton icon="crown" badge="VIP" accessibilityLabel="VIP" onPress={showAlert('VIP')} />
              <OrbIconButton icon="megaphone" badge="AD" accessibilityLabel="Ad reward" onPress={showAlert('Ad')} />
              <OrbIconButton icon="square.grid.2x2" accessibilityLabel="Menu" onPress={showAlert('Menu')} />
              <OrbIconButton icon="nosign" accessibilityLabel="No Ads" onPress={showAlert('No Ads')} />
            </DemoRow>

            <SectionTitle title="Gameplay Layout Preview" />
            <View style={[styles.gameplayPreview, { backgroundColor: c('surface'), borderColor: c('border') }]}>
              {/* Simulated layout */}
              <LevelHeader title="LEVEL 5" />
              <HintBubble label="Trace the star" variant="accent" />

              <View style={styles.canvasArea}>
                <FloatingIconRail side="left">
                  <OrbIconButton icon="gearshape" accessibilityLabel="Settings" size={40} />
                  <OrbIconButton icon="paintbrush" accessibilityLabel="Pen" size={40} />
                  <OrbIconButton icon="crown" badge="VIP" accessibilityLabel="VIP" size={40} />
                </FloatingIconRail>

                <View style={[styles.canvasPlaceholder, { borderColor: c('borderLight') }]}>
                  <Text style={{ color: c('textSecondary'), fontSize: 13 }}>Canvas Area</Text>
                </View>

                <FloatingIconRail side="right">
                  <OrbIconButton icon="megaphone" badge="AD" accessibilityLabel="Ad" size={40} />
                  <OrbIconButton icon="square.grid.2x2" accessibilityLabel="Menu" size={40} />
                  <OrbIconButton icon="nosign" accessibilityLabel="No Ads" size={40} />
                </FloatingIconRail>
              </View>

              <AdBanner />
            </View>
          </>
        )}
      </ScrollView>

      <LoadingOverlay visible={loadingVisible} text="Loading..." />
    </View>
  );
}

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Spacing.lg,
  },
  demoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  selectedPreview: {
    marginTop: Spacing.md,
    height: 40,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameplayPreview: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    minHeight: 400,
  },
  canvasArea: {
    flex: 1,
    minHeight: 250,
    position: 'relative',
  },
  canvasPlaceholder: {
    flex: 1,
    margin: Spacing['3xl'],
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
