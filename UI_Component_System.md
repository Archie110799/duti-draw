🚀 Thiết kế UI Component System (React Native – Duti Draw)

Hãy đóng vai là một Senior Frontend Engineer + Design System Architect.
Nhiệm vụ của bạn là xây dựng một **UI Component Library** hoàn chỉnh cho ứng dụng React Native **“Duti Draw”** (tô màu đa nền tảng).

🧱 Yêu cầu công nghệ
- React Native (ưu tiên Expo)
- TypeScript (bắt buộc)
- Styling:
  - Ưu tiên theo codebase hiện tại: `StyleSheet` + theme system
  - Theme system hiện có: `constants/theme.ts`, `hooks/use-theme-color.ts`, `components/themed-text.tsx`, `components/themed-view.tsx`
  - NativeWind: chỉ dùng nếu có trong dự án; nếu không thì không bắt buộc
- State: Zustand
- Animation: React Native Reanimated (nếu cần)
- Icon:
  - Bắt buộc dùng `components/ui/icon-symbol.tsx` (IconSymbol)
  - Nếu tạo wrapper `<Icon />` thì wrapper phải dựa trên IconSymbol (không đổi contract icon)

🎨 Design System (BẮT BUỘC)
1. Design Language
- Bám mood “Magical Candy Winter” từ `docs/elsa-1.png` và `SYSTEM_DESIGN.md`
- Pastel tươi sáng – fantasy – thân thiện trẻ em
- Không quá “trẻ con”, giữ chất SaaS
- UI phải:
  - Clean, dễ đọc (high contrast)
  - Bo góc mềm (rounded, playful)
  - Nhẹ nhàng, không clutter vùng thao tác tô màu

2. Theme System (bắt buộc phải build)
- Bắt buộc dùng theme system hiện tại:
  - `useThemeColor(...)`
  - `ThemedText` / `ThemedView`
  - `constants/theme.ts` làm nguồn token
- Bắt buộc bổ sung palette cho Duti Draw (không hardcode màu rải rác):
  - đề xuất tokens: `frost`, `snow`, `candyPink`, `candyRed`, `iceDeep`, `sprinkleAccent`
  - nếu có dark mode: mỗi token có giá trị theo light/dark

### Token Structure (BẮT BUỘC)

Phân tách rõ hai lớp; **component UI chỉ tham chiếu semantic (hoặc component token)**, không dùng primitive trực tiếp trong style.

#### 1. Primitive tokens (raw colors)

- Nguồn giá trị hex/rgb duy nhất (vd trong `constants/theme.ts` hoặc `constants/palette.primitives.ts`).
- Ví dụ đặt tên: `frost`, `snow`, `candyPink`, `candyRed`, `iceDeep`, `sprinkleYellow`, `sprinkleGreen`, …
- Chỉ dùng để **map sang semantic** và đổi theme light/dark mà không sửa từng component.

#### 2. Semantic tokens (usage-based)

- Khóa theo **ý nghĩa** trên UI, không theo tên màu thô:
  - `primary` — CTA, tab active, link chính
  - `background` — nền màn hình chính
  - `surface` — thẻ, bottom sheet, nền toolbar
  - `surfaceElevated` — modal, popover (tùy dự án)
  - `textPrimary` / `textSecondary` — chữ chính / phụ
  - `border` — viền, divider
  - `accent` — điểm nhấn (kẹo / sprinkle)
  - `danger` / `success` / `warning` — toast, lỗi form (bổ sung khi cần)
- API gợi ý: `theme.semantic.primary` hoặc `useSemanticColor('surface')` — map `light`/`dark` sẵn trong một lớp duy nhất.

#### 3. Quy tắc: không dùng primitive trong component

- ❌ `backgroundColor: '#A8D8EA'` hoặc `Colors.light.frost` trực tiếp trong `Button.tsx`, `Card.tsx`, …
- ✅ `useSemanticColor('surface')` / `theme.semantic.border` — luôn map qua semantic.
- **Ngoại lệ hợp lệ:** màu trong **ColorPicker** và **pixel đã tô** là **dữ liệu nghệ thuật**, không phải token UI — không trộn với semantic UI.

### Layout & Spacing System (BẮT BUỘC)

