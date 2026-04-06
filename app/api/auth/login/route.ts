import { NextResponse } from 'next/server';
import { loginSchema, validateBody, getValidationErrorsMessage } from '@/lib/schemas';
import {
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/errors';

export async function POST(request: Request) {
  try {
    // 1. 解析請求體
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        createErrorResponse('無效的 JSON 格式'),
        { status: 400 }
      );
    }

    // 2. 驗證請求數據
    const validation = validateBody(body, loginSchema);
    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse(
          getValidationErrorsMessage(validation.error)
        ),
        { status: 400 }
      );
    }

    const { password } = validation.data;
    const correctPassword = process.env.ADMIN_PASSWORD || '0000';

    // 3. 驗證密碼
    if (password === correctPassword) {
      return NextResponse.json(createSuccessResponse({}));
    }

    // 4. 密碼驗證失敗
    return NextResponse.json(
      createErrorResponse('密碼錯誤'),
      { status: 401 }
    );
  } catch (error) {
    console.error('[Login] Unexpected error:', error);

    return NextResponse.json(
      createErrorResponse(
        error instanceof Error ? error.message : '伺服器內部錯誤'
      ),
      { status: 500 }
    );
  }
}