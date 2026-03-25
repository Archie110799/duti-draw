# Basic Design (BD) — authoring guide

Tài liệu tham chiếu: [`frontend-conventions.md`](./frontend-conventions.md) (FE), [`backend-conventions.md`](./backend-conventions.md) (BE), [`DB_DESIGN_new_crm.md`](../DB_DESIGN_new_crm.md) (DB).

**Mục tiêu:** Viết file **Basic Design** (仕様書レベル) cho một màn hình. **Mẫu cấu trúc API GET + POST** dùng **`BD_DEMO` (`docs/bd-demo.md`)**; bám **`SPEC_REF`**, **`DB_DESIGN`**, **`UI_REF`**. Output là Markdown dưới `docs/` (hoặc tương đương).

---

## Biến (khai báo một lần)

Các phần sau chỉ dùng **tên biến**; giá trị gán ở bảng dưới. Khi đổi màn / spec / tài liệu DB, sửa **một chỗ** trong bảng.

| Biến | Giá trị (ví dụ) | Ý nghĩa |
|------|-----------------|--------|
| `SCR_ID` | `CRMS-SCR-013` | Mã màn hình (screen ID) trong tài liệu |
| `SCREEN_TITLE_JA` | `案件詳細_レビューURL設定` | Tên màn tiếng Nhật (dòng tiêu đề `#`) |
| `UI_REF` | `UI_url-form-template.png` | Wireframe / mockup tham chiếu (ảnh hoặc tên file) |
| `SPEC_REF` | `bd-my-screen` | Slug / tên tài liệu spec của màn (không `.md`) |
| `DB_DESIGN` | `DB_DESIGN_new_crm.md` | File thiết kế DB; trích **§ mục** bảng liên quan |
| `BE_MODULE` | `url-form-template` | Tên module / API path gợi ý trên BE (tham chiếu [`backend-conventions.md`](./backend-conventions.md)) |
| `OUTPUT_BD` | `bd-<feature-slug>.md` | Tên file BD output (ví dụ `bd-my-screen.md`) |
| `BD_DEMO` | `docs/bd-demo.md` | **Chỉ 2 API mẫu:** **EV001** `デモ登録 - API POST` + **EV002** `デモ詳細取得 - API GET` → **（参考）** Excel TSV / JSON。Chi tiết: mục **Cấu trúc `BD_DEMO`** bên dưới. |

**File mẫu duy nhất:** **`BD_DEMO`**（1 GET + 1 POST + 参考 Excel/JSON）。Các pattern khác（一覧・読込・登録複雑）mở rộng **trên cơ sở cùng Rule** trong prompt này và **`SPEC_REF`**, không bắt buộc file mẫu riêng.

---

## Cấu trúc `BD_DEMO` (`docs/bd-demo.md`)

File mẫu **chỉ** gồm các mục sau (thứ tự — BD thật thường thêm `参照` / `本画面と…` ở đầu theo tài liệu này § **Cấu trúc file BD output**):

| Thứ tự | Mục trong `BD_DEMO` | Nội dung / khối con |
|--------|---------------------|---------------------|
| 1 | Tiêu đề + **役割** + **bảng 見本**（2 dòng: POST / GET）+ **書式メモ** + **`参照:`** | — |
| 2 | `## 項目定義（抜粋）` | Header TAB + dòng control（mẫu tối giản） |
| 3 | `## イベント` | Header TAB: イベントコード / 名称 / 処理内容 |
| 4 | `## API仕様 (デモ登録 - EV001) - API POST` | `### 概要` → **・対象テーブル** → **・登録項目** → `### 入力パラメータ (Request Body)` (TAB) → **・バリデーション** → **・レスポンス** → **・登録後の処理** → `### 処理ステップ（例）` (TAB) |
| 5 | `## API仕様 (デモ詳細取得 - EV002) - API GET` | `### 概要`（EV002 に対応）→ `### 入力パラメータ (Query Parameters)` (TAB) → `### 出力 (Response Body)` (TAB) → **Query 例** |
| 6 | `## （参考）Excel 貼り付け用 — 登録項目…` | Fence TSV |
| 7 | `## （参考）Response 例（GET 単体・JSON）` | Fence JSON |

**Ghi nhớ:** Trong `BD_DEMO`, **EV001** → `## API仕様 (デモ登録 - EV001) - API POST`；**EV002** → `## API仕様 (デモ詳細取得 - EV002) - API GET`。

---

## Nguyên tắc

