'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { useEffect } from 'react';
import { EvaluationHistory } from '@/components/features/evaluation/EvaluationHistory';

export default function HistoryPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  // 如果未登入，不渲染任何內容（讓 router.push 執行）
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="w-full mx-auto max-w-4xl py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent mb-2">
            📋 評語歷史
          </h1>
          <p className="text-amber-700 font-medium">
            ✨ 查看和管理所有生成的評語記錄
          </p>
        </div>
        
        <EvaluationHistory limit={20} showPagination={true} />
      </div>
    );
  }
