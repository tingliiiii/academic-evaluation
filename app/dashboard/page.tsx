'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { useEffect } from 'react';

export default function DashboardPage() {
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
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">📝 評語生成系統</h1>
        <div className="text-center text-gray-500">
          <p>正在建立表單元件⋯⋯</p>
        </div>
      </main>
    </div>
  );
}