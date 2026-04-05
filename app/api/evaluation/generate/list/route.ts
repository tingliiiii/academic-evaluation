// app/api/evaluations/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  studentName: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = Object.fromEntries(searchParams);

    // 驗證查詢參數
    const validation = querySchema.safeParse(queryData);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { page, pageSize, studentName } = validation.data;
    const skip = (page - 1) * pageSize;

    // 構建查詢條件
    const where: any = {};
    if (studentName) {
      where.student = {
        name: {
          contains: studentName,
          mode: "insensitive",
        },
      };
    }

    // 獲取總數
    const total = await prisma.evaluation.count({ where });

    // 獲取分頁的評語列表
    const evaluations = await prisma.evaluation.findMany({
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
    });

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
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching evaluations:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch evaluations",
      },
      { status: 500 }
    );
  }
}