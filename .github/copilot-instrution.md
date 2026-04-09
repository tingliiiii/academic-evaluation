# 期末評語生成系統 - 開發指南

**Last Updated:** 2026-04-06

**專案狀態：** Phase 1-3 Complete ✅ | Phase 4-5 待開始 | Phase 6-7 計劃中

## 📌 專案概述

**快速評語生成系統** 是一個 Next.js 前後端Web應用，協助教師快速生成學生期末評語。

**流程：**
1. 老師輸入學生姓名、選擇形容詞、選擇語氣
2. 系統自動生成發送給 Gemini API 的 prompt
3. 老師確認後，呼叫 Gemini API 生成最終評語
4. 評語儲存至資料庫，可查詢歷史記錄
5. 後台管理：老師可動態管理形容詞和語氣列表（CRUD）

---

## 🏗️ 技術堆疊

| 層次 | 技術 |
|------|------|
| **前端** | React 19 Next.js 16 shadcn/ui Tailwind CSS |
| **後端** | Next.js API Routes Node.js |
| **資料庫** | PostgreSQL (Supabase) Prisma ORM |
| **AI整合** | Google Gemini API |
| **部署** | Vercel GitHub Actions CI/CD |
| **表單管理** | react-hook-form Zod |

---

## 📁 專案結構

```text
academic-evaluation/
├── app/
│   ├── layout.tsx                  # 布局
│   ├── page.tsx                    # 首頁（評語生成表單）
│   ├── globals.css                 # 全域樣式
│   ├── api/
│   │   ├── prompt/
│   │   │   └── generate/route.ts   # 生成 prompt 預覽
│   │   ├── evaluation/
│   │   │   └── generate/route.ts   # 生成評語（呼叫 Gemini）
│   │   ├── evaluations/
│   │   │   ├── list/route.ts       # 取得評語列表
│   │   │   └── [id]/route.ts       # 取得評語詳情
│   │   └── admin/
│   │       ├── wisdoms/route.ts    # 形容詞 CRUD
│   │       └── tones/route.ts      # 語氣 CRUD
│   ├── history/
│   │   └── page.tsx                # 評語歷史頁面
│   └── admin/
│       ├── page.tsx                # 後台管理首頁
│       ├── wisdoms/page.tsx        # 形容詞管理
│       ├── tones/page.tsx          # 語氣管理
│       └── layout.tsx              # 後台佈局
├── components/
│   ├── ui/                         # shadcn/ui 元件
│   ├── StudentInfoForm.tsx         # 學生資訊輸入
│   ├── WisdomSelector.tsx          # 形容詞選擇器
│   ├── ToneSelector.tsx            # 語氣選擇器
│   ├── EvaluationForm.tsx          # 整合表單
│   ├── PromptPreview.tsx           # Prompt 預覽
│   ├── EvaluationResult.tsx        # 評語展示
│   ├── EvaluationHistory.tsx       # 歷史列表
│   ├── WisdomManager.tsx           # 形容詞管理元件
│   └── ToneManager.tsx             # 語氣管理元件
├── lib/
│   ├── types.ts                    # TypeScript 型別定義
│   ├── gemini.ts                   # Gemini API 封裝
│   ├── prompts.ts                  # Prompt 模板引擎
│   ├── prisma.ts                   # Prisma Client 實例
│   └── utils.ts                    # 工具函式
├── prisma/
│   ├── schema.prisma               # Prisma 資料模型
│   ├── seed.ts                     # 初始化腳本
│   └── migrations/                 # 資料庫遷移記錄
├── public/                         # 公開資源
├── .github/
│   └── workflows/                  # GitHub Actions 流水線
├── .env                            # 環境變數範本（Git 追蹤）
├── .env.local                      # 本地環境變數（Git 忽略）
├── .gitignore                      # Git 忽略設定
├── package.json                    # 專案套件
├── tsconfig.json                   # TypeScript 設定
├── tailwind.config.js              # Tailwind CSS 設定
├── next.config.ts                  # Next.js 設定
└── README.md                       # 專案說明文件
```

