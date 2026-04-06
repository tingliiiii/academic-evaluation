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

  if (!mounted || !isLoggedIn) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (href: string): boolean => {
    if (href === '/dashboard/history') {
      return pathname === '/dashboard/history';
    } 
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname?.startsWith('/dashboard/evaluation');
    } 
    if (href === '/admin') {
      return pathname?.startsWith('/admin');
    }
    return pathname === href;
  };

  const navLinks = [
    { href: '/dashboard', label: '生成評語' },
    { href: '/dashboard/history', label: '歷史記錄' },
    { href: '/admin', label: '系統管理' },
  ];

  return (
    <>
      {/* 隱形佔位區塊：解決 Fixed Navbar 遮擋下方內容的問題 */}
      <div className="h-28 sm:h-36 w-full shrink-0" aria-hidden="true" />

      {/* 漂浮膠囊導航列 */}
      <nav className="fixed top-4 left-4 right-4 sm:top-6 sm:left-8 sm:right-8 bg-white/70 backdrop-blur-xl shadow-clay-card rounded-[32px] sm:rounded-[40px] z-50 transition-all duration-500">
        <div className="w-full px-4 sm:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            {/* Logo & Brand */}
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] rounded-2xl sm:rounded-[20px] flex items-center justify-center text-white text-lg sm:text-xl shadow-clay-btn transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                ✨
              </div>
              <span className="hidden sm:inline font-heading font-black tracking-tight text-xl bg-gradient-to-br from-[#7C3AED] to-[#DB2777] bg-clip-text text-transparent">
                評語系統
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-5 py-3 rounded-[20px] text-base font-bold transition-all duration-200 ${
                    isActive(link.href)
                      ? 'bg-[#EFEBF5] text-clay-accent shadow-clay-pressed' // 點擊凹陷狀態
                      : 'text-clay-muted hover:text-clay-accent hover:bg-clay-accent/5 hover:-translate-y-1'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-clay-muted hover:text-[#DB2777] hover:bg-[#DB2777]/10"
              >
                登出
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 bg-white shadow-clay-btn rounded-[16px] text-clay-accent active:scale-95 active:shadow-clay-pressed transition-all"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-5 flex flex-col justify-center gap-1.5">
                <span className={`block h-0.5 w-full bg-current rounded-full transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block h-0.5 w-full bg-current rounded-full transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-full bg-current rounded-full transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>

          {/* Mobile Navigation Dropdown */}
          {isMenuOpen && (
            <div className="md:hidden pb-6 pt-2 space-y-3 px-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-5 py-4 rounded-[20px] text-base font-bold transition-all ${
                    isActive(link.href)
                      ? 'bg-[#EFEBF5] text-clay-accent shadow-clay-pressed'
                      : 'text-clay-muted hover:bg-clay-accent/5 hover:text-clay-accent'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2">
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                >
                  🚪 登出系統
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}