1. **Bám `SPEC_REF` và `UI_REF`:** mọi item trên màn (label, button, field) phải lần lượt có dòng trong bảng **画面項目一覧**; không bỏ sót vùng trên wireframe.
2. **Bám `DB_DESIGN`:** cột **備考** ghi rõ **物理名** bảng/cột (ví dụ `url_form_template.name`); chỉ dùng bảng/cột đã có trong DB設計書 hoặc ghi rõ nếu là mở rộng.
3. **Đồng nhất format** với các file mẫu: cùng loại bảng, cùng tên cột tiếng Nhật, cùng pattern **イベントコード (EVxxx)** và **`## API仕様`** — nhưng **khối con khác nhau giữa GET và POST** (xem mục **Rule API GET / POST** bên dưới).
4. Ngôn ngữ: **tiếng Nhật** cho tiêu đề màn, tên item, tên event, mô tả API (giống file mẫu); có thể thêm ghi chú tiếng Việt/English trong **備考** nếu team cần.

---

## Rule API GET vs POST (Basic Design)

### Phân loại trong tài liệu BD

| Phương thức / vai trò | Khi nào ghi | Tiêu đề section gợi ý |
|------------------------|-------------|-------------------------|
| **GET — 単体取得** | Dữ liệu màn hình / block (初期表示), chi tiết 1 entity theo id | `## API仕様 (〈機能名〉取得 - EVxxx) - API GET`（**`BD_DEMO` § デモ詳細取得 - EV002**） |
| **GET — 一覧・検索** | Danh sách, filter (EV検索), phân trang | `## API仕様 (〈一覧名〉取得 - EVxxx/検索)` — bổ sung **対象テーブル・取得項目・取得条件・結合・備考** (Rule GET §5) |
| **POST / PUT / PATCH** | Đăng ký, cập nhật, ghi DB có **Request Body** | `## API仕様 (EVxxx: 日本語タイトル) - API POST`（**`BD_DEMO` § デモ登録**） |
| **読込（参照のみ・クローン）** | Chọn ID → load DB → đổ form, **không ghi DB**; BD có thể ghi **`- API POST`** trong tiêu đề | Cùng khối **・取得項目・取得条件・結合・入力・出力・データソース** (Rule GET §7) |

---

### Rule — API **GET**

1. **Không** dùng **Request Body** làm input chính; ghi **`### 入力パラメータ (Query Parameters)`** (hoặc tên tương đương **Query / Path** nếu có `:id` trên URL).
2. Bảng input: **項目名 | 物理名 | タイプ | 必須 | 備考** (đồng bộ **`BD_DEMO` § デモ詳細取得 - EV002** — `### 入力パラメータ (Query Parameters)`).
3. **`### 出力 (Response Body)`** — bảng: **項目名 | 物理名 | タイプ | 備考**; cột **集計** / field ghép nhiều bảng ghi rõ nguồn trong **備考** (ví dụ 集計値、`staff.name`).
4. **GET 単体取得** không bắt buộc có: `処理ステップ`, `API Body` JSON request. Có thể thêm một dòng **Query 例:** `GET /api/...?id=1` hoặc path 例 nếu giúp dev.
5. **GET 一覧・検索** bắt buộc có đủ các khối sau khi BD chi tiết:
   - **`### 対象テーブル`** — danh sách bảng đọc.
   - **`### 入力パラメータ`** — tham số filter (query); ghi **任意** / **必須**; cho phép bảng rút gọn **入力 | タイプ | 必須** nếu team thống nhất (như file mẫu).
   - **`### 取得項目`** — 項目名 (cột màn / response) ↔ **取得元** (`table.column`).
   - **`### 取得条件`** — điều kiện WHERE (`=`, `LIKE %...%`, `DATE(...)`).
   - **`### テーブル結合条件`** — JOIN giữa các bảng.
   - **`### 備考`** — ví dụ: điều kiện tất cả **任意** → không truyền thì **全件**; **ページネーション**; format ngày giờ.
6. Response GET có thể bọc trong `data` — ghi trong **出力** hoặc **備考**; không cần JSON例 đầy đủ nếu bảng **出力** đã đủ; có thể thêm **Response 例** JSON ngắn nếu giúp trace field.

7. **API 読込（クローン・参照のみ）:** **・取得項目**（không phải ・登録項目）, **・取得条件**, **・テーブル結合条件**, `### 入力パラメータ (Query / Body)`, `### API Body（…リクエスト・取得条件）`, `### 出力項目`, `### データソース`.

---

### Rule — API **POST** / **PUT** / **PATCH** (ghi DB)