---

## 📁 核心文件地圖

```text
app/api/
├── prompt/generate/          ✅ 生成 prompt 預覽
├── evaluation/generate/      ✅ 呼叫 Gemini 生成評語
├── evaluations/
│   ├── list/                 ✅ 查詢歷史 (分頁)
│   └── [id]/                 ✅ 取得/刪除詳情
└── admin/
    ├── wisdoms/              ✅ 形容詞 CRUD
    └── tones/                ✅ 語氣 CRUD

lib/
├── gemini.ts                 ✅ Gemini API 封裝
├── prompts.ts                ✅ Prompt 模板引擎
├── types.ts                  ✅ TypeScript 定義
└── prisma.ts                 ✅ Prisma Client

prisma/
├── schema.prisma             ✅ 5 個模型 初始化
└── seed.ts                   ✅ 6 形容詞 4 語氣 2 學生
```

---

## ✅ 完成進度

| Phase | 名稱 | 狀態 | 完成度 |
|-------|------|------|--------|
| 1 | 專案初始化 | ✅ 完成 | 100% |
| 2 | 資料層 & API 層 | ✅ 完成 | 100% |
| 3 | 前端 UI & 互動 | ✅ 完成 | 100% |
| 4 | 類型定義 & API 文檔 | ✅ 完成 | 100% |
| 5 | 測試框架 & 覆蓋 | ✅ 完成 | 100% |
| 6 | 測試 & 部署準備 | ⏳ | 0% |
| 7 | Vercel 部署 | ⏳ | 0% |


### 第一階段：專案初始化 ✓ 已完成
- [x] Next.js 專案初始化（TypeScript App Router Tailwind CSS）
- [x] 核心套件安裝（@google/generative-ai、@prisma/client、react-hook-form、zod 等）
- [x] Prisma 初始化與設定
- [x] 環境變數設置（.env）
- [x] shadcn/ui 元件庫初始化及預安裝（Button、Input、Select、Card、Dialog、Table 等）
- [x] 本地開發伺服器驗證（http://localhost:3000 可訪問）

### 第二階段：資料層 & API 層 ✓ 已完成
- [x] Prisma schema 定義（Wisdom、Tone、Student、Evaluation、EvaluationWisdom 五張表）
- [x] Prisma seed 腳本編寫（初始化預設形容詞和語氣）
- [x] 環境設定檔優化（DATABASE_URL、DIRECT_URL 已設定）
- [x] TypeScript 型別定義（lib/types.ts）
- [x] 資料庫遷移執行（`npx prisma migrate dev --name init`）
- [x] Gemini API 層實作（lib/gemini.ts、lib/prompts.ts）
- [x] API 路由實作並通過測試
  - [x] /api/prompt/generate — 生成 prompt 預覽
  - [x] /api/evaluation/generate — 呼叫 Gemini 生成評語
  - [x] /api/evaluations/list — 取得評語歷史
  - [x] /api/evaluations/[id] — 取得/刪除評語詳情
  - [x] /api/admin/wisdoms — 形容詞 CRUD（認證保護）
  - [x] /api/admin/tones — 語氣 CRUD（認證保護）
- [x] 完整的輸入驗證（Zod schemas）
- [x] RESTful API 設計 & 錯誤處理
- [x] TypeScript 型別檢查通過

#### 測試結果
- ✅ 所有 API 端點正常運作
- ✅ Gemini API 已調整為 gemini-2.5-flash 模型
- ✅ 完整流程驗證：生成 Prompt → 呼叫 Gemini → 儲存評語
- ✅ 資料庫與 Prisma 正常工作

### 第三階段：前端 UI & 互動 ✅ 已完成
- [x] 表單元件（StudentInfoForm、WisdomSelector、ToneSelector、EvaluationForm）
- [x] Prompt 預覽元件（PromptPreview）
- [x] 評語展示與歷史頁面（EvaluationResult、EvaluationHistory） 
- [x] 後台管理頁面（Admin 頁面、WisdomManager、ToneManager）
- [x] 全域佈局與導覽（Navbar、Layout）
- [x] 頁面路由與導航（Dashboard、Admin、History）
- [x] 表單驗證與狀態管理
- [x] API 集成與資料流程
- [x] 認證檢查與路由保護

