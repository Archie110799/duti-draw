# Audio Design Specification — Duti Draw

Tài liệu mô tả **hệ thống âm thanh** cho **Duti Draw** (ứng dụng tô màu đa nền tảng: Mobile, Web, Tablet). Phong cách thương hiệu bám **Magical Candy Winter** (`docs/elsa-1.png`, `SYSTEM_DESIGN.md`): ambient fantasy nhẹ, nhạc nền thư giãn, SFX tương tác ngắn — phản hồi rõ mà **không** gây phân tâm, phù hợp trẻ em và giữ cảm giác sản phẩm **polished**.

**Không** trùng với `SYSTEM_DESIGN.md` — file này chỉ phạm vi **audio**.

---

## 1. Mục tiêu thiết kế âm thanh

Hệ thống âm thanh phải:

- Tạo cảm giác **magical – nhẹ – thư giãn**
- **Không** gây phân tâm hoặc quá kích thích
- Tăng **feedback trực quan** khi tô màu / chọn công cụ
- Phù hợp trẻ em nhưng vẫn giữ chất **SaaS / premium**

---

## 2. Nhạc nền (Background Music — BGM)

### 2.1 Mô tả nội dung

| Thuộc tính | Gợi ý |
|------------|--------|
| Thể loại | Ambient / fantasy / music box |
| Tempo | Chậm — **60–90 BPM** |
| Nhạc cụ | Piano nhẹ, music box, bell/chime mỏng, pad synth mềm |

### 2.2 Cảm giác (mood)

- **“Magical candy winter”** — sáng, lung linh, không u ám
- Loop **seamless** (không nghe rõ điểm nối)

### 2.3 Quy tắc phát & điều khiển

- **Volume mặc định BGM:** ~**20–30%** (scale 0–1 tùy implementation)
- **Fade in** khi vào màn phù hợp (vd gallery / canvas); **fade out** khi rời hoặc thoát app
- **Toggle BGM** trong Settings (persist `AsyncStorage` / tương đương)
- BGM **không** cắt đột ngột khi user thao tác nhanh (ưu tiên crossfade hoặc ducking nhẹ nếu sau này có voice-over)

---

## 3. Âm thanh tương tác (SFX — Interaction)

### 3.1 Brush / Fill (tô liên tục)

- **Kiểu:** “soft swish” / “brush glide”, hoặc “liquid fill” rất nhẹ
- **Độ dài:** **50–150 ms** mỗi lần phát có ý nghĩa
- **Tránh spam:** không phát mỗi pixel — xem mục 4 (debounce)

### 3.2 Chọn màu (Color select)

- **Kiểu:** “pop” / “bubble click”
- **Pitch:** hơi cao, vui, **không** chói

### 3.3 Hoàn thành vùng / milestone

- **Kiểu:** “sparkle” / “chime”; có thể lớp “bling” rất nhẹ
- Dùng khi **đủ điều kiện nghiệp vụ** (vd fill xong một vùng lớn / hoàn thành template) — không lặp liên tục

### 3.4 Undo / Redo

- **Undo:** “soft rewind” (ngắn, mềm)
- **Redo:** “forward click” (nhẹ, rõ hơn undo một chút)

### 3.5 Lỗi / hành động không hợp lệ

- **Rất nhẹ**, không harsh — **tránh** buzzer / âm “fail” kiểu arcade

### 3.6 Màn gameplay trace (nếu có — tham chiếu `docs/demo_layout_*`)

- **Bắt đầu nét / snap đúng đường:** có thể một tick “soft tick” (optional, volume thấp)
- **Hoàn thành level:** dùng chung family với “complete” (chime/sparkle), tránh stack SFX mới chỉ cho mode trace

---

## 4. Nguyên tắc UX âm thanh (bắt buộc)

### 4.1 Tránh

- Âm **quá to** so với BGM
- **Spam** khi drag (lặp SFX quá dày)
- **High-pitch** gắt hoặc kéo dài gây mệt

