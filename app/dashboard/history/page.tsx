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

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="w-full mx-auto max-w-6xl py-8 px-4 relative z-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-heading font-black tracking-tight bg-gradient-to-br from-[#7C3AED] to-[#DB2777] bg-clip-text text-transparent mb-4 leading-tight">
          評語歷史
        </h1>
        <p className="text-lg text-clay-muted font-medium">
          查看和管理所有生成的評語記錄
        </p>
      </div>
      
      <EvaluationHistory limit={20} showPagination={true} />
    </div>
  );
}