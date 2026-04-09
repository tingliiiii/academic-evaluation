/**
 * POST /api/prompts/preview
 * 生成評語提示詞預覽（不保存到資料庫）
 * 
 * 請求：
 *   - studentName: 學生姓名
 *   - wisdomIds: 形容詞 ID 陣列
 *   - toneId: 語氣 ID
 * 
 * 響應：
 *   {
 *     success: true,
 *     data: {
 *       prompt: "生成的提示詞文本...",
 *       metadata: {
 *         wisdoms: ["形容詞1", "形容詞2"],
 *         selectedWisdomCount: 2
 *       }
 *     }
 *   }
 */

import { NextRequest, NextResponse } from "next/server";
import { generatePromptTemplate, validatePrompt } from "@/lib/prompts";
import { z } from "zod";

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

    // 驗證 Prompt - 傳遞所有必要的參數進行完整驗證
    const wisdomTexts = result.metadata.wisdoms.join("、");
    if (!validatePrompt(result.prompt, studentName, wisdomTexts)) {
      console.error("Validation failed:", {
        promptLength: result.prompt.length,
        studentNameIncluded: result.prompt.includes(studentName),
        wisdomsIncluded: result.prompt.includes(wisdomTexts),
        hasStructure: result.prompt.includes("【學生姓名】") && result.prompt.includes("【個人特質】"),
      });
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
    console.error("Error generating prompt preview:", error);

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