### 第四階段：類型定義 & API 文檔 ✅ 已完成
- [x] 擴展 TypeScript 型別定義（40個型別，完整文檔）
- [x] 建立 OpenAPI 3.0 規範（lib/openapi.ts）
- [x] API 端點 JSDoc 註解（POST/GET handlers）
- [x] Swagger UI 集成（public/swagger.html）
- [x] API 文檔端點（/api/docs）

### 第五階段：測試框架 ✅ 已完成
- [x] Vitest 配置及安裝（v3.2.4）
- [x] API 測試套件（24 個測試用例）
- [x] 組件單元測試（EvaluationForm、StudentInfoForm、ToneSelector、WisdomSelector、EvaluationHistory）
- [x] 端到端集成測試（10 個完整工作流程）
- [x] 測試命令配置（npm run test:* 齊全）
- [x] 快速開始文檔（QUICK_START.md）
- [x] 詳細測試指南（TEST_AND_API_GUIDE.md）

**總計：334個測試案例，全域覆蓋**

### 第六階段：測試 & 部署準備 ⏳ 待開始
- [ ] 本地開發測試
- [ ] 環境設定檔（.env.example、.gitignore）
- [ ] GitHub 初始化 & 推送
- [ ] GitHub Actions CI/CD 設置

### 第七階段：部署到 Vercel ⏳ 待開始
- [ ] Vercel 專案設定
- [ ] 資料庫部署（Supabase PostgreSQL）
- [ ] 首次正式環境驗證

---

## 🎯 下一步（Phase 6：部署準備與優化）

### Phase 3 已交付成果 ✅
✅ 所有核心 UI 元件（9 個）完全實現
✅ 所有頁面路由（6 條）功能完整
✅ 表單驗證與狀態管理整合
✅ API 集成與資料流程已通
✅ 認證檢查與路由保護就位
✅ 334個測試用例覆蓋全棧
+
### 待優化項目
1. UI 細節微調與響應式設計最佳化
2. 載入狀態與骨架屏增強
3. 無障礙（A11y）功能完整性
4. 性能最佳化（代碼分割、記憶化）
5. 端到端集成測試強化

---

## 🔐 環境變數清單

```env
# Supabase 連線
DATABASE_URL=postgresql://[...pooler.supabase.com:6543/](https://...pooler.supabase.com:6543/)...
DIRECT_URL=postgresql://[...pooler.supabase.com:5432/](https://...pooler.supabase.com:5432/)...

# Gemini API
GEMINI_API_KEY=your_api_key
NEXT_PUBLIC_GEMINI_MODEL=gemini-2.5-flash

# 後台管理
ADMIN_PASSWORD=your_password
```

✅ 已設定於 `.env.local` (Git 忽略)

---

## 🔧 本地開發指南

### 環境要求
- Node.js >= 18
- npm
- Supabase 帳戶（已設定）
- Gemini API Key（已設定於 .env）

### 啟動開發伺服器
```bash
npm run dev              # 啟動開發伺服器 (http://localhost:3000)
npx tsc --noEmit       # 型別檢查
npm run lint           # 程式碼檢查
npx prisma studio     # 查看資料庫
```

### 測試命令
```bash
npm run test           # 運行所有測試（監視模式）
npm run test:run       # 一次性運行所有測試
npm run test:api       # 僅 API 測試
npm run test:components # 僅組件測試
npm run test:integration # 僅集成測試
npm run test:coverage  # 生成覆蓋率報告
```

### 查看文檔
```bash
# 啟動開發伺服器後訪問：
http://localhost:3000/swagger.html  # Swagger UI
http://localhost:3000/api/docs      # OpenAPI JSON

# 查看文檔：
QUICK_START.md                      # 5 分鐘快速開始
TEST_AND_API_GUIDE.md               # 完整測試和 API 指南
```

