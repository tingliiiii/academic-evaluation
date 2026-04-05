---
description: "Use when: modifying database schema, writing migrations, designing Prisma models, or working with seed scripts"
applyTo: "**/schema.prisma, **/migrations/**/*.sql, **/seed.ts"
---

# Prisma ORM 編碼標準

**Last Updated:** 2026-04-06

---

## 📋 模型設計規範

### 模型命名

```
✅ 正確（單數、PascalCase）：
- Wisdom
- Evaluation
- Student
- Tone

❌ 錯誤（複數、lowercase）：
- wisdoms
- evaluations
- students
```

### 欄位命名

```prisma
// ✅ 正確：camelCase，包含時間戳和軟刪除

model Wisdom {
  id        String   @id @default(cuid())
  content   String   @unique
  priority  Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // 反向關聯
  evaluations EvaluationWisdom[]
}

// ❌ 錯誤：不完整的時間戳和缺少軟刪除

model BadWisdom {
  id      String @id @default(cuid())
  content String
  // 缺少 createdAt, updatedAt, isActive
}
```

---

## 🔑 資料庫關聯最佳實踐

### 一對多關聯

```prisma
// ✅ 正確：Student (一) 對 Evaluation (多)

model Student {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  
  evaluations Evaluation[]  // 反向關聯
}

model Evaluation {
  id        String @id @default(cuid())
  studentId String
  student   Student @relation(
    fields: [studentId],
    references: [id],
    onDelete: Cascade  // ✅ 級聯刪除：刪除學生時自動刪除評語
  )
  
  createdAt DateTime @default(now())
}
```

### 多對多關聯

```prisma
// ✅ 正確：Evaluation (多) 對 Wisdom (多) 通過 EvaluationWisdom

model Evaluation {
  id    String @id @default(cuid())
  // 其他欄位...
  
  wisdoms EvaluationWisdom[]  // 關聯
}

model Wisdom {
  id    String @id @default(cuid())
  // 其他欄位...
  
  evaluations EvaluationWisdom[]  // 關聯
}

model EvaluationWisdom {
  id           String @id @default(cuid())
  evaluationId String
  evaluation   Evaluation @relation(
    fields: [evaluationId],
    references: [id],
    onDelete: Cascade
  )
  wisdomId     String
  wisdom       Wisdom @relation(
    fields: [wisdomId],
    references: [id]  // Wisdom 不支持級聯刪除
  )
  
  // 防止重複組合
  @@unique([evaluationId, wisdomId])
}
```

---

## 📊 索引策略

### 何時新增索引

```prisma
// ✅ 常用查詢欄位需要索引

model Evaluation {
  id        String @id @default(cuid())
  studentId String
  toneId    String
  createdAt DateTime @default(now())
  
  // 頻繁查詢的欄位
  @@index([studentId])
  @@index([toneId])
  @@index([createdAt])  // 排序和篩選使用
}

model Wisdom {
  id       String @id @default(cuid())
  content  String @unique
  isActive Boolean @default(true)
  priority Int @default(0)
  
  // 軟刪除和排序需要索引
  @@index([isActive])
  @@index([priority])
}
```

### 複合索引

```prisma
// ✅ 用於「用戶 + 日期」這樣的複合查詢

model Evaluation {
  id        String   @id @default(cuid())
  studentId String
  createdAt DateTime @default(now())
  
  // 複合索引：快速查詢「某學生的評語」
  @@index([studentId, createdAt])
}
```

---

## 🚀 遷移規範

### 命名規則

```bash
# ✅ 正確：描述性名稱，使用過去式或動詞

npx prisma migrate dev --name "create_evaluation_table"
npx prisma migrate dev --name "add_wisdom_priority_index"
npx prisma migrate dev --name "add_cascade_delete_to_evaluation"
npx prisma migrate dev --name "rename_tone_description_field"

# ❌ 錯誤：無意義或模糊的名稱

npx prisma migrate dev --name "update"
npx prisma migrate dev --name "fix"
npx prisma migrate dev --name "init"  # 不清楚修改內容
```

### 遷移流程

```bash
# 1. 修改 schema.prisma
# （編輯模型，新增/刪除欄位等）

# 2. 建立遷移
npx prisma migrate dev --name "add_wisdom_category"

# 3. Prisma 會自動：
#    - 生成遷移文件 (prisma/migrations/<timestamp>_add_wisdom_category/)
#    - 執行遷移到開發資料庫
#    - 重新生成 Prisma Client

# 4. 檢查生成的 SQL
# 在 prisma/migrations/<timestamp>_add_wisdom_category/migration.sql 中審查

# 5. 提交到 Git
git add prisma/migrations/
git commit -m "feat: add wisdom category field"
```

