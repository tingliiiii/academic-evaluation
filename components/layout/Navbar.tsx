/**
 * 全域應用導航欄 - 簡潔教師應用設計
 * 固定在頂部，包含應用名稱、導航鏈接和登出功能
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // 如果還沒掛載，或者未登入，都先回傳 null
  if (!mounted || !isLoggedIn) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // 判斷是否是當前活躍的路由
  const isActive = (href: string): boolean => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/history' || pathname?.startsWith('/dashboard');
    }
    if (href === '/admin') {
      return pathname?.startsWith('/admin');
    }
    return pathname === href;
  };

  const navLinks = [
    { href: '/dashboard', label: '✏️ 生成評語' },
    { href: '/dashboard/history', label: '📋 歷史記錄' },
    { href: '/admin', label: '⚙️ 系統管理' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b-2 border-amber-200 shadow-md z-50 backdrop-blur-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
              ✨
            </div>
            <span className="hidden sm:inline font-bold text-lg bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              評語系統
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.href)
                  ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 border border-amber-300'
                  : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-amber-700 hover:text-orange-600 hover:bg-orange-50 font-medium"
            >
              🚪 登出
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-amber-100 rounded-lg text-amber-700"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.href)
                  ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-900 border border-amber-300'
                  : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700'
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-left px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            >
              🚪 登出
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