---

## 📋 常用命令

### 資料庫操作
```bash
npx prisma migrate dev --name "<description>"  # 建立遷移
npx prisma db seed                             # 填充初始資料
npx prisma migrate reset                       # 重置資料庫
npx prisma studio                              # 打開 Prisma Studio
```

### API 測試
```bash
curl -X POST http://localhost:3000/api/prompt/generate \
  -H "Content-Type: application/json" \
  -d '{"studentName":"小明","wisdomIds":["id"],"toneId":"id"}'
```

### 後台管理 API（需要認證）
```bash
curl -X GET http://localhost:3000/api/admin/wisdoms \
  -H "Authorization: Bearer $ADMIN_PASSWORD"
```

---

## 📚 常用命令速查表

```bash
# 開發迭代
npm run dev                           # 啟動開發伺服器
npx tsc --noEmit                      # 型別檢查
npm run lint                          # 程式碼檢查

# 測試命令
npm run test                          # 監視模式
npm run test:run                      # 一次性運行
npm run test:coverage                 # 覆蓋率報告

# 資料庫操作
npx prisma migrate dev --name <name>  # 建立新遷移
npx prisma migrate reset              # 重置資料庫
npx prisma db seed                    # 執行 seed
npx prisma studio                     # 打開資料庫管理介面
npx prisma generate                   # 重新生成 Prisma Client

# Git 操作
git add .
git commit -m "feat: description"
git push origin main

# 查看 API 文檔
# 啟動 npm run dev 後訪問：
# http://localhost:3000/swagger.html
curl http://localhost:3000/api/docs   # 取得 OpenAPI JSON
```

---

## 📚 已知的技術情報

### Zod v4兼容
- ✅ 使用 `.issues` 替代 `.error.errors`
- ✅ 所有驗證路由已修復

### Prisma null/undefined 轉換
- ✅ 可選欄位使用 `?? undefined` 轉換
- ✅ 短路求值使用 `!!()` 強制轉型

### Supabase 連線池
- ✅ DATABASE_URL 用於應用連線（連線池）
- ✅ DIRECT_URL 用於遷移（直接連線）

**詳細文件：** 見 react-typescript.instructions.md、prisma-orm.instructions.md、api-routes.instructions.md 各文件或開發日記章節

---

## 🔍 故障排除快速表

| 問題 | 症狀 | 解決方案 |
|------|------|---------|
| Seed 無輸出 | `npx prisma db seed` 沒有資訊 | ✅ 已修復 - package.json 設定 OK |
| 型別檢查失敗 | TypeScript 編譯錯誤 | 執行 `npx tsc --noEmit` 檢查 |
| 資料庫同步失敗 | Drift detected 警告 | 執行 `npx prisma migrate reset` |
| 連線池超時 | 遷移或查詢掛起 | 檢查 DIRECT_URL 設置 |
| API 認證失敗 | 401 Unauthorized | 檢查 `Authorization: Bearer` 頭 |

**詳細排障指南：** 見各技術規範文件（react-typescript、prisma-orm、api-routes）或開發日記章節

---

## 🔍 故障排除快速指南

| 問題 | 症狀 | 解決步驟 |
|------|------|---------|
| **Seed 無輸出** | `npx prisma db seed` 沒有任何資訊 | 檢查 package.json 中 `prisma.seed` 設定 |
| **型別檢查失敗** | TypeScript 編譯錯誤 | 執行 `npx tsc --noEmit` 檢查詳細錯誤 |
| **資料庫同步問題** | Drift detected 警告 | 執行 `npx prisma migrate reset` |
| **連線池超時** | 遷移或查詢掛起 | 檢查 DIRECT_URL 是否正確設置 |
| **API 認證失敗** | 401 Unauthorized | 檢查 Authorization 頭格式與密碼 |

---

##  開發日記 & 排障記錄

### 2026-04-06 | Seed 腳本無法執行問題