1. **`### 概要`** — nút / EV nào gọi; **対象テーブル** (bullet `-`); mapping **登録項目 / 更新項目** — **bắt buộc** theo format mục **Format ・登録項目・バリデーション** (cùng **`BD_DEMO` § デモ登録 - EV001**).
2. **`### 入力パラメータ (Request Body)`** — **một dòng header + các dòng dữ liệu**, cột phân cách bằng **ký tự TAB** (không dùng bảng Markdown `| |`): **項目名	物理名	タイプ	必須	備考** (như **`BD_DEMO` § デモ登録**).
3. **`・バリデーション`** — **bắt buộc** theo format mục **Format ・バリデーション** (cùng **`BD_DEMO` § デモ登録**).
4. **`### 処理ステップ`** — transaction, 新規 vs 更新, 論理削除 / クリーニング子テーブル (khi API ghi DB phức tạp).
5. **`### 出力 (Response)`** + **`## API Body`** — JSON例; HTTP status (**201 Created** cho新規, **200** cho更新) ghi trong **`・レスポンス`** (bullet `-`) hoặc **概要** (xem **`BD_DEMO` § デモ登録**).
6. **`・登録後の処理` / `・更新後の処理`** — bullet `-` từng dòng (xem **`BD_DEMO` § デモ登録**).

---

### Format ・登録項目・バリデーション (Excel / `BD_DEMO`)

Tham chiếu: **`BD_DEMO` mục 4**（bảng Cấu trúc `BD_DEMO`）— `## API仕様 (デモ登録 - EV001) - API POST`（・対象テーブル / ・登録項目 / 入力 / ・バリデーション / ・レスポンス / ・登録後の処理 / 処理ステップ）.

#### ・対象テーブル

- Dòng **`・対象テーブル`** (dấu `・` fullwidth + text).
- Liệt kê bảng bằng bullet **`-`** (halfwidth hyphen + space), ví dụ `- staff_receive（応対履歴）※メイン`.

#### ・登録項目 / ・更新項目

1. Dòng tiêu đề **`・登録項目`** hoặc **`・更新項目`** (fullwidth `・`).
2. Dòng **`**table_name**`** — tên bảng DB in đậm (ví dụ `**staff_receive**`).
3. Mỗi cột mapping **một dòng** (cùng style L121–132):

   `table.column` + (TAB căn chỉnh tùy chừng) + `=` + TAB + `request_field(論理名)` + space + `※備考`

   - Ví dụ: `staff_receive.staff_id		=	staff_id(スタッフID) ※URLパラメータから取得`
   - `request_field` là tên field trong JSON / form; `(論理名)` là tên hiểu nghĩa tiếng Nhật.

