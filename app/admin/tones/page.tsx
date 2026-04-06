'use client';

import { useRouter } from 'next/navigation';
import { useAuth, useIsMounted } from '@/lib/hooks';
import { useEffect } from 'react';
import { ToneManager } from '@/components/features/admin/ToneManager';
import Link from 'next/link';

export default function TonesPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const isMounted = useIsMounted();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn || !isMounted) return null;


  return (
    <div className="w-full mx-auto max-w-4xl py-8 px-4">
        {/* 返回按鈕 */}
        <Link href="/admin">
          <button className="mb-6 px-4 py-2 border-2 border-amber-300 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded-lg transition-all">
            ← 返回管理首頁
          </button>
        </Link>

        {/* 頁面標題 */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
            🎭 語氣風格管理
          </h1>
          <p className="text-amber-700 mt-2 font-medium">
            ✨ 管理評語的不同語氣風格，滿足不同教學情境的需要
          </p>
        </div>

        {/* 管理元件 */}
        <ToneManager />
      </div>
    );
  }