**問題描述：**
執行 `npx prisma db seed` 無輸出，資料庫中沒有初始化資料。

**根本原因：**
`package.json` 中缺少 `prisma.seed` 設定欄位，Prisma 無法定位 seed 文件。

**解決方案：**
在 `package.json` 中新增：
```json
"prisma": {
  "seed": "ts-node --transpile-only prisma/seed.ts"
}
```

**預防措施：**
- 初始化 Prisma 專案時應立即設定 seed 路徑
- 在 README 中明確說明 seed 執行步驟
- 首次開發環境設置時測試 seed 是否正常執行

**相關文件：**
- [package.json](package.json)
- [prisma/seed.ts](prisma/seed.ts)

---

### 2026-04-06 | Zod 驗證錯誤屬性問題

**問題描述：**
TypeScript 編譯失敗，錯誤訊息：`Property 'errors' does not exist on type 'ZodError'`

**根本原因：**
Zod v4版本中，`ZodError` 的正確屬性是 `.issues` 而非 `.errors`（v3 中是 `.errors`）。

**解決方案：**
全部替換為 `.issues`：
```typescript
// ❌ 錯誤（Zod v3 寫法）
details: validation.error.errors

// ✅ 正確（Zod v4+）
details: validation.error.issues
```

**受影響文件：**
- app/api/prompt/generate/route.ts
- app/api/evaluation/generate/route.ts
- app/api/evaluation/generate/list/route.ts
- app/api/admin/wisdoms/route.ts
- app/api/admin/tones/route.ts

**預防措施：**
- 安裝包時注意版本號
- 升級套件前檢查 breaking changes
- 執行 `npx tsc --noEmit` 驗證所有型別

---

### 2026-04-06 | TypeScript 型別轉換問題

**問題 1：null vs undefined**

描述：Prisma 可選欄位回傳 `null`，但函式期望 `undefined`

```typescript
// ❌ 錯誤
toneDescription: tone.description  // Type: string | null

// ✅ 正確
toneDescription: tone.description ?? undefined  // Type: string | undefined
```

**問題 2：短路求值型別**

描述：`condition && value` 回傳 `string | boolean`，不是純 `boolean`

```typescript
// ❌ 錯誤
return (
  prompt &&
  prompt.length > 50
)

// ✅ 正確
return !!(
  prompt &&
  prompt.length > 50
)
```

**相關文件：**
- [lib/prompts.ts](lib/prompts.ts)

**預防措施：**
- 在 IDE 中啟用 TypeScript Strict Mode
- 使用 `as const` 確定型別推斷
- 為複雜表達式新增顯式回傳型別註解

---

### 2026-04-06 | 資料庫 Schema 同步問題

**問題描述：**
`Drift detected: Your database schema is not in sync with your migration history`

**原因分析：**
- 直接在 Supabase 中修改 schema（繞過 Prisma）
- 或在多個環境中執行了不同的遷移

**解決方案：**
```bash
npx prisma migrate reset
```

此命令會：
1. 刪除所有表和資料（開發環境）
2. 重新執行所有遷移
3. 自動執行 seed 腳本

**預防措施：**
- 始終通過 Prisma 修改 schema（`npx prisma migrate dev`）
- 避免直接在資料庫管理介面修改
- 在團隊環境中約定 schema 修改流程
- 定期檢查遷移文件發生衝突

**相關文件：**
- [prisma/schema.prisma](prisma/schema.prisma)
- [prisma/migrations/](prisma/migrations/)

---

### 2026-04-06 | API 密碼認證設計

**決策：**
後台管理 API 使用簡單的 Bearer token 認證（ADMIN_PASSWORD）

**理由：**
- 初期專案，無複雜用戶系統
- 開發效率優先
- 便於本地測試

**實作方式：**
```typescript
function validateAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const password = process.env.ADMIN_PASSWORD;
  return !!authHeader && !!password && authHeader === `Bearer ${password}`;
}
```

