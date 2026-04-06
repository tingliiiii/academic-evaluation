'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
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

  // 檢查登入狀態
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  // 獲取評語詳情
  useEffect(() => {
    if (!evaluationId || !isLoggedIn) return;

    const fetchEvaluation = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/evaluations/${evaluationId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('認證失敗，請重新登入');
          }
          if (response.status === 404) {
            throw new Error('評語不存在或已刪除');
          }
          throw new Error('無法載入評語詳情');
        }

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

  // 如果未登入，不渲染
  if (!isLoggedIn) {
    return null;
  }

  // 載入中
  if (loading) {
    return (
      <div className="w-full mx-auto max-w-3xl py-8 px-4">
        <Card className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
          <div className="text-center">
            <p className="text-amber-700 font-bold text-lg">⏳ 載入評語中...</p>
          </div>
        </Card>
      </div>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="w-full mx-auto max-w-3xl py-8 px-4">
        <div className="space-y-4">
          <Alert className="bg-red-50 border-2 border-red-300 text-red-700 font-bold">
            ❌ {error}
          </Alert>
          <button
            onClick={() => router.push('/dashboard/history')}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all"
          >
            ← 返回歷史記錄
          </button>
        </div>
      </div>
    );
  }

  // 評語不存在
  if (!evaluation) {
    return (
      <div className="w-full mx-auto max-w-3xl py-8 px-4">
        <div className="space-y-4">
          <Alert className="bg-yellow-50 border-2 border-yellow-300 text-yellow-700 font-bold">
              ⚠ 評語不存在或已被刪除
            </Alert>
            <button
              onClick={() => router.push('/dashboard/history')}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all"
            >
              ← 返回歷史記錄
            </button>
          </div>
      </div>
    );
  }

  // 刪除評語後的回調
  const handleDeleteSuccess = () => {
    router.push('/dashboard/history');
  };

  return (
    <div className="w-full mx-auto max-w-3xl py-8 px-4">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="mb-4 px-4 py-2 border-2 border-amber-300 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded-lg transition-all"
          >
            ← 返回
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
            ✏️ 評語詳情
          </h1>
          <p className="text-amber-700 mt-2 font-medium">ID: {evaluationId}</p>
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
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
              },
            });

            if (!response.ok) {
              throw new Error('刪除失敗');
            }
          }}
          onClose={handleDeleteSuccess}
        />
    </div>
  );
}