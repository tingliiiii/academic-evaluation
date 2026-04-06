'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthLogin } from '@/lib/hooks';
import { getAuthState } from '@/lib/auth';

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
        // 登入成功，重定向至 dashboard
        router.push('/dashboard');
      } else {
        // 登入失敗，顯示錯誤信息
        setError(authError || '登入失敗');
      }
    },
    [password, login, authError, router]
  );

  // 如果已登入，不顯示表單（讓 router.push 在 effect 中執行）
  const state = getAuthState();
  if (state.isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              期末評語生成系統
            </h1>
            <p className="text-sm text-slate-500">
              我是生成期末評語小幫手
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                密碼
              </label>
              <input
                id="password"
                type="password"
                placeholder="輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoFocus
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Error Message */}
            {(error || authError) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error || authError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登入中...' : '登入'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              忘記密碼請聯繫管理員
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
