/**
 * 統一的錯誤處理工具庫
 * 
 * 包含：
 * - 錯誤類別定義
 * - 錯誤消息翻譯
 * - 錯誤重試邏輯
 * - API 錯誤響應格式化
 */

export class ValidationError extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly responseData?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = '認證失敗，請重新登入') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`找不到${resource}`);
    this.name = 'NotFoundError';
  }
}

/**
 * 錯誤消息翻譯映射
 */
export const ERROR_MESSAGES: Record<string, string> = {
  'Invalid request': '無效的請求格式',
  'Password is required': '密碼為必填項',
  'Invalid password': '密碼錯誤',
  'Student name is required': '學生姓名為必填項',
  'Tone is required': '請選擇語氣',
  'Prompt is too short': '提示詞過短，請添加更多內容',
  'Network request failed': '網路連接失敗，請檢查網路設置',
  'Request timeout': '請求超時，請稍後重試',
  'Internal server error': '伺服器錯誤，請稍後重試',
  'Failed to generate evaluation': '生成評語失敗',
  'Failed to fetch evaluations': '無法載入評語列表',
  'Failed to fetch tones': '無法載入語氣列表',
  'Failed to fetch wisdoms': '無法載入形容詞列表',
};

/**
 * 將原始錯誤消息翻譯為中文
 * @param message 原始錯誤消息
 * @returns 翻譯後的錯誤消息
 */
export function translateError(message: string): string {
  return ERROR_MESSAGES[message] || message;
}

/**
 * 提取 API 響應中的錯誤消息
 * @param error 任意類型的錯誤
 * @returns 格式化的錯誤消息
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof ValidationError) {
    return translateError(error.message);
  }

  if (error instanceof APIError) {
    return translateError(error.message);
  }

  if (error instanceof AuthenticationError) {
    return error.message;
  }

  if (error instanceof NetworkError) {
    return '網路連接失敗，請檢查網路設置';
  }

  if (error instanceof TimeoutError) {
    return '請求超時，請稍後重試';
  }

  if (error instanceof Error) {
    return translateError(error.message);
  }

  return '發生未知錯誤';
}

/**
 * 網路請求重試邏輯
 * @param fn 要執行的函數
 * @param options 重試選項
 * @returns 執行結果
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    backoffMultiplier?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const initialDelayMs = options.delayMs ?? 1000;
  const backoffMultiplier = options.backoffMultiplier ?? 2;

  let lastError: Error | null = null;
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        options.onRetry?.(attempt, lastError);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= backoffMultiplier;
      }
    }
  }

  throw lastError || new Error('重試失敗');
}

/**
 * 帶超時的 fetch 請求
 * @param url 請求 URL
 * @param options Fetch 選項和超時設置
 * @returns 響應內容
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError('請求超時，請稍後重試');
    }

    if (error instanceof Error) {
      throw new NetworkError('網路連接失敗', error);
    }

    throw new NetworkError('網路連接失敗');
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 安全的 JSON 解析
 * @param text JSON 字符串
 * @returns 解析結果或 null
 */
export function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * 建立 API 錯誤響應
 * @param message 錯誤消息
 * @param details 額外詳情
 * @returns 標準錯誤響應對象
 */
export function createErrorResponse(
  message: string,
  details?: unknown
) {
  const response: Record<string, unknown> = {
    success: false,
    error: message,
  };
  
  if (details) {
    response.details = details;
  }
  
  return response;
}

/**
 * 建立 API 成功響應
 * @param data 響應數據
 * @param message 可選的成功消息
 * @returns 標準成功響應對象
 */
export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    ...(message && { message }),
    data,
  };
}

/**
 * 判斷是否應該重試該錯誤
 * @param statusCode HTTP 狀態碼
 * @returns 是否應該重試
 */
export function isRetryableError(statusCode: number): boolean {
  // 5xx 伺服器錯誤、429 速率限制、408 超時應該重試
  return statusCode >= 500 || statusCode === 429 || statusCode === 408;
}
