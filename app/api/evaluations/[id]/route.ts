// app/api/evaluations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const evaluation = await prisma.evaluation.findUnique({
      where: { id },
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

    if (!evaluation) {
      return NextResponse.json(
        {
          success: false,
          error: "Evaluation not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: evaluation.id,
          studentName: evaluation.student.name,
          toneName: evaluation.tone.name,
          wisdoms: evaluation.wisdoms.map((w) => w.wisdom.content).join("、"),
          content: evaluation.content,
          prompt: evaluation.prompt,
          createdAt: evaluation.createdAt.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching evaluation:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch evaluation",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 驗證後台密碼
    const authHeader = request.headers.get("authorization");
    const password = process.env.ADMIN_PASSWORD;

    if (!authHeader || !password || authHeader !== `Bearer ${password}`) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await prisma.evaluation.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Evaluation deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting evaluation:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete evaluation",
      },
      { status: 500 }
    );
  }
}