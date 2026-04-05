/**
 * 簡單的認證系統 - 針對教師登入
 * 使用 localStorage 儲存登入狀態
 */

const STORAGE_KEY = 'academic_eval_auth';
const TEACHER_PASSWORD = process.env.NEXT_PUBLIC_TEACHER_PASSWORD || 'teacher123';

export interface AuthState {
  isLoggedIn: boolean;
  loginTime?: number;
}

/**
 * 獲取當前認證狀態
 */
export function getAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return { isLoggedIn: false };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { isLoggedIn: false };
    }

    const state = JSON.parse(stored) as AuthState;
    // 簡單檢查：確保存儲的狀態有效
    return state.isLoggedIn ? state : { isLoggedIn: false };
  } catch {
    return { isLoggedIn: false };
  }
}

/**
 * 執行登入
 * @param password - 用戶輸入的密碼
 * @returns 是否登入成功
 */
export function login(password: string): boolean {
  if (password === TEACHER_PASSWORD) {
    const authState: AuthState = {
      isLoggedIn: true,
      loginTime: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
    return true;
  }
  return false;
}

/**
 * 執行登出
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * 檢查是否已登入（用於服務端組件）
 */
export function isLoggedIn(): boolean {
  const state = getAuthState();
  return state.isLoggedIn;
}
