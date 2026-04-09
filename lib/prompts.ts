// lib/prompts.ts
import prisma from "./prisma";

export interface PromptTemplateParams {
  studentName: string;
  wisdomIds: string[];
  toneId: string;
}

export interface PromptTemplateResult {
  prompt: string;
  metadata: {
    studentName: string;
    wisdoms: string[];
    toneName: string;
  };
}

/**
 * 從資料庫取得形容詞和語氣，生成 Prompt
 */
export async function generatePromptTemplate(
  params: PromptTemplateParams
): Promise<PromptTemplateResult> {
  const { studentName, wisdomIds, toneId } = params;

  // 驗證輸入
  if (!studentName || studentName.trim().length === 0) {
    throw new Error("Student name is required");
  }

  if (!wisdomIds || wisdomIds.length === 0) {
    throw new Error("At least one wisdom must be selected");
  }

  if (!toneId) {
    throw new Error("Tone is required");
  }

  // ✅ 使用 Promise.all 並行執行兩個獨立的查詢
  // 這避免了瀑布效應，提升性能
  const [wisdoms, tone] = await Promise.all([
    prisma.wisdom.findMany({
      where: {
        id: {
          in: wisdomIds,
        },
        isActive: true,
      },
    }),
    prisma.tone.findUnique({
      where: { id: toneId },
    }),
  ]);

  if (wisdoms.length === 0) {
    throw new Error("Selected wisdoms not found or are inactive");
  }

  if (!tone || !tone.isActive) {
    throw new Error("Selected tone not found or is inactive");
  }

  // 構建 Prompt
  const wisdomTexts = wisdoms.map((w) => w.content).join("、");

  const prompt = buildEvaluationPrompt({
    studentName,
    wisdoms: wisdomTexts,
    tone: tone.name,
    toneDescription: tone.description ?? undefined,
  });

  return {
    prompt,
    metadata: {
      studentName,
      wisdoms: wisdoms.map((w) => w.content),
      toneName: tone.name,
    },
  };
}

/**
 * 構建評語 Prompt 的模板
 */
function buildEvaluationPrompt(params: {
  studentName: string;
  wisdoms: string;
  tone: string;
  toneDescription?: string;
}): string {
  const { studentName, wisdoms, tone, toneDescription } = params;

  return `你是一位經驗豐富的教師，請根據以下要求為學生撰寫期末評語。

【學生姓名】${studentName}

【個人特質（評語重點）】${wisdoms}

【評語語氣和風格】${tone}
${toneDescription ? `具體要求：${toneDescription}` : ""}

【評語要求】
1. 評語長度：150-200 字
2. 稱呼方式：使用第二人稱「你」，避免使用第三人稱
3. 語調：${tone}
4. 避免：
  - 重複使用相同短語
  - 過度修飾
  - 有歧義的表述
5. 包含：
  - 對學生優點的具體認可
  - 針對形容詞的實例說明
  - 對未來的建議和期許

請生成評語（直接輸出評語文本，無需額外說明）：`;
}

/**
 * 驗證 Prompt 格式是否正確
 * ✅ 改進：不再依賴脆弱的字符串搜尋，而是驗證實際的內容變數
 * @param prompt - 生成的 Prompt
 * @param studentName - 學生姓名（應該已插入到 Prompt 中）
 * @param wisdomTexts - 形容詞文字（應該已插入到 Prompt 中）
 * @returns 是否有效
 */
export function validatePrompt(
  prompt: string,
  studentName?: string,
  wisdomTexts?: string
): boolean {
  // 基本檢查
  if (!prompt || prompt.length < 50) {
    return false;
  }

  // 如果提供了具體值，驗證這些值是否已成功插入
  if (studentName && !prompt.includes(studentName)) {
    return false;
  }
  if (wisdomTexts && !prompt.includes(wisdomTexts)) {
    return false;
  }

  // 確保 Prompt 包含基本的結構（模板標籤）
  // ✅ 修正：檢查實際存在於 buildEvaluationPrompt 中的文本
  return prompt.includes("【學生姓名】") && prompt.includes("【個人特質");
}