/**
 * 統一的驗證 schemas
 * 
 * 使用 Zod 定義所有 API 請求/響應的驗證規則
 * 保持前後端驗證一致
 */

import { z } from 'zod';

// ============================================================================
// 驗證規則常數
// ============================================================================

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 1,
  STUDENT_NAME_MIN: 2,
  STUDENT_NAME_MAX: 10,
  WISDOM_COUNT_MIN: 1,
  WISDOM_COUNT_MAX: 10,
  TONE_ID_MIN_LENGTH: 1,
  PROMPT_MIN_LENGTH: 50,
  PAGE_MIN: 1,
  PAGE_SIZE_MIN: 1,
  PAGE_SIZE_MAX: 100,
} as const;

// ============================================================================
// 共用 Schemas
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(VALIDATION_RULES.PAGE_MIN).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(VALIDATION_RULES.PAGE_SIZE_MIN)
    .max(VALIDATION_RULES.PAGE_SIZE_MAX)
    .default(10),
});

export const authHeaderSchema = z.object({
  authorization: z.string().refine(
    (val) => val.startsWith('Bearer '),
    '無效的認證令牌格式'
  ).optional(),
});

// ============================================================================
// Authentication Schemas
// ============================================================================

export const loginSchema = z.object({
  password: z
    .string()
    .min(
      VALIDATION_RULES.PASSWORD_MIN_LENGTH,
      '密碼為必填項'
    ),
});

export type LoginRequest = z.infer<typeof loginSchema>;

// ============================================================================
// Student & Tone Schemas
// ============================================================================

export const studentNameSchema = z
  .string()
  .min(
    VALIDATION_RULES.STUDENT_NAME_MIN,
    `學生姓名至少 ${VALIDATION_RULES.STUDENT_NAME_MIN} 個字`
  )
  .max(
    VALIDATION_RULES.STUDENT_NAME_MAX,
    `學生姓名最多 ${VALIDATION_RULES.STUDENT_NAME_MAX} 個字`
  );

export const toneIdSchema = z
  .string()
  .min(VALIDATION_RULES.TONE_ID_MIN_LENGTH, '請選擇語氣');

export const wisdomIdsSchema = z
  .array(z.string())
  .min(
    VALIDATION_RULES.WISDOM_COUNT_MIN,
    `至少需選擇 ${VALIDATION_RULES.WISDOM_COUNT_MIN} 個箴言`
  )
  .max(
    VALIDATION_RULES.WISDOM_COUNT_MAX,
    `最多可選擇 ${VALIDATION_RULES.WISDOM_COUNT_MAX} 個箴言`
  );

// ============================================================================
// Evaluation Generation Schemas
// ============================================================================

export const evaluationGenerationRequestSchema = z.object({
  studentName: studentNameSchema,
  toneId: toneIdSchema,
  wisdomIds: wisdomIdsSchema,
  prompt: z
    .string()
    .min(
      VALIDATION_RULES.PROMPT_MIN_LENGTH,
      `提示詞至少 ${VALIDATION_RULES.PROMPT_MIN_LENGTH} 個字`
    ),
});

export type EvaluationGenerationRequest = z.infer<
  typeof evaluationGenerationRequestSchema
>;

// API 預期的請求（添加 prompt）
export const evaluationRequestSchema = evaluationGenerationRequestSchema.pick({
  studentName: true,
  toneId: true,
  wisdomIds: true,
}).extend({
  prompt: z.string().min(VALIDATION_RULES.PROMPT_MIN_LENGTH),
});

export type EvaluationRequest = z.infer<typeof evaluationRequestSchema>;

// ============================================================================
// Prompt Generation Schemas
// ============================================================================

export const promptGenerationRequestSchema = z.object({
  studentName: studentNameSchema,
  toneId: toneIdSchema,
  wisdomIds: wisdomIdsSchema,
});

export type PromptGenerationRequest = z.infer<
  typeof promptGenerationRequestSchema
>;

export const promptGenerationResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    prompt: z.string(),
    metadata: z.object({
      studentName: z.string(),
      tone: z.string(),
      wisdoms: z.array(z.string()),
    }),
  }).optional(),
  error: z.string().optional(),
});

export type PromptGenerationResponse = z.infer<
  typeof promptGenerationResponseSchema
>;

// ============================================================================
// Evaluation List Schemas
// ============================================================================

export const evaluationListQuerySchema = paginationSchema.extend({
  studentName: z.string().optional(),
});

export type EvaluationListQuery = z.infer<typeof evaluationListQuerySchema>;

export const evaluationListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    items: z.array(
      z.object({
        id: z.string(),
        studentName: z.string(),
        toneName: z.string(),
        wisdoms: z.array(z.string()),
        createdAt: z.string(),
      })
    ),
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  }),
  error: z.string().optional(),
});

export type EvaluationListResponse = z.infer<typeof evaluationListResponseSchema>;

// ============================================================================
// Tone & Wisdom Schemas
// ============================================================================

export const toneCreateSchema = z.object({
  name: z
    .string()
    .min(1, '語氣名稱為必填項')
    .max(50, '語氣名稱最多 50 個字'),
  description: z
    .string()
    .max(200, '語氣描述最多 200 個字')
    .optional(),
});

export type ToneCreate = z.infer<typeof toneCreateSchema>;

export const wisdomCreateSchema = z.object({
  content: z
    .string()
    .min(10, '箴言內容至少 10 個字')
    .max(500, '箴言內容最多 500 個字'),
  priority: z.number().int().min(0).max(100).optional(),
});

export type WisdomCreate = z.infer<typeof wisdomCreateSchema>;

export const toneListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
    })
  ).optional(),
  error: z.string().optional(),
});

export type ToneListResponse = z.infer<typeof toneListResponseSchema>;

export const wisdomListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(
    z.object({
      id: z.string(),
      content: z.string(),
      priority: z.number().optional(),
    })
  ).optional(),
  error: z.string().optional(),
});

export type WisdomListResponse = z.infer<typeof wisdomListResponseSchema>;

// ============================================================================
// 動態驗證幫助函數
// ============================================================================

/**
 * 驗證請求體
 * @param body 請求體
 * @param schema 驗證 schema
 * @returns 驗證結果
 */
export function validateBody<T>(body: unknown, schema: z.ZodSchema<T>) {
  return schema.safeParse(body);
}

/**
 * 驗證查詢參數
 * @param params 查詢參數
 * @param schema 驗證 schema
 * @returns 驗證結果
 */
export function validateQuery<T>(params: Record<string, unknown>, schema: z.ZodSchema<T>) {
  return schema.safeParse(params);
}

/**
 * 獲取驗證錯誤消息
 * @param error Zod 驗證錯誤
 * @returns 格式化的錯誤消息
 */
export function getValidationErrorsMessage(
  error: z.ZodError<unknown>
): string {
  const firstIssue = error.issues[0];
  if (!firstIssue) return '驗證失敗';
  
  const path = firstIssue.path.join('.');
  const message = firstIssue.message;
  
  return `${path}: ${message}`;
}
