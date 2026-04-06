'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentInfoForm } from './StudentInfoForm';
import { ToneSelector } from './ToneSelector';
import { WisdomSelector } from './WisdomSelector';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

interface EvaluationFormProps {
  onSuccess?: (evaluationId: string) => void;
}

export function EvaluationForm({ onSuccess }: EvaluationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      studentName: '',
      selectedTone: '',
      selectedWisdoms: [],
    },
  });

  const onSubmit = async (data: {
    studentName: string;
    selectedTone: string;
    selectedWisdoms: string[];
  }) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          studentName: data.studentName,
          toneId: data.selectedTone,
          wisdomIds: data.selectedWisdoms,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '生成評語失敗');
      }

      const result = await response.json();
      setSuccess(true);
      methods.reset();

      if (onSuccess) {
        onSuccess(result.id);
      } else {
        // 延遲後導向詳情頁
        setTimeout(() => {
          router.push(`/dashboard/evaluation/${result.id}`);
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        {/* 成功提示 */}
        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-700">
            ✓ 評語生成成功！正在導向詳情頁...
          </Alert>
        )}

        {/* 錯誤提示 */}
        {error && (
          <Alert className="bg-red-50 border-red-200 text-red-700">
            ✕ {error}
          </Alert>
        )}

        {/* 學生資訊輸入 */}
        <StudentInfoForm />

        {/* 語氣選擇 */}
        <ToneSelector />

        {/* 箴言多選 */}
        <WisdomSelector />

        {/* 提交按鈕 */}
        <Button
          type="submit"
          disabled={isSubmitting || success}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? '生成中...' : '生成評語'}
        </Button>
      </form>
    </FormProvider>
  );
}
