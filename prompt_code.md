# Prompt Code — Duti Draw

Tài liệu **prompt chung** khi nhờ AI hoặc dev implement/review code trong repo **Duti Draw**. Mọi thay đổi kiến trúc / âm thanh / UI phải **bám** các spec sau.

---

## Tài liệu tham chiếu (bắt buộc đọc trước khi code)

| File | Nội dung |
|------|----------|
| `SYSTEM_DESIGN.md` | Tổng quan sản phẩm, tech stack, kiến trúc client/API, cấu trúc `app/`, gallery + canvas + export, React Query / Zustand / Expo Router, offline, hiệu năng, bảo mật |
| `DETAIL_FEATURES.md` | Feature spec chi tiết (20 level, 2 phase tracing→coloring, gallery/canvas/export/settings, monetization optional) |
| `GAMEPLAY.md` | Gameplay & level design (core loop 2 phase, danh sách 20 con vật, style guide asset, asset contract, output SVG symbols) |
| `Audio_Design_Specification.md` | BGM ambient/fantasy, SFX (brush, fill, color_select, complete, undo/redo), debounce ~100–200ms, tách volume `bgm` \| `sfx`, `expo-av`, preload, web autoplay |
| `UI_Component_System.md` | (Khuyến nghị) Token primitive → semantic, component library, layout gameplay (`docs/demo_layout_*`) |

**Mood / brand:** `docs/elsa-1.png` — Magical Candy Winter (băng + kẹo pastel), thân thiện trẻ em, không sao chép IP nhân vật.

---

## Biến (khai báo một lần cho mỗi task)

Chỉ dùng **tên biến** trong prompt; giá trị gán ở bảng — đổi khi đổi màn/module.

| Biến | Ý nghĩa | Ví dụ giá trị |
|------|---------|----------------|
| `SPEC_REF` | Spec hệ thống chính | `SYSTEM_DESIGN.md` |
| `FEATURE_REF` | Spec feature chi tiết | `DETAIL_FEATURES.md` |
| `GAMEPLAY_REF` | Spec gameplay/level | `GAMEPLAY.md` |
| `AUDIO_REF` | Spec âm thanh | `Audio_Design_Specification.md` |
| `UI_REF` | Spec UI component (nếu task UI) | `UI_Component_System.md` |
| `FEATURE` | Mô tả ngắn task hiện tại | `Màn draw/[id] + ColorPicker debounced` |
| `ROUTE` | Route Expo Router liên quan | `app/draw/[id].tsx` |
| `FILES` | File/folder chạm vào | `components/drawing/`, `services/api/templates.ts` |

---

## Chuẩn bị (dùng chung cho mọi luồng)

1. **Đọc** `SPEC_REF` — phạm vi: tô màu đa nền tảng; stack: Expo, RN, TS, Expo Router, Zustand, React Query, Axios; không mở rộng domain không liên quan (map/chat/booking…).
2. **Đọc** `FEATURE_REF` — nếu task liên quan luồng sản phẩm, màn hình, scope MVP/phase, hoặc logic unlock/progression.
3. **Đọc** `GAMEPLAY_REF` — nếu task liên quan **level**, **tracing**, **coloring theo vùng**, **asset SVG** (`animals-20.symbols.svg`) hoặc config level.
4. **Đọc** `AUDIO_REF` — nếu task chạm gesture/canvas/settings: BGM + SFX, debounce, volume tách kênh, preload; không SFX arcade/spam.
5. **Đọc** `UI_REF` — nếu task UI: semantic token (không hardcode primitive trong component), touch target ≥ 44px.
6. **Đối chiếu** `FEATURE`, `ROUTE`, `FILES` với cấu trúc trong `SYSTEM_DESIGN.md` §3 (Expo Router, `features/`, `services/api/`).

---

## Prompt gộp (dán cho AI khi implement)

Điền `FEATURE`, `ROUTE`, `FILES` trước khi gửi.

```text
Bạn là senior React Native (Expo) + TypeScript engineer. Dự án: Duti Draw — app tô màu đa nền tảng (Mobile, Web, Tablet).

BẮT BUỘC đọc và tuân thủ:
- SYSTEM_DESIGN.md (kiến trúc, Expo Router, React Query, Zustand, API modular, canvas/gallery, offline cache, hiệu năng)
- DETAIL_FEATURES.md (feature scope: 20 level, 2 phase tracing→coloring, flow chuyển màn, palette 3–5 màu, không lem)
- GAMEPLAY.md (gameplay contract + asset: 20 con vật, style outline, asset symbols/config)
- Audio_Design_Specification.md nếu task liên quan tương tác âm thanh (BGM/SFX, debounce, expo-av, volume bgm|sfx)

Nguyên tắc:
- Mood: Magical Candy Winter; thân thiện trẻ em; alias import @/* theo tsconfig
- Không thêm dependency/backend không cần thiết; chỉ sửa phạm vi FEATURE
- Canvas: tách UI chrome và surface vẽ; tránh re-render toàn app mỗi frame
- Audio: không spam SFX khi drag; debounce ~100–200ms; BGM fade; tôn trọng Silent switch / web autoplay

Task hiện tại:
- FEATURE: <Code GAME PLAY thực tế - FEATURE Chính>
- ROUTE: / 
- FILES ưu tiên: <app/(tabs)/index.tsx>

Deliverable: code TypeScript sạch, có types; không hardcode màu UI (dùng semantic/theme); không bỏ qua accessibility tối thiểu nếu có control tương tác.
```

---

## Prompt ngắn (chỉ audio)

Khi chỉ làm module âm thanh, dùng thêm mục **§8** trong `Audio_Design_Specification.md` hoặc copy prompt audio trong file đó.

---

## Ghi chú
- Nếu task chỉ refactor UI, có thể bỏ qua đọc `AUDIO_REF` nếu không đụng canvas/settings âm.