---

## 🌱 Seed 腳本規範

### 種子資料結構

```typescript
// ✅ 正確：完整的 seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. 清理現有資料（開發環境）
  await prisma.evaluationWisdom.deleteMany({});
  await prisma.evaluation.deleteMany({});
  await prisma.wisdom.deleteMany({});
  await prisma.tone.deleteMany({});
  await prisma.student.deleteMany({});

  // 2. 建立箴言
  const wisdoms = await Promise.all([
    prisma.wisdom.create({
      data: {
        content: '勤奮好學',
        priority: 1,
        isActive: true,
      },
    }),
    prisma.wisdom.create({
      data: {
        content: '主動積極',
        priority: 2,
        isActive: true,
      },
    }),
    // ... 其他箴言
  ]);

  // 3. 建立語氣
  const tones = await Promise.all([
    prisma.tone.create({
      data: {
        name: '鼓勵正面',
        description: '使用肯定和鼓勵性語言',
        isActive: true,
      },
    }),
    // ... 其他語氣
  ]);

  // 4. 建立示例學生
  const students = await Promise.all([
    prisma.student.create({
      data: { name: '小明' },
    }),
    prisma.student.create({
      data: { name: '小紅' },
    }),
  ]);

  console.log('Seed 資料已成功建立！');
  console.log(`- ${wisdoms.length} 個箴言`);
  console.log(`- ${tones.length} 個語氣`);
  console.log(`- ${students.length} 個學生`);
}

main()
  .catch((e) => {
    console.error('Seed 失敗:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 執行 Seed

```bash
# 確保 package.json 中設定了 prisma.seed：
# "prisma": { "seed": "ts-node --transpile-only prisma/seed.ts" }

# 執行一次
npx prisma db seed

# 或者在遷移後自動執行
npx prisma migrate dev --name "add_column"  # 會自動執行 seed
```

---

## 🐛 常見問題

### Schema 不同步錯誤

**症狀：** `Drift detected: Your database schema is not in sync with your migration history`

**原因：**
- 直接在 Supabase Dashboard 中修改表（繞過 Prisma）
- 在多個環境手動執行了不同的遷移

**解決方案：**
```bash
# 重置開發資料庫（刪除所有資料）
npx prisma migrate reset

# 此命令會：
# 1. 刪除資料庫中的所有表
# 2. 重新執行所有遷移
# 3. 自動執行 seed 腳本
```

### 遷移衝突

**症狀：** `The migration with the name "xxx" already exists` 或合併衝突

**預防措施：**
```bash
# 使用時間戳防止衝突（Prisma 自動生成）
# ✅ 正確：migrations/<timestamp>_add_field/

# ❌ 錯誤：手動修改遷移名稱或時間戳
```

### Null vs Undefined 型別問題

**症狀：** TypeScript 發生錯誤 `Type 'null' is not assignable to type 'undefined'`

**根本原因：** Prisma `String?` 欄位回傳 `null`，但函式期望 `undefined`

**解決方案：**
```typescript
// ❌ 錯誤
const desc: string | undefined = wisdom.description;

// ✅ 正確
const desc: string | undefined = wisdom.description ?? undefined;
```

---

## 🔒 安全最佳實踐

### 資料刪除規範

```prisma
// ✅ 推薦：軟刪除（保留資料以方便恢復）

model Wisdom {
  id        String   @id @default(cuid())
  content   String
  isActive  Boolean  @default(true)  // 軟刪除標記
  createdAt DateTime @default(now())
  deletedAt DateTime?                // 刪除時間戳
}

// 查詢時排除已刪除
// prisma.wisdom.findMany({ where: { isActive: true } })
```

### 敏感欄位保護

```prisma
// ✅ 避免回傳敏感資訊

model Evaluation {
  id      String @id @default(cuid())
  // ...
  // prompt 欄位可能包含敏感的 AI prompt
  prompt  String? @db.Text
}

// 在 API 中選擇性回傳
// const { prompt, ...safeData } = evaluation;
// return { data: safeData };
```

---

## 📚 參考

- [Prisma 官方文件](https://www.prisma.io/docs)
- [Prisma Schema 最佳實踐](https://www.prisma.io/docs/guides/database/best-practices)
- [Prisma 遷移指南](https://www.prisma.io/docs/concepts/components/prisma-migrate)
