# 期末評語生成系統 📚

> **生成期末評語小幫手** — 使用 Gemini AI 快速生成學生期末評語

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)

---

## 📌 功能概述

### 核心特性

✨ **快速生成評語**
- 教師輸入學生姓名、選擇形容詞、選擇語氣預設
- 系統自動生成高品質的 Gemini API prompt
- 確認後呼叫 Gemini API 生成最終評語

📊 **評語歷史管理**
- 所有已生成評語自動儲存至資料庫
- 支持按學生名稱搜索和分頁查詢
- 可查看完整評語記錄和生成的 prompt

🎛️ **後台管理系統**
- 動態管理形容詞列表（增刪改查）
- 動態管理語氣預設列表
- 支持啟用/禁用形容詞和語氣

---

## 🏗️ 技術堆疊

- **React 19** + **Next.js 16 (App Router)**
- **shadcn/ui** + **Tailwind CSS**
- **Prisma 6** + **PostgreSQL (Supabase)**
- **Google Gemini API**
- **TypeScript 5** + **ESLint 9**

---

## 🚀 快速開始

### 安裝

```bash
# 1. 克隆專案
git clone https://github.com/liutingli/academic-evaluation.git
cd academic-evaluation

# 2. 安裝套件
npm install

# 3. 設定環境變數
cp .env .env.local
# 編輯 .env.local，填入 Gemini API Key 和 Supabase 連線字符串

# 4. 初始化資料庫
npx prisma migrate dev --name init
npx prisma db seed

# 5. 啟動開發伺服器
npm run dev
```

訪問 http://localhost:3000 🎉

### 環境變數設置

```env
# Supabase PostgreSQL
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Gemini API
GEMINI_API_KEY="your_api_key"
NEXT_PUBLIC_GEMINI_MODEL="gemini-2.5-flash"

# 後台管理
ADMIN_PASSWORD="secure_password"
```

---

## 📖 使用指南

### 生成評語流程

1. 訪問首頁 → 填寫學生資訊
2. 選擇形容詞 + 評語語氣
3. 預覽自動生成的 prompt
4. 確認後呼叫 Gemini API
5. 評語自動儲存到資料庫

### 後台管理 (密碼保護)

訪問 http://localhost:3000/admin
- 管理形容詞
- 管理語氣預設

---

## 🛠️ 常用命令

```bash
npm run dev      # 開發伺服器
npm run build    # 構建
npm run lint     # 程式碼檢查

# 資料庫
npx prisma migrate dev    # 建立遷移
npx prisma db seed       # 填充初始資料
npx prisma migrate reset # 重置資料庫
npx prisma studio       # 打開資料庫管理介面

# 測試
npm run test             # 運行所有測試
npm run test:watch      # 監視模式
npm run test:coverage   # 生成覆蓋率報告
```

---

## 🧪 測試和文檔

### 📖 完整文檔

查看 **[TEST_AND_API_GUIDE.md](/docs/TEST_AND_API_GUIDE.md)** 獲得詳細說明：
- 📊 如何查看 OpenAPI 文檔和 Swagger UI
- 🧪 如何運行各種測試
- 📋 完整的 API 参考
- 🔧 故障排除指南

### 快速開始測試

```bash
# 運行所有測試
npm run test

# 運行特定類型的測試
npm run test:api           # API 測試 (24 個測試)
npm run test:components    # 組件測試 (250+ 個測試)
npm run test:integration   # 集成測試 (60+ 個測試)

# 生成覆蓋率報告
npm run test:coverage
```

### 查看 API 文檔 (Swagger UI)

1. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

2. **訪問 Swagger UI**
   - 打開 http://localhost:3000/swagger.html
   - 查看所有 API 端點的交互式文檔
   - 直接在界面上測試 API

3. **查看 OpenAPI 規範**
   - JSON 格式：http://localhost:3000/api/docs
   - 源代碼：[lib/openapi.ts](lib/openapi.ts)

### 測試覆蓋

| 類別 | 檔案數 | 測試項 | 覆蓋範圍 |
|-----|------|------|--------|
| **API** | 1 | 24 | 7 個端點、驗證、錯誤處理 |
| **組件** | 5 | 250+ | UI 邏輯、驗證、事件、狀態 |
| **集成** | 1 | 60+ | 完整工作流程、多步驟操作 |
| **總計** | **7** | **334+** | **全棧覆蓋** |

---

## 📚 API 文件

### 1️⃣ 生成 Prompt 預覽

```bash
POST /api/prompts/preview

{
  "studentName": "小明",
  "wisdomIds": ["id1", "id2"],
  "toneId": "id"
}

Response:
{
  "success": true,
  "data": {
    "prompt": "完整的評語提示詞...",
    "metadata": {...}
  }
}
```

### 2️⃣ 生成評語

```bash
POST /api/evaluations

{
  "prompt": "...",
  "studentName": "小明",
  "wisdomIds": ["id1"],
  "toneId": "id"
}

Response: {評語記錄}
```

### 3️⃣ 查詢歷史

```bash
GET /api/evaluations?page=1&pageSize=10&studentName=小明
```

### 4️⃣ 取得單筆評語

```bash
GET /api/evaluations/[id]
```

### 5️⃣ 刪除評語

```bash
DELETE /api/evaluations/[id]

Authorization: Bearer {ADMIN_PASSWORD}
```

### 管理 API (需認證)

```bash
GET/POST/PATCH/DELETE /api/admin/wisdoms
GET/POST/PATCH/DELETE /api/admin/tones
```

認證頭：`Authorization: Bearer your_admin_password`

---

## 📁 專案結構

```
app/
├── api/                    # API 路由 (RESTful)
│   ├── prompts/
│   │   └── preview/        # POST: 生成 prompt 預覽
│   ├── evaluations/        
│   │   ├── route.ts        # GET: 列表 / POST: 新增
│   │   └── [id]/route.ts   # GET: 詳情 / DELETE: 刪除
│   ├── admin/              # 後台管理
│   │   ├── wisdoms/
│   │   └── tones/
│   └── auth/               # 認證
├── admin/                  # 管理後台頁面
├── history/                # 歷史記錄頁面
└── page.tsx                # 首頁

components/                # React 元件
lib/                       # 工具函式和 API 封裝
prisma/                    # 資料庫設定
```

---

## 📊 開發進度

| 階段 | 狀態 | 內容 |
|------|------|------|
| 一 | ✅ | 專案初始化 |
| 二 | ✅ | 資料層 & API 層 |
| 三 | ✅ | 前端 UI 元件 |
| 四 | ✅ | 類型定義 & API 文檔 |
| 五 | ✅ | 測試框架 & 覆蓋 |
| 六 | ⏳ | 測試 & 部署準備 |
| 七 | ⏳ | Vercel 部署 |

---

## 📝 開發指南

詳見 [.github/copilot-instrution.md](.github/copilot-instrution.md)

---

## 🚢 部署到 Vercel

1. 推送到 GitHub
2. 在 Vercel 導入倉庫
3. 設置環境變數
4. 自動部署完成

---

## 💡 常見問題

**Q: 評語生成失敗？**
- 檢查 GEMINI_API_KEY 是否正確
- 查看終端日誌

**Q: 資料庫連線失敗？**
- 確認 DATABASE_URL 和 DIRECT_URL 正確
- 檢查網絡連線

**Q: 後台密碼忘記？**
- 修改 .env 中的 ADMIN_PASSWORD

---

## 📧 聯繫方式

- Email — lily90740@gmail.com

---

**最後更新：** 2026-04-06  
**狀態：** Phase 4-5 Complete ✅ | 334+ 個測試用例
