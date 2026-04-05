/**
 * React Hooks - API 呼叫和狀態管理
 * 統一處理所有 API 呼叫、loading 狀態和錯誤處理
 */

import { useEffect, useState, useCallback } from 'react';
import { getAuthState, login as authLogin, logout as authLogout } from '@/lib/auth';
import type { Wisdom, Tone } from '@/lib/types';

// ============================================================================
// 認證 Hooks
// ============================================================================

export interface AuthContextValue {
  isLoggedIn: boolean;
  logout: () => void;
}

export function useAuth(): AuthContextValue {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 僅在客戶端執行
    const state = getAuthState();
    setIsLoggedIn(state.isLoggedIn);
    setMounted(true);
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setIsLoggedIn(false);
  }, []);

  // 在未 mount 前返回未登入狀態（避免 hydration 錯誤）
  return {
    isLoggedIn: mounted ? isLoggedIn : false,
    logout,
  };
}

export interface UseAuthLoginResult {
  login: (password: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function useAuthLogin(): UseAuthLoginResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // 模擬網路延遲
      await new Promise((resolve) => setTimeout(resolve, 300));

      const success = authLogin(password);
      if (!success) {
        setError('密碼錯誤，請重試');
        return false;
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : '登入失敗';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, loading, error };
}

// ============================================================================
// 箴言 Hooks
// ============================================================================

export interface UseFetchWisdomsResult {
  wisdoms: Wisdom[];
  loading: boolean;
  error: string | null;
}

export function useFetchWisdoms(): UseFetchWisdomsResult {
  const [wisdoms, setWisdoms] = useState<Wisdom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWisdoms = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/wisdoms');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setWisdoms(data.data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : '取得箴言失敗';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchWisdoms();
  }, []);

  return { wisdoms, loading, error };
}

// ============================================================================
// 語氣 Hooks
// ============================================================================

export interface UseFetchTonesResult {
  tones: Tone[];
  loading: boolean;
  error: string | null;
}

export function useFetchTones(): UseFetchTonesResult {
  const [tones, setTones] = useState<Tone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTones = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/tones');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTones(data.data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : '取得語氣失敗';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchTones();
  }, []);

  return { tones, loading, error };
}

// ============================================================================
// Prompt 生成 Hooks
// ============================================================================

export interface UseGeneratePromptResult {
  prompt: string | null;
  metadata: {
    studentName: string;
    wisdoms: string[];
    toneName: string;
  } | null;
  loading: boolean;
  error: string | null;
  generate: (
    studentName: string,
    wisdomIds: string[],
    toneId: string,
    toneName: string
  ) => Promise<void>;
}

export function useGeneratePrompt(): UseGeneratePromptResult {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    studentName: string;
    wisdoms: string[];
    toneName: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (
      studentName: string,
      wisdomIds: string[],
      toneId: string,
      toneName: string
    ) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/prompt/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName,
            wisdomIds,
            toneId,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPrompt(data.data.prompt);
        setMetadata({
          studentName,
          wisdoms: data.data.metadata.wisdoms,
          toneName,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Prompt 生成失敗';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { prompt, metadata, loading, error, generate };
}

// ============================================================================
// 評語生成 Hooks
// ============================================================================

export interface UseGenerateEvaluationResult {
  evaluation: {
    id: string;
    studentName: string;
    content: string;
    createdAt: string;
  } | null;
  loading: boolean;
  error: string | null;
  generate: (
    prompt: string,
    studentName: string,
    wisdomIds: string[],
    toneId: string
  ) => Promise<void>;
}

export function useGenerateEvaluation(): UseGenerateEvaluationResult {
  const [evaluation, setEvaluation] = useState<{
    id: string;
    studentName: string;
    content: string;
    createdAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (
      prompt: string,
      studentName: string,
      wisdomIds: string[],
      toneId: string
    ) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/evaluation/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            studentName,
            wisdomIds,
            toneId,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setEvaluation(data.data);
      } catch (err) {
        const message = err instanceof Error ? err.message : '評語生成失敗';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { evaluation, loading, error, generate };
}

// ============================================================================
// 評語列表 Hooks
// ============================================================================

export interface EvaluationItem {
  id: string;
  studentName: string;
  toneName: string;
  wisdoms: string[];
  createdAt: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface UseFetchEvaluationsResult {
  evaluations: EvaluationItem[];
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  refetch: (page?: number, pageSize?: number, studentName?: string) => Promise<void>;
}

export function useFetchEvaluations(
  initialPage: number = 1,
  initialPageSize: number = 10,
  initialStudentName?: string
): UseFetchEvaluationsResult {
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: initialPage,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(
    async (
      page: number = initialPage,
      pageSize: number = initialPageSize,
      studentName?: string
    ) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
          ...(studentName && { studentName }),
        });

        const response = await fetch(
          `/api/evaluation/generate/list?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setEvaluations(data.data.items || []);
        setPagination(data.data.pagination);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : '取得評語列表失敗';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [initialPage, initialPageSize]
  );

  useEffect(() => {
    refetch(initialPage, initialPageSize, initialStudentName);
  }, [initialPage, initialPageSize, initialStudentName, refetch]);

  return { evaluations, pagination, loading, error, refetch };
}
