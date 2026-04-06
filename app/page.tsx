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
    <div className="min-h-screen flex items-center justify-center w-full">
      <div className="w-full max-w-sm px-4">
        <div className="bg-white rounded-xl border-2 border-amber-200 shadow-lg p-8 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">✨</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
              期末評語生成系統
            </h1>
            <p className="text-sm text-amber-700">
              🌟 智能生成溫暖的期末評語
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-amber-900 mb-2"
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
                className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg text-gray-900 placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
            </div>

            {/* Error Message */}
            {(error || authError) && (
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg text-sm text-red-700 font-medium">
                ❌ {error || authError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg"
            >
              {loading ? '⏳ 登入中...' : '✨ 登入'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-amber-200 text-center">
            <p className="text-xs text-amber-700">
              💡 忘記密碼請聯繫管理員
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
