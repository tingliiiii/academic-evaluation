---
description: "Use when: writing API route handlers, designing endpoints, implementing request validation, or setting up authentication"
applyTo: "**/app/api/**/route.ts"
---

# API Routes 編碼標準

**Last Updated:** 2026-04-06

---

## 📋 API 端點命名規範

### 路由結構

```
✅ 正確（RESTful）：
- /api/prompt/generate          POST  生成 prompt
- /api/evaluation/generate      POST  生成評語
- /api/evaluations/list         GET   查詢歷史
- /api/evaluations/[id]         GET   單個詳情
- /api/evaluations/[id]         DELETE 刪除
- /api/admin/wisdoms            GET   列表 (認證)
- /api/admin/wisdoms            POST  建立 (認證)
- /api/admin/wisdoms/[id]       PATCH 更新 (認證)
- /api/admin/tones/[id]         DELETE 刪除 (認證)

❌ 避免：
- /api/get-evaluations          (名稱中包含 HTTP 方法)
- /api/evaluation_list          (underscore 而非駝峰)
- /api/create-eval              (過於簡短)
```

---

## 🔐 請求驗證（Zod v4+）

### 基本驗證

```typescript
// ✅ 正確：完整的 Zod schema + 錯誤處理

import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const evaluationRequestSchema = z.object({
  studentName: z.string()
    .min(1, '學生姓名必填')
    .max(50, '姓名不能超過 50 字'),
  wisdomIds: z.array(z.string())
    .min(1, '至少選擇一個箴言')
    .max(5, '最多選擇 5 個箴言'),
  toneId: z.string()
    .min(1, '必須選擇一個語氣'),
});

type EvaluationRequest = z.infer<typeof evaluationRequestSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // ✅ 使用 safeParse 獲得驗證結果
    const validation = evaluationRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          // ✅ Zod v4+ 使用 .issues 而非 .errors
          details: validation.error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const validatedData = validation.data;
    // 業務邏輯...
    
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 常見 Zod Schema

```typescript
// 字符串
z.string()
  .min(1, '必填')          // 最小長度
  .max(100, '過長')        // 最大長度
  .email('無效郵箱')       // 郵箱格式
  .regex(/^[a-z]+$/, '...') // 正則

// 數字
z.number()
  .min(0, '不能為負')
  .max(100, '過大')
  .int('必須是整數')

// 陣列
z.array(z.string())
  .min(1, '至少一個')
  .max(10, '最多十個')

// 可選欄位
z.string().optional()           // 可選，預設 undefined
z.string().nullable()           // 可以是 null
z.string().default('value')     // 預設值

// 聯合型別
z.union([z.string(), z.number()])
```

---

## 📤 標準響應格式

### 成功響應

```typescript
// ✅ 統一的成功響應格式

// POST 建立資源 (201)
return NextResponse.json(
  {
    success: true,
    data: {
      id: evaluationId,
      studentName: '小明',
      content: 'AI 生成的評語',
      createdAt: new Date().toISOString(),
    },
  },
  { status: 201 }  // ✅ 使用正確的 HTTP 狀態碼
);

// GET 查詢資源 (200)
return NextResponse.json(
  {
    success: true,
    data: {
      items: evaluations,
      pagination: {
        total: 150,
        page: 1,
        pageSize: 10,
      },
    },
  },
  { status: 200 }
);
```

### 錯誤響應

```typescript
// ✅ 統一的錯誤響應格式

// 驗證錯誤 (400)
return NextResponse.json(
  {
    success: false,
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: [
      {
        path: 'studentName',
        message: '必填',
      },
    ],
  },
  { status: 400 }
);

// 認證錯誤 (401)
return NextResponse.json(
  {
    success: false,
    error: 'Unauthorized',
    code: 'AUTH_ERROR',
  },
  { status: 401 }
);

// 資源不存在 (404)
return NextResponse.json(
  {
    success: false,
    error: 'Evaluation not found',
    code: 'NOT_FOUND',
  },
  { status: 404 }
);

// 伺服器錯誤 (500)
return NextResponse.json(
  {
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  },
  { status: 500 }
);
```

---

## 🔐 Bearer Token 認證

### 驗證實作

```typescript
// ✅ 正確：完整的認證流程

import { NextRequest, NextResponse } from 'next/server';

function validateAdminAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const password = process.env.ADMIN_PASSWORD;
  
  // 必須同時檢查 header 存在、password 存在、格式正確
  if (!authHeader || !password) {
    return false;
  }
  
  // 格式：「Authorization: Bearer <password>」
  const expectedAuth = `Bearer ${password}`;
  return authHeader === expectedAuth;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 驗證認證
  if (!validateAdminAuth(request)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
        code: 'AUTH_ERROR',
      },
      { status: 401 }
    );
  }

  // 認證通過，執行業務邏輯
  const body = await request.json();
  // ...
}
```

### 測試認證

```bash
# ✅ 正確的請求格式
curl -X PATCH http://localhost:3000/api/admin/wisdoms/123 \
  -H "Authorization: Bearer your_password" \
  -H "Content-Type: application/json" \
  -d '{"content":"新的箴言"}'

# ❌ 錯誤的格式
curl -X PATCH http://localhost:3000/api/admin/wisdoms/123 \
  -H "Authorization: your_password"  # 缺少 Bearer

curl -X PATCH http://localhost:3000/api/admin/wisdoms/123 \
  -H "Authorization: token your_password"  # 使用 token 而非 Bearer
```

---

## 🔌 Gemini API 整合

### 呼叫方式

```typescript
// ✅ 使用 lib/gemini.ts 中的封裝

import { generateEvaluation } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const prompt = '...'; // 從 lib/prompts.ts 生成
    
    // 方式 1：同步獲得完整評語（簡單）
    const evaluation = await generateEvaluation(prompt);
    
    return NextResponse.json({
      success: true,
      data: {
        content: evaluation,
      },
    });
    
  } catch (error) {
    return handleApiError(error);
  }
}

// ❌ 避免直接呼叫 Google API
// 應該總是通過 lib/gemini.ts 封裝，便於：
// - 統一的錯誤處理
// - 日誌記錄
// - 速率限制
// - 模型管理
```

---

## 📝 完整示例：CRUD 端點

### GET 列表（帶分頁）

```typescript
// app/api/evaluations/list/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  studentName: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryData = listQuerySchema.parse({
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
      studentName: searchParams.get('studentName'),
    });

    const skip = (queryData.page - 1) * queryData.pageSize;

    // 構建查詢條件
    const where = queryData.studentName
      ? { student: { name: { contains: queryData.studentName, mode: 'insensitive' } } }
      : {};

    const [items, total] = await Promise.all([
      prisma.evaluation.findMany({
        where,
        skip,
        take: queryData.pageSize,
        include: { student: true, tone: true, wisdoms: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.evaluation.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          page: queryData.page,
          pageSize: queryData.pageSize,
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### POST 建立（帶驗證和認證）

```typescript
// app/api/admin/wisdoms/route.ts

const createWisdomSchema = z.object({
  content: z.string().min(1).max(100),
  priority: z.number().int().default(0),
});

export async function POST(request: NextRequest) {
  if (!validateAdminAuth(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const validation = createWisdomSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const wisdom = await prisma.wisdom.create({
      data: validation.data,
    });

    return NextResponse.json(
      { success: true, data: wisdom },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
```

### DELETE 刪除（軟刪除）

```typescript
// app/api/evaluations/[id]/route.ts

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!validateAdminAuth(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: params.id },
    });

    if (!evaluation) {
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    }

    // 選項 1：硬刪除
    await prisma.evaluation.delete({ where: { id: params.id } });

    // 選項 2：軟刪除（推薦）
    // await prisma.evaluation.update({
    //   where: { id: params.id },
    //   data: { isActive: false, deletedAt: new Date() }
    // });

    return NextResponse.json({
      success: true,
      message: 'Deleted successfully',
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## 🛡️ 錯誤處理

### 統一的錯誤處理函式

```typescript
// lib/api-error.ts

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation error',
        issues: error.issues,
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: 'Unknown error',
    },
    { status: 500 }
  );
}
```

---

## ❌ 常見錯誤

| 錯誤 | 症狀 | 解決方案 |
|------|------|---------|
| **缺少 status 碼** | 所有响應都是 200 | 使用正確的 201 (create), 400 (validation), 401 (auth), 404 (not found) |
| **使用 `.errors`** | Zod 發生錯誤 | 升級到 Zod v4+，使用 `.issues` |
| **忘記驗證** | 無效資料進入資料庫 | 所有輸入都用 Zod schema 驗證 |
| **認證 header 格式錯誤** | 總是 401 | 檢查「Bearer」前綴和完整密碼 |
| **缺少 try-catch** | 未捕獲的異常crash | 所有 async 操作都用 try-catch |

---

## 📚 參考

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Zod 驗證庫](https://zod.dev)
- [HTTP 狀態碼](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
