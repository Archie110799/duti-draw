# 🎮 Duti Draw — Gameplay & Level Design

Tài liệu mô tả gameplay theo **core loop 2 phase** (Tracing → Coloring) và chuẩn hoá asset cho 20 level đầu.

---

## 1. Core loop (2 phase / mỗi level)

### Phase 1 — Tracing (vẽ viền theo guide chấm)
- **Mục tiêu:** tạo outline của con vật.
- **Cách chơi:**
  - Màn hình hiển thị **đường guide dạng chấm (`...`)** với **Start/End**.
  - Người chơi **nhấn giữ** → bút bắt đầu vẽ; kéo theo guide để hoàn thành đường viền.
  - Hệ thống có thể **auto-snap nhẹ** vào path (tolerance) để thân thiện trẻ em.
- **Hoàn thành:** khi trace xong toàn bộ path → hiện nút **Tiếp tục**.

**Layout tham khảo (mode tracing):**
- UI tối giản, nhiều khoảng trắng để tập trung vào đường guide.
- Có header hiển thị **Level** và **tên con vật**.
- Khu vực chơi thể hiện **đường chấm** + điểm kết thúc (hoặc marker) và bút đang vẽ.

![Mode tracing layout](docs/demo_layout_init.png)

### Phase 2 — Coloring (tô màu theo vùng, không lem)
- **Mục tiêu:** tô hoàn chỉnh con vật.
- **Cách chơi:**
  - Con vật được chia thành các **vùng nhỏ** (ví dụ: **tay, chân, mũi, mắt, thân, đội mũ**…).
  - Palette **3–5 màu cho trước** (theo level).
  - Chọn màu → tap vùng → **fill theo vùng** (bucket fill) và **không lem** ra ngoài (mask/clip/region).
- **Hoàn thành level:** khi tất cả vùng đã tô → animation nhẹ + chuyển sang **màn/level tiếp theo**.

**Layout tham khảo (mode coloring):**
- Nhân vật/đối tượng ở trung tâm; bút “chạm” vào vùng để tô.
- Có các nút điều hướng/setting ở header (tuỳ build) nhưng không lấn khu vực chơi.
- Gợi ý palette hiển thị ở dưới (MVP có thể ẩn trong demo, nhưng layout nên chừa chỗ cho palette).

![Mode coloring layout](docs/demo_layout_draw.png)

> MVP có thể ship **Coloring-only** trước, nhưng hướng sản phẩm đầy đủ là **Tracing → Coloring**.

---

## 2. Level set ban đầu (20 levels / mỗi level 1 con vật)

### Nhóm 1 — Đơn giản (Level 1–5)
- 1: Gà con tròn
- 2: Ếch mặt cười
- 3: Heo hồng
- 4: Gấu trúc đơn giản
- 5: Thỏ tai dài

**Đặc điểm:** shape tròn/oval; **3–4 vùng màu**; path ngắn, ít curve.

### Nhóm 2 — Trung bình (Level 6–10)
- 6: Chó con
- 7: Mèo cute
- 8: Cáo nhỏ
- 9: Gấu nâu
- 10: Koala

**Đặc điểm:** thêm tai/chân/biểu cảm; **4–5 vùng**; curve phức tạp hơn.

### Nhóm 3 — Nâng cao (Level 11–15)
- 11: Hổ chibi (có sọc)
- 12: Sư tử bờm lớn
- 13: Bò sữa
- 14: Khỉ cười
- 15: Gà đội mũ

**Đặc điểm:** nhiều vùng nhỏ (sọc/bờm/phụ kiện); phù hợp palette 5 màu.

### Nhóm 4 — Cute + Fantasy (Level 16–20)
- 16: Kỳ lân
- 17: Rồng baby
- 18: Cá voi
- 19: Bạch tuộc
- 20: Khủng long

**Đặc điểm:** màu đa dạng hơn; path dài hơn → “satisfying draw”.

---

## 3. Style guide asset (bắt buộc)

- **Outline:** stroke đen dày (gợi ý 3–6px tuỳ export), linecap/linejoin tròn.
- **Cute factor:** mắt tròn + highlight; ít chi tiết nhưng biểu cảm rõ.
- **Màu tô:** flat color (gradient chỉ optional cho bản nâng cao).

---

## 4. Chuẩn hoá asset contract (để dev implement ổn định)

Mỗi level nên có:
- **SVG outline** (cho tracing): 1 path chính (hoặc vài path) + metadata Start/End.
- **Regions** (cho coloring): nhóm path theo vùng (mắt/mũi/tay/chân/thân/phụ kiện…).
- **Palette**: 3–5 màu + tên semantic (vd `fur`, `belly`, `accessory`, …) nếu cần guided mode.

---

## 5. Output asset trong repo (đã chọn)

- Generate **vector cho 20 con vật** trong 1 file SVG symbol sheet:
  - `assets/vectors/animals-20.symbols.svg`
  - Mỗi con vật là 1 `<symbol id=\"animal-xx-name\">` để dễ render/lookup.