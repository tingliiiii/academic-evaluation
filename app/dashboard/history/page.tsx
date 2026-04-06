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
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-8 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">📋 評語歷史</h1>
        <p className="text-gray-500 mb-8">查看和管理所有生成的評語記錄</p>
        
        <EvaluationHistory limit={20} showPagination={true} />
      </main>
    </div>
  );
}
