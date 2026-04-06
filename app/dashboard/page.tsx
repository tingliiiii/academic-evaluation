'use client';

import { useRouter } from 'next/navigation';
import { useAuth, useIsMounted } from '@/lib/hooks';
import { useEffect } from 'react';
import { EvaluationForm } from '@/components/features/evaluation/EvaluationForm';

export default function DashboardPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const isMounted = useIsMounted();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  // 如果未登入或未掛載，不渲染任何內容
  if (!isLoggedIn || !isMounted) return null;

  return (
    <div className="w-full mx-auto max-w-2xl py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent mb-2">
            ✏️ 評語生成系統
          </h1>
          <p className="text-amber-700 font-medium">
            ✨ 輸入學生姓名，選擇語氣與箴言，系統為你生成貼心的期末評語
          </p>
        </div>
        
        <EvaluationForm />
      </div>
    );
}