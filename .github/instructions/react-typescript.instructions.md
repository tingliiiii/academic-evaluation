---
description: "Use when: writing React components with TypeScript; building UI interfaces with shadcn/ui and Tailwind CSS"
applyTo: "**/*.tsx, **/*.jsx"
---

# React + TypeScript 編碼標準

**Last Updated:** 2026-04-06

---

## 📋 命名規範

| 資源 | 規範 | 示例 |
|------|------|------|
| **React 元件** | PascalCase 文件名 | `StudentInfoForm.tsx` |
| **Hook** | camelCase 以 `use` 開頭 | `useEvaluation.ts` |
| **Props 型別** | PascalCase 以 `Props` 結尾 | `StudentInfoFormProps` |
| **事件處理** | camelCase 以 `handle` 開頭 | `handleSubmit`, `onClick` |
| **狀態變數** | camelCase | `studentName`, `isLoading` |

---

## 🏗️ 函式式元件結構

### 完整示例

```typescript
// ✅ 正確：完整的元件結構

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { EvaluationRequest } from '@/lib/types';

interface StudentInfoFormProps {
  onSubmit: (data: EvaluationRequest) => Promise<void>;
  isLoading?: boolean;
  initialName?: string;
}

export function StudentInfoForm({
  onSubmit,
  isLoading = false,
  initialName = '',
}: StudentInfoFormProps) {
  const [studentName, setStudentName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentName.trim()) {
      setError('學生姓名必填');
      return;
    }

    try {
      setError(null);
      await onSubmit({
        studentName,
        wisdomIds: [],
        toneId: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '請求失敗');
    }
  }, [studentName, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
        placeholder="輸入學生姓名"
        disabled={isLoading}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" disabled={isLoading || !studentName.trim()}>
        {isLoading ? '生成中...' : '生成評語'}
      </Button>
    </form>
  );
}
```

### 反面示例

```typescript
// ❌ 錯誤：不明確的型別和命名

export default function Form({ data }: any) {  // 型別不明確
  const [x, setX] = useState('');              // 變數名不清晰
  
  const fn = () => {                            // 函式名不清晰
    setX(data.value);
    // 邏輯混亂
  };
  
  return <div>{x}</div>;
}
```

---

## 🪣 Hook 使用規範

### 自定義 Hook

```typescript
// ✅ 正確：命名清晰、回傳值完整

import { useCallback, useMemo, useState } from 'react';

export function useEvaluationState() {
  const [evaluations, setEvaluations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(e => e.studentName);
  }, [evaluations]);

  const addEvaluation = useCallback((evaluation: Evaluation) => {
    setEvaluations(prev => [...prev, evaluation]);
  }, []);

  const clearEvaluations = useCallback(() => {
    setEvaluations([]);
  }, []);

  return {
    evaluations,
    filteredEvaluations,
    isLoading,
    setIsLoading,
    addEvaluation,
    clearEvaluations,
  };
}
```

### Hook 套件陣列

```typescript
// ✅ 正確：列出所有套件

useEffect(() => {
  fetchData(id, filter);
}, [id, filter]); // 依赖都列出

// ❌ 錯誤：遺漏套件

useEffect(() => {
  fetchData(id, filter); // 使用了 id 和 filter
}, [id]); // 缺少 filter，會導致陳舊閉包
```

---

## 💾 型別定義

### Props 型別

```typescript
// ✅ 正確：完整的 Props 定義

interface EvaluationFormProps {
  studentId: string;
  onSuccess?: (evaluationId: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function EvaluationForm({
  studentId,
  onSuccess,
  onError,
  className = '',
}: EvaluationFormProps) {
  // 實作
}
```

### 避免 any 型別

```typescript
// ❌ 錯誤
function process(data: any) {
  return data.value * 2;  // 無法檢查 value 是否存在
}

// ✅ 正確
interface DataInput {
  value: number;
}

function process(data: DataInput): number {
  return data.value * 2;
}
```

---

## 🎨 shadcn/ui 整合

### Button 元件

```typescript
// ✅ 正確：使用 shadcn Button

import { Button } from '@/components/ui/button';

export function MyComponent() {
  return (
    <Button 
      onClick={handleClick}
      disabled={isDisabled}
      variant="destructive"  // default, secondary, outline, ghost, destructive
      size="sm"              // default, sm, lg, icon
    >
      Delete
    </Button>
  );
}
```

### Form 整合（react-hook-form）

```typescript
// ✅ 正確：完整的表單整合

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  studentName: z.string().min(1, '姓名必填').max(50),
  email: z.string().email('無效的郵箱'),
});

type FormData = z.infer<typeof formSchema>;

export function StudentForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    const response = await fetch('/api/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // 處理響應
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('studentName')} />
      {errors.studentName && (
        <span className="text-red-500">{errors.studentName.message}</span>
      )}
      
      <Button type="submit" disabled={isSubmitting}>
        提交
      </Button>
    </form>
  );
}
```

---

## 🚫 常見錯誤

| 錯誤 | 症狀 | 解決方案 |
|------|------|---------|
| **直接修改 state** | 元件不重新渲染 | 使用 `setState` 建立新對象 |
| **無限循環** | 元件不斷重新渲染 | 檢查 useEffect 套件陣列 |
| **閉包陳舊值** | 事件處理中使用舊值 | 新增缺少的套件 |
| **忘記 key** | 列表重新排序時出錯 | 為 `map()` 的每個元素新增 `key` |
| **條件化 Hook** | React Hook 順序錯誤 | Hook 必須在元件頂層呼叫 |

---

## 📚 參考

- [React 官方文件](https://react.dev)
- [TypeScript React Cheatsheet](https://react-typescript-cheatsheet.netlify.app)
- [shadcn/ui 元件庫](https://ui.shadcn.com)
