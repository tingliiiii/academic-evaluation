// lib/types.ts
import type { Prisma } from "@prisma/client";

// API 請求/響應型別
export interface EvaluationRequest {
  studentName: string;
  wisdomIds: string[];
  toneId: string;
}

export interface PromptGenerateRequest {
  studentName: string;
  wisdomIds: string[];
  toneId: string;
}

export interface PromptGenerateResponse {
  prompt: string;
  metadata: {
    studentName: string;
    wisdoms: string[];
    tone: string;
  };
}

export interface EvaluationGenerateRequest {
  prompt: string;
  studentName: string;
  wisdomIds: string[];
  toneId: string;
}

export interface EvaluationGenerateResponse {
  id: string;
  content: string;
  createdAt: string;
}

export interface WisdomCreateRequest {
  content: string;
  priority?: number;
}

export interface ToneCreateRequest {
  name: string;
  description?: string;
}

// 資料庫模型型別（從 Prisma 自動生成）
export type Wisdom = Prisma.WisdomGetPayload<Record<string, never>>;
export type Tone = Prisma.ToneGetPayload<Record<string, never>>;
export type Student = Prisma.StudentGetPayload<Record<string, never>>;
export type Evaluation = Prisma.EvaluationGetPayload<{
  include: {
    student: true;
    tone: true;
    wisdoms: true;
  };
}>;