### 4.2 Bắt buộc

- **Debounce SFX** khi tô liên tục: không play mỗi frame — gợi ý interval **~100–200 ms** (có thể điều chỉnh theo UX test)
- **Tách volume:** `bgm` và `sfx` điều khiển **riêng** (slider hoặc nhóm trong Settings)
- **Mute toàn cục** (master) + tôn trọng **Silent switch** iOS / chế độ không làm phiền

---

## 5. Kiến trúc kỹ thuật (đề xuất)

### 5.1 Sound keys (TypeScript)

```typescript
type SoundKey =
  | 'bgm_main'
  | 'brush'
  | 'fill'
  | 'color_select'
  | 'complete'
  | 'undo'
  | 'redo'
  | 'error_soft'; // optional
```

### 5.2 Audio manager (interface gợi ý)

```typescript
class AudioManager {
  play(key: SoundKey): void;
  stop(key: SoundKey): void;
  setVolume(channel: 'bgm' | 'sfx' | 'master', value: number): void;
  toggleMute(): void;
}
```

### 5.3 Stack công nghệ (Expo / RN)

- Ưu tiên **`expo-av`** (đồng bộ Expo hiện tại) cho SFX ngắn + BGM; cân nhắc **`expo-audio`** / API mới theo bản Expo nếu dự án nâng cấp
- **Preload** asset âm thanh khi khởi động hoặc trước màn vẽ — **cache instance**, không load lại file mỗi lần `play`
- **Web:** kiểm tra autoplay policy — chỉ phát BGM sau gesture đầu tiên nếu trình duyệt chặn

---

## 6. Bảng ánh xạ hành vi → âm thanh (tinh chỉnh UX)

| Hành vi người dùng | SFX gợi ý |
|--------------------|-----------|
| Chạm chọn màu | Pop nhẹ |
| Tô liên tục (brush) | Swish debounced |
| Fill vùng lớn | Whoosh nhẹ (một shot hoặc debounced) |
| Hoàn thành tranh / milestone | Chime + sparkle (ít lần) |
| Idle lâu | Chỉ BGM (hoặc tắt SFX tự nhiên) |

---

## 7. Tư duy sản phẩm

- **Duti Draw không phải game arcade** → tránh quá nhiều SFX và âm “thắng/thua” kiểu máy slot
- **Cũng không phải tool khô** → vẫn cần **cảm xúc** và **feedback** rõ ràng

**Balance:** calm + playful + premium.

---

## 8. Prompt (dùng cho AI / implement)

Dán khối dưới khi yêu cầu code hoặc review:

```text
Bạn là engineer làm audio cho app React Native (Expo) "Duti Draw" — app tô màu, mood Magical Candy Winter.

Yêu cầu:
- BGM: ambient/fantasy/music box, 60–90 BPM, loop seamless, volume mặc định ~20–30%, fade in/out, toggle trong Settings.
- SFX: brush/fill ngắn 50–150ms, color_select pop nhẹ, complete sparkle/chime, undo/redo mềm, error rất nhẹ — không arcade.
- Debounce SFX khi tô liên tục (~100–200ms), không spam theo pixel.
- Tách volume bgm | sfx (và master nếu cần), preload + cache sound, ưu tiên expo-av trừ khi dự án đã chọn thư viện khác.
- Tuân thủ Silent switch / không làm phiền; web xử lý autoplay.

Deliverable: module AudioManager + hook useSoundSettings + ví dụ gắn vào màn canvas (play debounced brush, BGM theo lifecycle).
```

---

*Tài liệu: Audio Design Specification — Duti Draw. Phiên bản chỉnh sửa prompt & cấu trúc Markdown; đồng bộ mood với `SYSTEM_DESIGN.md` và tham chiếu layout gameplay khi có mode trace (`docs/demo_layout_init.jpeg`, `docs/demo_layout_draw.webp`).*
