'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { EvaluationResult } from '@/components/features/evaluation/EvaluationResult';
import { extractErrorMessage } from '@/lib/errors';

interface EvaluationDetail {
  id: string;
  studentName: string;
  toneName: string;
  content: string;
  createdAt: string;
}

export default function EvaluationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn } = useAuth();
  const evaluationId = params.id as string;

  const [evaluation, setEvaluation] = useState<EvaluationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) router.push('/');
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (!evaluationId || !isLoggedIn) return;
    const fetchEvaluation = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/evaluations/${evaluationId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        });
        if (!response.ok) throw new Error(response.status === 401 ? '認證失敗' : '無法載入評語詳情');
        const data = await response.json();
        setEvaluation(data.data);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluation();
  }, [evaluationId, isLoggedIn]);

  if (!isLoggedIn) return null;

  // 載入中狀態
  if (loading) {
    return (
      <div className="w-full mx-auto max-w-3xl py-8 px-4 relative z-10">
        <div className="p-8 rounded-[32px] bg-[#EFEBF5] shadow-clay-pressed flex justify-center">
          <p className="text-clay-muted font-bold text-lg">⏳ 載入評語中...</p>
        </div>
      </div>
    );
  }

  // 錯誤或空狀態
  if (error || !evaluation) {
    return (
      <div className="w-full mx-auto max-w-3xl py-8 px-4 relative z-10">
        <div className="space-y-6">
          <div className="p-6 bg-pink-50 rounded-[24px] shadow-clay-pressed text-clay-secondary font-bold">
            {error ? `❌ ${error}` : '⚠ 評語不存在或已被刪除'}
          </div>
          <Button onClick={() => router.push('/dashboard/history')} variant="secondary">
            ← 返回歷史記錄
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto max-w-3xl py-8 px-4 relative z-10">
      <div className="mb-8 flex flex-col items-start gap-4">
        <Button onClick={() => router.back()} variant="ghost" size="sm" className="mb-2">
          ← 返回列表
        </Button>
        <div>
          <h1 className="text-4xl sm:text-5xl font-heading font-black tracking-tight bg-gradient-to-br from-[#7C3AED] to-[#DB2777] bg-clip-text text-transparent">
            ✏️ 評語詳情
          </h1>
          <p className="text-clay-muted mt-2 font-medium tracking-wide text-sm">ID: {evaluationId}</p>
        </div>
      </div>

      <EvaluationResult
        studentName={evaluation.studentName}
        toneName={evaluation.toneName}
        content={evaluation.content}
        createdAt={evaluation.createdAt}
        evaluationId={evaluation.id}
        onDelete={async (id) => {
          const response = await fetch(`/api/evaluations/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
          });
          if (!response.ok) throw new Error('刪除失敗');
        }}
        onClose={() => router.push('/dashboard/history')}
      />
    </div>
  );
}