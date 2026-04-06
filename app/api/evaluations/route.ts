// app/api/evaluations/route.ts
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
        createErrorResponse('部分箴言不存在'),
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