- **Spacing scale** (bội số 4 hoặc 8, một file `spacing.ts` hoặc trong theme): `xs` 4, `sm` 8, `md` 12, `lg` 16, `xl` 24, `2xl` 32, `3xl` 40.
- **Radius:** `radiusSm`, `radiusMd`, `radiusLg`, `radiusFull` — Button/Chip/Card dùng token, không hardcode số bo góc rải rác.
- **Max width:** gallery/form trên web: `contentMaxWidth` (vd 720) để không tràn màn desktop.
- **Safe area:** màn full-screen + bottom toolbar: padding `safe-area-bottom`; không để CTA bị home indicator che.

### Màn hình tham chiếu — Layout gameplay (BẮT BUỘC)

**Nguồn hình:** `docs/demo_layout_init.jpeg` (màn bắt đầu / khởi tạo level), `docs/demo_layout_draw.webp` (màn đang vẽ — trace / tiến trình nét). Hai màn **dùng chung khung layout**; khác nhau chủ yếu ở **trạng thái canvas** (đường chấm, tiến độ trace, vị trí bút), không đổi bố cục chrome để tránh layout shift.

#### 1. Sơ đồ vùng (mobile portrait — full screen)

```text
┌─────────────────────────────────────────────┐
│ safe top                                    │
│     [Rail trái]    LEVEL + HintBubble   [Rail phải]   │
│              (floating icon columns)      │
│                                             │
│              CANVAS (flex: 1)               │
│         nền sáng, vùng vẽ tối đa           │
│         (path chấm, điểm kết thúc, bút…)   │
│                                             │
│ safe bottom (trừ AdBanner nếu có)         │
├─────────────────────────────────────────────┤
│ AdBanner (cố định chiều cao, full width)   │
└─────────────────────────────────────────────┘
```

- **Z-order gợi ý (từ dưới lên):** `background` → `DrawingCanvas` → `PenTool` / overlay công cụ (nếu có) → `FloatingIconRail` (trái/phải) → `LevelHeader` + `HintBubble` → `AdBanner` (đáy, luôn trên nền nhưng dưới modal nếu mở).

#### 2. `demo_layout_init.jpeg` — trạng thái “init”

- **Header (trên cùng, giữa):**
  - `LevelHeader`: dòng **LEVEL xx** (`textPrimary`, bold), căn giữa theo chiều ngang.
  - `HintBubble` ngay dưới: bubble/bo góc, viền rõ; trong bubble: **label gợi ý** (`textSecondary`, vd tên chủ đề) + **minh họa nhỏ** (ảnh / sticker) — không che canvas.
- **Hai cột nút nổi (floating rails):**
  - **Trái (từ trên xuống):** Settings (bánh răng), công cụ bút (pen), VIP (badge vương miện / viền accent).
  - **Phải:** quảng cáo / phần thưởng (megaphone + badge “AD”), menu (lưới 4 ô), No Ads (nút “NO ADS” + gạch chéo).
  - Mỗi nút: **hit area tròn / bo tròn lớn (≥ 44px)**, có thể có badge góc (`badge` prop).
- **Canvas:** nền `background` (trắng / gần trắng); gameplay hiển thị **đường chấm** (stroke `textPrimary` hoặc token `stroke`), điểm kết thúc đoạn (vd dấu “X”).
- **Bút (Pen):** asset lớn, vào từ dưới / góc — có thể là lớp trang trí + vùng gesture tách; **không** chiếm toàn bộ chiều cao canvas.
- **Đáy:** banner quảng cáo full width; chiều cao cố định; trừ khỏi vùng `flex` của canvas khi tính `safe area`.

#### 3. `demo_layout_draw.webp` — trạng thái “draw”

- **Giữ nguyên** vị trí: Level + HintBubble, hai rail icon, AdBanner.
- **Cập nhật:** canvas (đường đã trace / đang trace, bút di chuyển theo ngón tay), có thể thêm feedback (đường đã hoàn thành đoạn). **Không** thay đổi offset rail/header giữa init ↔ draw để tránh giật UI.

#### 4. Component blueprint (map sang implementation)

