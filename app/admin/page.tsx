'use client';

import { useRouter } from 'next/navigation';
import { useAuth, useIsMounted } from '@/lib/hooks';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // 引入黏土按鈕

export default function AdminPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const isMounted = useIsMounted();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn || !isMounted) {
    return null;
  }

  const adminModules = [
    {
      title: '四字箴言管理',
      description: '新增、編輯或刪除教學評語中使用的四字箴言',
      icon: '📚',
      href: '/admin/wisdoms',
    },
    {
      title: '語氣風格管理',
      description: '管理評語的不同語氣風格（例如：親切、正式等）',
      icon: '🎭',
      href: '/admin/tones',
    },
  ];

  return (
    <div className="w-full mx-auto max-w-4xl py-8 px-4 relative z-10">
      {/* 頁頭 */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-heading font-black tracking-tight bg-gradient-to-br from-[#7C3AED] to-[#DB2777] bg-clip-text text-transparent mb-3 leading-tight">
          系統管理
        </h1>
        <p className="text-lg text-clay-muted font-medium">
          管理評語系統的箴言和語氣設定
        </p>
      </div>

      {/* 管理模組卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {adminModules.map((module) => (
          <Link key={module.href} href={module.href} className="block group">
            <div className="h-full p-8 rounded-[32px] sm:rounded-[40px] bg-white/80 backdrop-blur-xl border-0 shadow-clay-card transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-clay-btn-hover flex flex-col">
              <div className="mb-4">
                <div className="w-16 h-16 bg-[#EFEBF5] rounded-[24px] shadow-clay-pressed flex items-center justify-center text-4xl transition-transform duration-300 group-hover:scale-110">
                  {module.icon}
                </div>
              </div>
              <div className="flex-1 mb-6">
                <h2 className="text-2xl font-heading font-black text-clay-foreground mb-2">
                  {module.title}
                </h2>
                <p className="text-clay-muted font-medium leading-relaxed">
                  {module.description}
                </p>
              </div>
              <Button className="w-full pointer-events-none" variant="secondary">
                進入管理 →
              </Button>
            </div>
          </Link>
        ))}
      </div>

      {/* 快速提示 (凹陷面板) */}
      <div className="mt-12 p-8 sm:p-10 rounded-[32px] bg-[#EFEBF5] shadow-clay-pressed">
        <h3 className="text-xl font-heading font-black text-clay-foreground mb-4">💡 溫馨提示</h3>
        <ul className="space-y-3 text-base text-clay-muted font-medium">
          <li className="flex items-start gap-2"><span>•</span> 四字箴言用於豐富評語內容，每個箴言最多 20 字</li>
          <li className="flex items-start gap-2"><span>•</span> 語氣風格定義評語的呈現方式（親切、嚴肅等）</li>
          <li className="flex items-start gap-2"><span>•</span> 修改現有項目會影響未來生成的評語</li>
          <li className="flex items-start gap-2 text-clay-secondary"><span>•</span> 刪除的項目無法恢復，請謹慎操作</li>
        </ul>
      </div>

      {/* 操作按鈕 */}
      <div className="mt-8 flex gap-4">
        <Link href="/dashboard" className="flex-1">
          <Button className="w-full">← 返回主頁</Button>
        </Link>
        <Link href="/dashboard/history" className="flex-1">
          <Button variant="secondary" className="w-full">📋 查看歷史</Button>
        </Link>
      </div>
    </div>
  );
}