'use client';

import { useRouter } from 'next/navigation';
import { useAuth, useIsMounted } from '@/lib/hooks';
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

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
      color: 'from-blue-50 to-blue-100',
    },
    {
      title: '語氣風格管理',
      description: '管理評語的不同語氣風格（例如：親切、正式等）',
      icon: '🎭',
      href: '/admin/tones',
      color: 'from-purple-50 to-purple-100',
    },
  ];

  return (
    <div className="w-full mx-auto max-w-4xl py-8 px-4">
        {/* 頁頭 */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent mb-2">
            ⚙️ 系統管理
          </h1>
          <p className="text-amber-700 font-medium">
            🎯 管理評語系統的箴言和語氣設定
          </p>
        </div>

        {/* 管理模組卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminModules.map((module) => (
            <Link key={module.href} href={module.href}>
              <Card className="p-6 cursor-pointer hover:shadow-xl transition transform hover:-translate-y-2 bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-200 hover:border-orange-300">
                <div className="space-y-4">
                  <div>
                    <span className="text-5xl block">{module.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-amber-950">
                      {module.title}
                    </h2>
                    <p className="text-amber-800 text-sm mt-2">
                      {module.description}
                    </p>
                  </div>
                  <button className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-md">
                    進入管理 →
                  </button>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* 快速提示 */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-amber-200">
          <h3 className="text-lg font-bold text-amber-950 mb-3">💡 提示</h3>
          <ul className="space-y-2 text-sm text-amber-900">
            <li>• 四字箴言用於豐富評語內容，每個箴言最多 20 字</li>
            <li>• 語氣風格定義評語的呈現方式（親切、嚴肅等）</li>
            <li>• 修改現有項目會影響未來生成的評語</li>
            <li>• 刪除的項目無法恢復，請謹慎操作</li>
          </ul>
        </Card>

        {/* 操作按鈕 */}
        <div className="mt-8 flex gap-3">
          <Link href="/dashboard" className="flex-1">
            <button className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all">
              ← 返回主頁
            </button>
          </Link>
          <Link href="/dashboard/history" className="flex-1">
            <button className="w-full px-4 py-2 border-2 border-amber-300 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded-lg transition-all">
              📋 查看歷史
            </button>
          </Link>
        </div>
      </div>
    );
  }