| Khối | Gợi ý tên component | Ghi chú |
|------|----------------------|--------|
| Tiêu đề level | `LevelHeader` | `title` + optional `subtitle` |
| Gợi ý chủ đề | `HintBubble` | `label`, `illustration` (Image), `variant` |
| Cột icon trái/phải | `FloatingIconRail` | `side: 'left' \| 'right'`, `children` |
| Nút tròn + badge | `OrbIconButton` | `icon`, `onPress`, `badge?`, `accessibilityLabel` |
| Vùng vẽ | `DrawingCanvas` | tách khỏi chrome; `PointerEvents` đúng để không chặn rail |
| Đường gameplay | `DottedPath` / `TracePath` | dữ liệu từ engine, không hardcode màu path (trừ layer “gameplay stroke”) |
| Bút | `PenTool` | overlay + optional `PanResponder` / gesture |
| Quảng cáo đáy | `AdBanner` | slot fixed height; `testID` cho mock |

#### 5. Responsive (tablet / web) — cùng gameplay reference

- **Tablet:** giữ **center canvas** rộng; rail có thể **hóp vào** cạnh canvas (padding `lg`/`xl`) hoặc chuyển thành **hai rail** với `marginHorizontal` lớn hơn; không ép rail vào giữa màn.
- **Web:** canvas max-width + căn giữa; AdBanner và rail scale theo container; vẫn **touch-first**.

### Component API Consistency (BẮT BUỘC)

- **Props chung:** `variant`, `size` (`sm` | `md` | `lg`), `disabled`, `loading`, `testID`, `accessibilityLabel`.
- **Style:** `style` chỉ override bổ sung; màu nền/viền/chữ lấy từ semantic token.
- **Sự kiện:** `onPress` / `onPressIn` | `onPressOut` (Button); `onChangeText` (TextInput); `onValueChange` (picker).
- **Composition:** `children`; slot có tên khi cần: `header` / `footer` / `actions` (Card, Modal).
- **Export:** thống nhất named hoặc default + `components/ui/index.ts` barrel nếu dùng.

### State Management Strategy (Duti Draw)

- **Server + cache:** TanStack React Query — danh sách template, metadata, đồng bộ progress (khi có API).
- **UI session (Zustand hoặc Context nhỏ):** màu đang chọn, tool hiện tại (`fill` | `eraser` | …), `recentColors`, flags UI (sheet mở/đóng).
- **Canvas / lịch sử stroke:** không nhét toàn bộ buffer vào global store — tránh re-render cả cây; undo/redo expose qua hook/ref hoặc store slice tối giản chỉ cho toolbar.
- **Persistence:** progress tô màu qua hook riêng (`useColoringProgress`) + AsyncStorage/SQLite — không rải `setState`/`set` trực tiếp trong component lá.

### Performance Constraints (BẮT BUỘC)

- **Gallery:** `FlatList` — `windowSize` 5–10, `maxToRenderPerBatch` 8–16, `initialNumToRender` 8–12; thumbnail `expo-image` / FastImage + kích thước cố định + `getItemLayout` nếu ô cố định.
- **Canvas:** tách surface vẽ và chrome UI; tránh `setState` parent mỗi frame khi đang kéo vẽ (pattern ref / imperative handle / engine riêng).
- **Re-render:** `React.memo` cho ô màu / `ListItem`; `useCallback` cho handler truyền vào list.
- **Mục tiêu cảm nhận:** tap chọn tool/màu **< ~100ms** phản hồi; scroll gallery giữ **~60fps** trên máy tầm trung.

### Icon System — Mapping (BẮT BUỘC)

- **Nguồn:** `components/ui/icon-symbol.tsx` — `name` theo SF Symbols; `MAPPING` → `@expo/vector-icons/MaterialIcons` (Android/Web).
- **Thêm icon mới:** chỉ thêm một dòng trong `MAPPING`; màn hình không import `MaterialIcons` trực tiếp (trừ nơi duy nhất định nghĩa mapping).
- **`<Icon />`:** forward `name`, `size`, `color` (color từ semantic token), `style`.
- Bảng tham chiếu tối thiểu (mở rộng trong repo):

| Mục đích | `name` (SF-like) | Material |
|----------|------------------|----------|
| Home / tab | `house.fill` | `home` |
| Explore | `paperplane.fill` | `send` |
| Code / dev | `chevron.left.forwardslash.chevron.right` | `code` |
| Mở rộng | `chevron.right` | `chevron-right` |
| Back (bổ sung map) | `chevron.left` | `chevron-left` |
| Undo (bổ sung map) | `arrow.uturn.backward` | `undo` |
| Share (bổ sung map) | `square.and.arrow.up` | `share` |

### Responsiveness (Tablet / Web) (BẮT BUỘC)

