/**
 * app/api/evaluations/route.ts
 * 
 * 評語管理 API 端點
 * 
 * 支援：
 * - POST: 生成新的評語（需要提示詞）
 * - GET: 取得評語列表（支援分頁和搜尋）
 * 
 * @requires 認證：Bearer token (ADMIN_PASSWORD)
 * @requires 請求頭：Content-Type: application/json
 */

import { NextRequest, NextResponse } from "next/server";
import { generateEvaluation } from "@/lib/gemini";
import prisma from "@/lib/prisma";
import type { Prisma } from '@prisma/client';
import {
  evaluationRequestSchema,
  evaluationListQuerySchema,
  validateBody,
  validateQuery,
  getValidationErrorsMessage,
} from "@/lib/schemas";
import {
  createErrorResponse,
} from "@/lib/errors";

// ============================================================================
// POST: 新增評語 
// ============================================================================

/**
 * 生成評語 (POST /api/evaluations)
 * 
 * @async
 * @param {NextRequest} request - HTTP 請求
 * @param {Object} request.body - 請求體
 * @param {string} request.body.studentName - 學生姓名 (2-10字)
 * @param {string} request.body.toneId - 語氣ID
 * @param {string[]} request.body.wisdomIds - 形容詞ID列表 (至少1個)
 * @param {string} request.body.prompt - Gemini API 提示詞 (至少50字)
 * 
 * @returns {Promise<NextResponse>}
 * @returns {201} 評語生成成功，返回評語ID和內容
 * @returns {400} 驗證失敗或業務規則違反
 * @returns {401} 未授權
 * @returns {500} 伺服器錯誤（Gemini API 或資料庫錯誤）
 * 
 * @example
 * POST /api/evaluations
 * Content-Type: application/json
 * Authorization: Bearer <token>
 * 
 * {
 *   "studentName": "張三",
 *   "toneId": "tone_001",
 *   "wisdomIds": ["wisdom_001", "wisdom_002"],
 *   "prompt": "..."
 * }
 * 
 * Response (201):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "eval_123",
 *     "studentName": "張三",
 *     "content": "...",
 *     "createdAt": "2026-04-06T10:00:00Z"
 *   }
 * }
 */
async function handlePost(request: NextRequest) {
  try {
    // 1. 解析和驗證請求體
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        createErrorResponse('無效的 JSON 格式'),
        { status: 400 }
      );
    }

    const validation = validateBody(body, evaluationRequestSchema);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse(
          getValidationErrorsMessage(validation.error)
        ),
        { status: 400 }
      );
    }

    const { prompt, studentName, wisdomIds, toneId } = validation.data;

    // 2. 驗證 tone 存在
    const tone = await prisma.tone.findUnique({ where: { id: toneId } });
    if (!tone) {
      return NextResponse.json(
        createErrorResponse('指定的語氣不存在'),
        { status: 400 }
      );
    }

    // 3. 驗證 wisdoms 存在
    const wisdoms = await prisma.wisdom.findMany({
      where: { id: { in: wisdomIds } },
    });
    if (wisdoms.length !== wisdomIds.length) {
      return NextResponse.json(
        createErrorResponse('部分形容詞不存在'),
        { status: 400 }
      );
    }

    // 4. 調用 Gemini API
    let content: string;
    try {
      content = await generateEvaluation(prompt);
    } catch (error) {
      console.error('[Evaluations POST] Gemini API error:', error);
      return NextResponse.json(
        createErrorResponse(
          error instanceof Error
            ? error.message
            : '生成評語失敗，請稍後重試'
        ),
        { status: 500 }
      );
    }

    // 5. 儲存到資料庫
    let student = await prisma.student.findFirst({
      where: { name: studentName },
    });

    if (!student) {
      student = await prisma.student.create({
        data: { name: studentName },
      });
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        studentId: student.id,
        toneId,
        content,
        prompt,
        wisdoms: {
          createMany: {
            data: wisdomIds.map((wisdomId) => ({
              wisdomId,
            })),
          },
        },
      },
      include: {
        student: true,
        tone: true,
        wisdoms: {
          include: {
            wisdom: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: evaluation.id,
          studentName: evaluation.student.name,
          content: evaluation.content,
          createdAt: evaluation.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Evaluations POST] Unexpected error:", error);

    return NextResponse.json(
      createErrorResponse(
        error instanceof Error ? error.message : '伺服器內部錯誤',
        500
      ),
      { status: 500 }
    );
  }
}

// ============================================================================
// GET: 取得評語列表
// ============================================================================

/**
 * 取得評語列表 (GET /api/evaluations)
 * 
 * 支援分頁、搜尋和排序
 * 
 * @async
 * @param {NextRequest} request - HTTP 請求
 * @param {Object} request.query - 查詢參數
 * @param {number} [request.query.page=1] - 頁碼（最小1）
 * @param {number} [request.query.pageSize=10] - 每頁數量（1-100）
 * @param {string} [request.query.studentName] - 學生名稱搜尋（模糊搜尋）
 * 
 * @returns {Promise<NextResponse>}
 * @returns {200} 成功取得列表，返回分頁資料
 * @returns {400} 查詢參數驗證失敗
 * @returns {401} 未授權
 * @returns {500} 伺服器錯誤
 * 
 * @example
 * GET /api/evaluations?page=1&pageSize=10&studentName=張
 * Authorization: Bearer <token>
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "items": [
 *       {
 *         "id": "eval_123",
 *         "studentName": "張三",
 *         "toneName": "溫和",
 *         "wisdoms": ["形容詞1", "形容詞2"],
 *         "createdAt": "2026-04-06T10:00:00Z"
 *       }
 *     ],
 *     "pagination": {
 *       "page": 1,
 *       "pageSize": 10,
 *       "total": 100,
 *       "totalPages": 10
 *     }
 *   }
 * }
 */
async function handleGet(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams);

    // 驗證查詢參數
    const validation = validateQuery(queryData, evaluationListQuerySchema);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse(
          getValidationErrorsMessage(validation.error)
        ),
        { status: 400 }
      );
    }

    const { page, pageSize, studentName } = validation.data;
    const skip = (page - 1) * pageSize;

    // 構建查詢條件
    const where: Prisma.EvaluationWhereInput = {};
    if (studentName) {
      where.student = {
        name: {
          contains: studentName,
          mode: "insensitive",
        },
      };
    }

    // 取得總數和數據
    const [total, evaluations] = await Promise.all([
      prisma.evaluation.count({ where }),
      prisma.evaluation.findMany({
        where,
        include: {
          student: true,
          tone: true,
          wisdoms: {
            include: {
              wisdom: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          items: evaluations.map((e) => ({
            id: e.id,
            studentName: e.student.name,
            toneName: e.tone.name,
            wisdoms: e.wisdoms.map((w) => w.wisdom.content),
            content: e.content,
            createdAt: e.createdAt.toISOString(),
          })),
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
          },
        },
      }
    );
  } catch (error) {
    console.error("[Evaluations GET] Unexpected error:", error);

    return NextResponse.json(
      createErrorResponse(
        error instanceof Error ? error.message : '伺服器內部錯誤',
        500
      ),
      { status: 500 }
    );
  }
}

// ============================================================================
// 路由 Handler
// ============================================================================

export async function POST(request: NextRequest) {
  return handlePost(request);
}

export async function GET(request: NextRequest) {
  return handleGet(request);
}