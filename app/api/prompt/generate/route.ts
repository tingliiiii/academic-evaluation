// app/api/prompt/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generatePromptTemplate, validatePrompt } from "@/lib/prompts";
import { z } from "zod";

// 驗證請求 schema
const requestSchema = z.object({
  studentName: z.string().min(1, "Student name is required"),
  wisdomIds: z.array(z.string().min(1)).min(1, "At least one wisdom must be selected"),
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

    const { studentName, wisdomIds, toneId } = validation.data;

    // 生成 Prompt
    const result = await generatePromptTemplate({
      studentName,
      wisdomIds,
      toneId,
    });

    // 驗證 Prompt
    if (!validatePrompt(result.prompt)) {
      throw new Error("Generated prompt validation failed");
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating prompt:", error);

    const message =
      error instanceof Error ? error.message : "Failed to generate prompt";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}