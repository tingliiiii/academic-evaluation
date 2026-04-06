'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthLogin } from '@/lib/hooks';
import { getAuthState } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error: authError } = useAuthLogin();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 檢查是否已登入，如果已登入則重定向
  useEffect(() => {
    const state = getAuthState();
    if (state.isLoggedIn) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!password.trim()) {
        setError('請輸入密碼');
        return;
      }

      const success = await login(password);
      if (success) {
        window.location.href = '/dashboard'; 
      } else {
        // 登入失敗，顯示錯誤信息
        setError(authError || '登入失敗');
      }
    },
    [password, login, authError]
  );

  // 如果已登入，不顯示表單
  const state = getAuthState();
  if (state.isLoggedIn) {
    return null;
  }

  return (
    // 加入 relative z-10 確保內容在背景動畫球體的上方
    <div className="min-h-screen flex items-center justify-center w-full p-4 relative z-10">
      <div className="w-full max-w-md">
        {/* 黏土毛玻璃卡片 */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[32px] sm:rounded-[40px] shadow-clay-card p-8 sm:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-clay-btn-hover">
          
          {/* Header */}
          <div className="text-center mb-10">
            {/* 糖果色漸層標題 */}
            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight bg-gradient-to-br from-[#7C3AED] to-[#DB2777] bg-clip-text text-transparent mb-3 leading-tight">
              期末評語生成系統
            </h1>
            <p className="text-base sm:text-lg text-clay-muted font-medium">
              🌟 我是生成學生期末評語小幫手
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 使用重構後的 Label 與 Input */}
            <div className="space-y-3">
              <Input
                id="password"
                type="password"
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Error Message */}
            {(error || authError) && (
              <div className="px-5 py-4 bg-pink-50/80 backdrop-blur-sm rounded-[20px] text-base text-clay-secondary font-bold text-center shadow-sm">
                ❌ {error || authError}
              </div>
            )}

            {/* Submit Button - 使用重構後的黏土按鈕 */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full text-lg"
              size="lg"
            >
              {loading ? '⏳ 系統登入中...' : '✨ 進入系統'}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t-2 border-clay-muted/10 text-center">
            <p className="text-sm font-bold tracking-wide text-clay-muted">
              💡 忘記密碼請聯繫管理員
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}