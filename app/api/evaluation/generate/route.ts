// app/api/evaluation/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateEvaluation } from "@/lib/gemini";
import prisma from "@/lib/prisma";
import { z } from "zod";

const requestSchema = z.object({
  prompt: z.string().min(50, "Prompt is too short"),
  studentName: z.string().min(1, "Student name is required"),
  wisdomIds: z.array(z.string()),
  toneId: z.string().min(1, "Tone is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 驗證請求
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { prompt, studentName, wisdomIds, toneId } = validation.data;

    // 1. 調用 Gemini API
    const content = await generateEvaluation(prompt);

    // 2. 保存到數據庫
    // 2.1 找或創建學生
    let student = await prisma.student.findFirst({
      where: { name: studentName },
    });

    if (!student) {
      student = await prisma.student.create({
        data: { name: studentName },
      });
    }

    // 2.2 創建評語記錄
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
    console.error("Error generating evaluation:", error);

    const message =
      error instanceof Error ? error.message : "Failed to generate evaluation";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}