'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { StudentInfoForm } from './StudentInfoForm';
import { ToneSelector } from './ToneSelector';
import { WisdomSelector } from './WisdomSelector';
import { Alert } from '@/components/ui/alert';
import { fetchWithTimeout, retryAsync, extractErrorMessage } from '@/lib/errors';

interface EvaluationFormProps {
  onSuccess?: (evaluationId: string) => void;
}

type SubmitStep = 'idle' | 'generating-prompt' | 'calling-api' | 'saving' | 'success' | 'error';

export function EvaluationForm({ onSuccess }: EvaluationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState<SubmitStep>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      studentName: '',
      selectedTone: '',
      selectedWisdoms: [],
    },
  });

  const getStepMessage = (): string => {
    switch (currentStep) {
      case 'generating-prompt':
        return '正在生成提示詞...';
      case 'calling-api':
        return 'Gemini AI 生成中，請耐心等待...';
      case 'saving':
        return '正在保存評語...';
      case 'success':
        return '✓ 評語生成成功！正在導向詳情頁...';
      default:
        return '';
    }
  };

  const handleRetry = async () => {
    setRetryCount((prev) => prev + 1);
    methods.handleSubmit(onSubmit)();
  };

  const onSubmit = async (data: {
    studentName: string;
    selectedTone: string;
    selectedWisdoms: string[];
  }) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    setCurrentStep('generating-prompt');
    setRetryCount(0);

    // 創建新的 abort controller
    abortControllerRef.current = new AbortController();

    try {
      // Step 1: 生成提示詞
      let prompt = '';

      try {
        const promptResponse = await retryAsync(
          () =>
            fetchWithTimeout(`/api/prompts/preview`, {
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
              timeout: 30000,
              signal: abortControllerRef.current!.signal,
            }),
          {
            maxRetries: 2,
            delayMs: 1000,
            onRetry: (attempt) => {
              console.warn(`提示詞生成失敗，進行第 ${attempt} 次重試...`);
            },
          }
        );

        if (!promptResponse.ok) {
          const errorData = await promptResponse.json();
          throw new Error(
            errorData.error || '提示詞生成失敗，請檢查輸入'
          );
        }

        const promptData = await promptResponse.json();
        if (!promptData.success || !promptData.data?.prompt) {
          throw new Error('提示詞生成失敗，請稍後重試');
        }

        prompt = promptData.data.prompt;
      } catch (err) {
        const msg = extractErrorMessage(err);
        throw new Error(`提示詞生成失敗: ${msg}`);
      }

      // Step 2: 調用 API 生成評語
      setCurrentStep('calling-api');

      const evaluationResponse = await retryAsync(
        () =>
          fetchWithTimeout(`/api/evaluations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            },
            body: JSON.stringify({
              studentName: data.studentName,
              toneId: data.selectedTone,
              wisdomIds: data.selectedWisdoms,
              prompt,
            }),
            timeout: 120000, // Gemini API 可能需要較長時間
            signal: abortControllerRef.current!.signal,
          }),
        {
          maxRetries: 2,
          delayMs: 2000,
          onRetry: (attempt) => {
            console.warn(`評語生成失敗，進行第 ${attempt} 次重試...`);
          },
        }
      );

      if (!evaluationResponse.ok) {
        const errorData = await evaluationResponse.json().catch(() => ({}));
        const errorMsg =
          errorData.error ||
          `HTTP ${evaluationResponse.status} 錯誤`;
        throw new Error(errorMsg);
      }

      const result = await evaluationResponse.json();

      if (!result.success || !result.data?.id) {
        throw new Error(result.error || '評語生成失敗');
      }

      // Step 3: 成功
      setCurrentStep('success');
      setSuccess(true);
      methods.reset();

      // 導向詳情頁
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(result.data.id);
        } else {
          router.push(`/dashboard/evaluation/${result.data.id}`);
        }
      }, 1500);
    } catch (err) {
      // 處理取消請求
      if (err instanceof Error && err.name === 'AbortError') {
        setError('請求已取消');
      } else {
        const errorMsg = extractErrorMessage(err);
        setError(errorMsg);
      }

      setCurrentStep('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setIsSubmitting(false);
    setCurrentStep('idle');
    setError('已取消');
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        {/* 成功提示 */}
        {success && (
          <Alert className="bg-green-50 border-2 border-green-300 text-green-700 font-medium">
            ✨ {getStepMessage()}
          </Alert>
        )}

        {/* 處理中提示 */}
        {isSubmitting && currentStep !== 'idle' && (
          <Alert className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 text-amber-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold mb-1">⏳ {getStepMessage()}</p>
                <p className="text-sm text-amber-800">
                  {retryCount > 0 && `(重試 ${retryCount} 次)`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-1 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded font-medium whitespace-nowrap"
              >
                取消
              </button>
            </div>
          </Alert>
        )}

        {/* 錯誤提示 */}
        {error && currentStep === 'error' && (
          <Alert className="bg-red-50 border-2 border-red-300 text-red-700 font-medium">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold mb-1">❌ {error}</p>
                <p className="text-sm text-red-600">
                  {error.includes('網路') || error.includes('超時')
                    ? '請檢查網路連接，稍後重試'
                    : '請檢查輸入數據是否正確'}
                </p>
              </div>
              {retryCount < 3 && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded font-medium whitespace-nowrap ml-2"
                >
                  重試
                </button>
              )}
            </div>
          </Alert>
        )}

        {/* 表單欄位 */}
        <fieldset disabled={isSubmitting || success} className="space-y-6">
          <StudentInfoForm />
          <ToneSelector />
          <WisdomSelector />
        </fieldset>

        {/* 提交按鈕組 */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || success}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md hover:shadow-lg"
          >
            {isSubmitting
              ? `${getStepMessage().split('...')[0]}...`
              : '✨ 生成評語'}
          </button>

          {error && currentStep === 'error' && retryCount >= 3 && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setCurrentStep('idle');
                setRetryCount(0);
              }}
              className="flex-1 px-4 py-3 border-2 border-amber-300 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded-lg transition-all"
            >
              清除錯誤
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
