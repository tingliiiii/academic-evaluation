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
    // 放大最大寬度讓卡片有空間呼吸，加入 relative z-10 避免被背景動畫球遮蓋
    <div className="w-full mx-auto max-w-3xl py-8 px-4 sm:px-6 relative z-10">
      <div className="mb-10 text-center">
        {/* 厚實的糖果色漸層大標題 */}
        <h1 className="text-4xl sm:text-5xl font-heading font-black tracking-tight bg-gradient-to-br from-[#7C3AED] to-[#DB2777] bg-clip-text text-transparent mb-4 leading-tight">
          生成評語
        </h1>
        <p className="text-lg text-clay-muted font-medium max-w-xl mx-auto">
          請輸入學生姓名，選擇適合的語氣與箴言，讓系統快速生成期末評語
        </p>
      </div>
      
      {/* 你的表單元件 (現在內部的卡片、按鈕、輸入框已經全部都是黏土風格了) */}
      <EvaluationForm />
    </div>
  );
}