**使用示例：**
```bash
curl -H "Authorization: Bearer your_password" \
  http://localhost:3000/api/admin/wisdoms
```

**後期升級計畫：**
- [ ] Phase 4：新增 Session-based 認證
- [ ] Phase 5：整合 OAuth 或 JWT 認證

**相關文件：**
- [app/api/admin/wisdoms/route.ts](app/api/admin/wisdoms/route.ts)
- [app/api/admin/tones/route.ts](app/api/admin/tones/route.ts)

---

### 2026-04-06 | Supabase 連線池設定

**關鍵設置：**

```env
# 應用連線（使用連線池，推薦）
DATABASE_URL="postgresql://user:pass@aws-...pooler.supabase.com:6543/postgres?pgbouncer=true"

# 遷移連線（直接連線，避免連線池問題）
DIRECT_URL="postgresql://user:pass@aws-...pooler.supabase.com:5432/postgres"
```

**Prisma schema 設定：**
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  # 關鍵！
}
```

**為什麼需要兩個 URL：**
- `DATABASE_URL`：應用執行時使用，連線池減少連線數
- `DIRECT_URL`：Prisma 遷移時使用，避免連線池限制導致鎖死

**預防措施：**
- Vercel 部署時檢查環境變數設置
- 遷移失敗時優先檢查 `DIRECT_URL` 是否正確
- 避免在連線池中執行長時間查詢

**相關文件：**
- [.env](.env)
- [prisma/schema.prisma](prisma/schema.prisma)

---

## 📋 已解決的問題歷史

### TypeScript 型別問題

| 日期 | 文件 | 問題 | 解決方案 |
|------|------|------|----------|
| 2026-04-06 | lib/prompts.ts | null vs undefined 型別不匹配 | 使用 `??` nullish coalescing 轉換 |
| 2026-04-06 | lib/prompts.ts | 短路求值回傳 boolean \| string | 使用 `!!` 強制轉換為 boolean |

### Zod 驗證錯誤處理

| 日期 | 文件 | 問題 | 解決方案 |
|------|------|------|----------|
| 2026-04-06 | 多個 API 路由 | ZodError 沒有 `.errors` 屬性 | 使用 `.issues` 替代（Zod v4+） |

### 常見 TypeScript 錯誤與解決方案

#### Q: TypeScript 發生錯誤 "Property 'errors' does not exist on type 'ZodError'"？
A: Zod v4版本中，正確的屬性是 `.issues` 而不是 `.errors`。修正所有驗證錯誤處理：
```typescript
// 錯誤 ❌
details: validation.error.errors

// 正確 ✅
details: validation.error.issues
```

#### Q: TypeScript 發生錯誤 "Type 'string | null' is not assignable to type 'string | undefined'"？
A: 這是 Prisma schema 中可選欄位（`String?`）回傳 `null` 而非 `undefined` 引起的。使用 nullish coalescing operator 轉換：
```typescript
// 錯誤 ❌
toneDescription: tone.description

// 正確 ✅
toneDescription: tone.description ?? undefined
```

#### Q: TypeScript 發生錯誤 "Type 'string | boolean' is not assignable to type 'boolean'"？
A: 短路求值 (`condition &&`) 回傳的不是純布林值。使用雙感嘆號強制轉換：
```typescript
// 錯誤 ❌
return (
  prompt &&
  prompt.length > 50
)

// 正確 ✅
return !!(
  prompt &&
  prompt.length > 50
)
```

---

## 📈 經驗教訓總結

✅ **做得好的事：**
- 及早引入 TypeScript ESLint
- 在開發早期建立完整的 API 層
- 使用 Zod 進行輸入驗證
- 詳細的環境變數設定

⚠️ **可改進的地方：**
- 應更早發現 package.json 缺少 seed 設定
- 型別檢查應在每次提交前執行
- 可新增 pre-commit hooks 自動檢查

🎯 **未來行動：**
- 新增 husky lint-staged 自動化檢查
- 編寫單元測試（Jest）
- 設置 GitHub Actions 自動化流水線
```