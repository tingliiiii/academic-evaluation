/**
 * lib/types.ts
 * 
 * 統一的類型定義
 * 
 * 包含：
 * - API 請求/響應類型
 * - 資料庫模型類型
 * - 分頁和列表類型
 * - 共用響應包裝類型
 */

import type { Prisma } from "@prisma/client";

// ============================================================================
// 資料庫模型類型（從 Prisma 自動生成）
// ============================================================================

/**
 * 形容詞模型
 */
export type Wisdom = Prisma.WisdomGetPayload<Record<string, never>>;

/**
 * 語氣模型
 */
export type Tone = Prisma.ToneGetPayload<Record<string, never>>;

/**
 * 學生模型
 */
export type Student = Prisma.StudentGetPayload<Record<string, never>>;

/**
 * 評語模型（包含關聯）
 */
export type Evaluation = Prisma.EvaluationGetPayload<{
  include: {
    student: true;
    tone: true;
    wisdoms: {
      include: {
        wisdom: true;
      };
    };
  };
}>;

// ============================================================================
// 認證相關類型
// ============================================================================

/**
 * 登入請求
 */
export interface LoginRequest {
  password: string;
}

/**
 * 登入響應
 */
export interface LoginResponse {
  success: boolean;
  token?: string;
  error?: string;
}

// ============================================================================
// 評語相關類型
// ============================================================================

/**
 * 評語生成請求
 */
export interface EvaluationRequest {
  /** 學生名稱（2-10字） */
  studentName: string;
  /** 形容詞ID列表（至少1個，最多10個） */
  wisdomIds: string[];
  /** 語氣ID */
  toneId: string;
  /** 生成的提示詞內容（至少50字） */
  prompt: string;
}

/**
 * 評語生成響應
 */
export interface EvaluationResponse {
  id: string;
  studentName: string;
  content: string;
  createdAt: string;
}

/**
 * 評語列表查詢參數
 */
export interface EvaluationListQuery {
  /** 頁碼（最小1） */
  page: number;
  /** 每頁數量（1-100，預設10） */
  pageSize: number;
  /** 學生名稱搜尋（可選） */
  studentName?: string;
}

/**
 * 評語列表響應項目
 */
export interface EvaluationListItem {
  id: string;
  studentName: string;
  toneName: string;
  wisdoms: string[];
  createdAt: string;
}

/**
 * 分頁資訊
 */
export interface PaginationInfo {
  /** 當前頁碼 */
  page: number;
  /** 每頁數量 */
  pageSize: number;
  /** 總記錄數 */
  total: number;
  /** 總頁數 */
  totalPages: number;
}

/**
 * 評語列表響應
 */
export interface EvaluationListResponse {
  items: EvaluationListItem[];
  pagination: PaginationInfo;
}

/**
 * 評語詳情響應
 */
export interface EvaluationDetailResponse extends EvaluationResponse {
  tone: {
    id: string;
    name: string;
    description?: string;
  };
  wisdoms: Array<{
    id: string;
    content: string;
    priority?: number;
  }>;
  prompt: string;
}

// ============================================================================
// 提示詞相關類型
// ============================================================================

/**
 * 提示詞生成請求
 */
export interface PromptGenerationRequest {
  /** 學生名稱 */
  studentName: string;
  /** 形容詞ID列表 */
  wisdomIds: string[];
  /** 語氣ID */
  toneId: string;
}

/**
 * 提示詞生成響應
 */
export interface PromptGenerationResponse {
  prompt: string;
  metadata: {
    studentName: string;
    wisdoms: string[];
    tone: string;
  };
}

// ============================================================================
// 語氣和形容詞相關類型
// ============================================================================

/**
 * 語氣創建請求
 */
export interface ToneCreateRequest {
  /** 語氣名稱 */
  name: string;
  /** 語氣描述 */
  description?: string;
}

/**
 * 語氣列表響應項目
 */
export interface ToneListItem {
  id: string;
  name: string;
  description?: string;
}

/**
 * 形容詞創建請求
 */
export interface WisdomCreateRequest {
  /** 形容詞內容 */
  content: string;
  /** 優先級（0-100） */
  priority?: number;
}

/**
 * 形容詞列表響應項目
 */
export interface WisdomListItem {
  id: string;
  content: string;
  priority?: number;
}

// ============================================================================
// API 響應包裝類型
// ============================================================================

/**
 * 成功的 API 響應
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * 失敗的 API 響應
 */
export interface ErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

/**
 * API 響應（成功或失敗）
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

// ============================================================================
// 分頁類型
// ============================================================================

/**
 * 分頁列表
 */
export interface PaginatedList<T> {
  items: T[];
  pagination: PaginationInfo;
}

// ============================================================================
// 用戶上下文類型
// ============================================================================

/**
 * 認證上下文
 */
export interface AuthContext {
  /** 是否已認證 */
  isLoggedIn: boolean;
  /** 管理員令牌 */
  token?: string;
}