4. **Excel:** có thể **thêm** khối TSV phụ (trong ` ``` ` hoặc bảng text) với cột: `テーブル	カラム(物理)	マッピング先	論理名	備考` — cùng nội dung với các dòng mapping — để copy trực tiếp vào sheet (xem **`BD_DEMO` mục 6**「（参考）Excel 貼り付け用」).

#### ・バリデーション

1. Dòng **`・バリデーション`** (fullwidth `・`).
2. Mỗi rule **một dòng** bắt đầu bằng **`-`** (halfwidth hyphen + space), ví dụ:

   `- method、dealing_content_id は必須（未選択の場合は登録ボタンを非活性にする）`

3. Không thay `-` bằng `*` hay bullet Unicode khác — giữ đúng như file mẫu để paste/parse thống nhất.

#### Bảng tham số & màn hình — TAB để paste Excel

- **画面項目 / 項目定義**, **イベント**, **`### 入力パラメータ`**, **`### 出力 (Response Body)`**: viết **một dòng header**, xuống dòng **từng dòng dữ liệu**, **cột cách nhau bằng TAB** (như **`BD_DEMO`** 各§).
- **Không** dùng bảng Markdown `| col | col |` cho các khối cần copy sang Excel (Excel không tách cột từ pipe table khi paste từ preview thường).
- GET **Query Parameters** / **出力** cùng quy tắc TAB.

---

### Gắn với イベント (EV)

- API **GET** gắn với **初期表示** có thể chỉ mô tả trong **概要** (“画面表示時に呼び出す”) mà không lặp EV trên tiêu đề section.
- API **GET** do **検索 / 絞り込み** gọi: tiêu đề nên có **EVxxx** (ví dụ `EV009/検索`) để trace từ `# イベント` → `# API仕様`.
- API **POST** gắn **EVxxx** trên tiêu đề section (cùng style **`BD_DEMO`**).

---

## Cấu trúc file BD output (bắt buộc theo thứ tự)

**Khối API cụ thể:** dùng **`BD_DEMO`** làm khung **1 POST + 1 GET**; thêm API khác（一覧・読込・…）theo **Rule API GET vs POST** khi `SPEC_REF` cần.

**Phần đầu file (trước 項目定義)** — thường có thêm so với `BD_DEMO` tối giản:

### 1. Tiêu đề

```markdown
# SCR_ID : SCREEN_TITLE_JA
```

### 2. 参照

- Dòng **`参照:`** liệ kê `DB_DESIGN` và các bảng + **§** (section) tương ứng trong DB設計書.
- Nếu có master / type code ảnh hưởng màn, thêm **bảng cấu trúc master** (物理名 | データ型 | 備考).

### 3. 本画面と … の対応 (khi áp dụng)

- Bảng ánh xạ: màn này ↔ điều kiện nghiệp vụ / type / API constraint (theo mẫu **本画面と dealing_content.type の対応**).

### 4. 画面項目一覧 / 項目定義

- Cột (đủ cột, cùng thứ tự như mẫu): No, 項目名, 項目タイプ, 文字種, 文字数, 初期値, 入力必須, イベントコード, 備考.
- **Hai cách trình bày:** (1) Bảng Markdown `| ... |`; (2) **Một dòng header + dòng dữ liệu, phân cách TAB** như **`BD_DEMO` § 項目定義** — **ưu tiên (2)** nếu cần copy vào Excel.

### 5. `# イベント` / `## イベント`

- **Hai cách:** (1) Bảng Markdown; (2) **TAB** — header `イベントコード	イベント名称	処理内容` + từng dòng (như **`BD_DEMO` § イベント**).
- Mỗi EV trong bảng item phải có một dòng; **処理内容** đủ để dev implement.

### 6. `# API仕様` / `## API仕様` — lặp theo từng API

Áp dụng **Rule API GET vs POST** và **bảng Cấu trúc `BD_DEMO`**:

- **POST 登録（ghi DB）:** khối **`BD_DEMO` mục 4** — `## API仕様 (… - EVxxx) - API POST` + **・登録項目** … (xem **Rule POST**).
- **GET 単体:** khối **`BD_DEMO` mục 5** — `Query Parameters` + `出力 (Response Body)`.
- **読込 / GET 一覧:** **không** có trong `BD_DEMO` tối giản — xem **Rule GET** mục 5–7.
- **（参考）:** tùy chọn — **`BD_DEMO` mục 6–7**（Excel TSV / JSON）.

---

## Quy ước bổ sung (khớp mẫu)

- **イベントコード:** bắt đầu `EV001`, tăng dần; không trùng trong cùng màn.
- **API:** POST/更新 — tiêu đề có **EVxxx**; GET 検索 — nên có **EVxxx** trong tiêu đề để trace; GET 初期表示 — có thể không có EV trên tiêu đề.
- **JSON 例:** chỉ bắt buộc với **Request Body** (POST/PUT/PATCH); GET dùng Query/Path 例 thay thế nếu cần.
- **読込** — tài liệu có thể ghi **`- API POST`** trong tiêu đề nhưng **không** ghi DB; không gộp với **POST 登録**（・登録項目）.
- Cuối API phức tạp có thể thêm **`## データソース`** trỏ `DB_DESIGN` §.

---

## Checklist — Definition of Done (BD)

- [ ] Tiêu đề `# SCR_ID : SCREEN_TITLE_JA` đúng biến.
- [ ] **参照** có `DB_DESIGN` + bảng + §; master/type có bảng giải thích nếu cần.
- [ ] Bảng **画面項目** đủ No., khớp `UI_REF` (không thiếu control).
- [ ] Mọi EV trên item có dòng trong `# イベント`.
- [ ] **GET:** mỗi API có **概要** + **Query/Path 入力** + **出力**; riêng 一覧・検索 có thêm **対象テーブル・取得項目・取得条件・結合・備考** (theo rule GET).
- [ ] **読込（- API POST）**（nếu có）: đủ khối **Rule GET §7**; không nhầm với POST 登録.
- [ ] **POST/PUT/PATCH:** mỗi API có **概要** + **・対象テーブル** + **・登録項目** (đúng format dòng `table.col = field(論理名) ※`) + **入力パラメータ (TAB)** + **・バリデーション** (mỗi rule dòng `- `) + **処理ステップ** (nếu ghi DB) + **・レスポンス** + **JSON 例** + **・登録後の処理** khi cần.
- [ ] Các khối cần paste Excel dùng **TAB** (không chỉ pipe table); tham chiếu `BD_DEMO`.
- [ ] 備考 ghi FK / マスタ / 制約 khớp `DB_DESIGN`.
- [ ] Tên file output gợi ý: `OUTPUT_BD` (hoặc tương đương trong `docs/`).

---

## Gợi ý thực thi

1. Đọc `SPEC_REF`, `UI_REF`, `DB_DESIGN` (các § liên quan `BE_MODULE`).
2. Lập danh sách item theo wireframe (trái → phải, trên → dưới).
3. Liệt kê API: **初期表示 GET** / **検索 GET** / **登録 POST** … rồi gán EV (nếu có) và viết `# イベント`.
4. Viết khối **API仕様** theo đúng loại GET hoặc POST (mục **Rule API GET vs POST**).
5. So khớp **khung tối thiểu** với **`BD_DEMO`**（**1 GET + 1 POST**）; mở rộng theo **Rule** và **`SPEC_REF`** khi cần.