- **Breakpoint:** `useWindowDimensions` — ví dụ `width < 600` mobile; `600–1024` tablet; `> 1024` desktop web (điều chỉnh theo design).
- **Mobile:** một cột; bottom tab; `CanvasToolbar` dock dưới + safe area.
- **Tablet:** split **gallery | canvas** (hoặc drawer gallery); toolbar có thể cạnh phải/trái canvas.
- **Web:** `minWidth` cho dialog; hover optional; **thao tác chính không phụ thuộc hover** (touch-first giống mobile).

🧩 Component cần build (FULL)
Nhóm A — UI nền tảng
1. Button
- variants: contained, outlined, text
- states: loading, disabled, pressed
- hỗ trợ icon trái/phải

2. TextInput
- floating label
- error message + helper text
- password toggle

3. Card
- shadow (elevation)
- bo góc lớn (playful)
- hỗ trợ: header / content / actions

4. AppBar / Header
- title
- back button
- action icons

5. Modal / Dialog
- backdrop
- animation fade + scale
- confirm / cancel

6. Bottom Sheet
- kéo lên từ dưới
- snap points (ít nhất 2)

7. Tabs (nếu cần dùng nội bộ UI)
- underline animation
- swipe support (nếu làm được) hoặc fallback onPress

8. List / ListItem
- avatar (tùy chọn)
- title + subtitle
- right action

Nhóm B — Đặc thù Duti Draw (tô màu)
- **Layout gameplay (trace / level):** bố cục full-screen với header level + hint bubble, hai rail icon trái/phải, canvas trung tâm, Ad đáy — tham chiếu **`docs/demo_layout_init.jpeg`** và **`docs/demo_layout_draw.webp`**, chi tiết ở section **Màn hình tham chiếu — Layout gameplay**.

9. ColorPicker (QUAN TRỌNG)
- grid màu pastel
- chọn màu + highlight màu đang chọn
- hỗ trợ palette recent (tối thiểu in-memory; ưu tiên hooks/Zustand)

10. ToolButton (primitive cho toolbar)
- active/inactive/disabled/loading

11. CanvasToolbar
- tool buttons: Fill, Eraser/Erase, Undo, Redo, Zoom (Zoom có thể placeholder)
- dock phù hợp mobile/tablet (tối thiểu dock dưới)

12. ExportShareControls
- ExportPNG + ExportShare (callback theo props)

13. TemplateCard + TemplateGrid
- thumbnail + title/category (optional)
- loading + selected state

14. LoadingOverlay
- overlay + spinner (+ optional text)

Nhóm C — Icon System (BẮT BUỘC)
15. Tạo wrapper `<Icon />`
- dựa trên `IconSymbol`; mọi icon mới bổ sung qua **Icon System — Mapping** (`MAPPING`)
- hỗ trợ: `name`, `size`, `color` (ưu tiên semantic), `style`

🧠 UX Rules (bắt buộc)
- Touch target ≥ 44px (dùng `hitSlop` khi cần)
- Animation mượt, tránh giật
- Không clutter UI
- Trẻ em-first: dễ hiểu, trực quan
- Trạng thái rõ ràng: loading/disabled/active
- Accessibility tối thiểu: `accessibilityRole`, `accessibilityLabel`

📦 Output yêu cầu
- Code đầy đủ từng component (mỗi component là 1 file hoặc subfolder nhỏ trong `components/ui/`)
- Clean code, dễ maintain, tránh magic numbers
- Màu trong component UI: chỉ **semantic token** (qua `useThemeColor` / `useSemanticColor` / `theme.semantic`); primitive chỉ nằm trong lớp map theme (xem **Token Structure**)
- Mỗi component có ví dụ usage qua route `app/examples/<ComponentName>.tsx` (Expo Router)
- Tối ưu re-render: `React.memo`, `useMemo`, `useCallback` (đặc biệt cho danh sách/grids)

⚡ Bonus (nếu có thể)
- Dark mode support
- React Native Web compatible

🔥 Kết thúc (quan trọng)
- Generate code theo thứ tự dependency:
  1) Theme tokens / constants (nếu cần)
  2) Icon system (`<Icon />`)
  3) Primitives (`Button`, `ToolButton`, `TextInput`)
  4) Composites (`Card`, `Modal`, `ColorPicker`, `CanvasToolbar`, `TemplateCard/Grid`, `ExportShareControls`, `LoadingOverlay`)
- Mỗi component phải production-ready, copy vào dự án và chạy được ngay.