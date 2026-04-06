'use client';

import { useRouter } from 'next/navigation';
import { useAuth, useIsMounted } from '@/lib/hooks';
import { useEffect } from 'react';
import { WisdomManager } from '@/components/features/admin/WisdomManager';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WisdomsAdminPage() {
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

  return (
    <div className="w-full mx-auto max-w-5xl py-8 px-4 relative z-10">
      <div className="mb-8">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-4">
            ← 返回管理中心
          </Button>
        </Link>
        <h1 className="text-4xl sm:text-5xl font-heading font-black tracking-tight bg-gradient-to-br from-[#7C3AED] to-[#DB2777] bg-clip-text text-transparent leading-tight">
          四字箴言管理
        </h1>
        <p className="text-clay-muted mt-3 font-medium text-lg tracking-wide">
          管理系統中可用的四字箴言選項
        </p>
      </div>

      <WisdomManager />
    </div>
  );
}