'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { StudentInfoForm } from './StudentInfoForm';
import { ToneSelector } from './ToneSelector';
import { WisdomSelector } from './WisdomSelector';
import { Button } from '@/components/ui/button'; // 引入黏土按鈕
import { fetchWithTimeout, retryAsync, extractErrorMessage } from '@/lib/errors';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface EvaluationFormProps {
  onSuccess?: (evaluationId: string) => void;
}

type SubmitStep = 'idle' | 'generating-prompt' | 'confirming-prompt' | 'calling-api' | 'saving' | 'success' | 'error';

export function EvaluationForm({ onSuccess }: EvaluationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState<SubmitStep>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Prompt 相關狀態
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [editablePrompt, setEditablePrompt] = useState('');
  const [pendingFormData, setPendingFormData] = useState<{
    studentName: string;
    selectedTone: string;
    selectedWisdoms: string[];
  } | null>(null);

  const methods = useForm({
    mode: 'onSubmit', // 改為 onSubmit，延遲驗證到按下按鈕時
    defaultValues: {
      studentName: '',
      selectedTone: '',
      selectedWisdoms: [],
    },
  });

  const getStepMessage = (): string => {
    switch (currentStep) {
      case 'generating-prompt': return '正在組合提示詞...';
      case 'confirming-prompt': return '等待確認提示詞...';
      case 'calling-api': return 'AI 靈感湧現中，請稍候...';
      case 'saving': return '正在保存溫暖的評語...';
      case 'success': return '✓ 生成成功！準備為您呈現...';
      default: return '';
    }
  };

  const handleRetry = async () => {
    setRetryCount((prev) => prev + 1);
    if (pendingFormData) {
      await handleConfirmPrompt(editablePrompt);
    }
  };

  // 第一步：生成 Prompt（需要驗證表單）
  const onGeneratePrompt = async (data: {
    studentName: string;
    selectedTone: string;
    selectedWisdoms: string[];
  }) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    setCurrentStep('generating-prompt');
    setRetryCount(0);
    abortControllerRef.current = new AbortController();

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
        { maxRetries: 2, delayMs: 1000 }
      );

      if (!promptResponse.ok) throw new Error('提示詞生成失敗，請檢查輸入');
      const promptData = await promptResponse.json();
      if (!promptData.success || !promptData.data?.prompt) 
        throw new Error('提示詞生成失敗，請稍後重試');
      
      const prompt = promptData.data.prompt;
      setEditablePrompt(prompt);
      setPendingFormData(data);
      setCurrentStep('confirming-prompt');
      setShowPromptDialog(true);
      setIsSubmitting(false);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('已取消生成');
      } else {
        setError(extractErrorMessage(err));
      }
      setCurrentStep('error');
      setIsSubmitting(false);
    }
  };

  // 第二步：確認 Prompt 並調用 GEMINI API
  const handleConfirmPrompt = async (prompt: string) => {
    if (!pendingFormData) return;

    setIsSubmitting(true);
    setError(null);
    setShowPromptDialog(false);
    setCurrentStep('calling-api');
    abortControllerRef.current = new AbortController();

    try {
      const evaluationResponse = await retryAsync(
        () =>
          fetchWithTimeout(`/api/evaluations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            },
            body: JSON.stringify({
              studentName: pendingFormData.studentName,
              toneId: pendingFormData.selectedTone,
              wisdomIds: pendingFormData.selectedWisdoms,
              prompt,
            }),
            timeout: 120000,
            signal: abortControllerRef.current!.signal,
          }),
        { maxRetries: 2, delayMs: 2000 }
      );

      if (!evaluationResponse.ok) throw new Error(`API 錯誤`);
      const result = await evaluationResponse.json();
      if (!result.success || !result.data?.id) 
        throw new Error(result.error || '評語生成失敗');

      setCurrentStep('success');
      setSuccess(true);
      methods.reset();
      setPendingFormData(null);

      setTimeout(() => {
        if (onSuccess) onSuccess(result.data.id);
        else router.push(`/dashboard/evaluation/${result.data.id}`);
      }, 1500);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('已取消生成');
      } else {
        setError(extractErrorMessage(err));
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
    setError('已中斷生成過程');
  };

  const handleClosePromptDialog = () => {
    setShowPromptDialog(false);
    setCurrentStep('idle');
    setIsSubmitting(false);
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onGeneratePrompt)} className="space-y-8 max-w-2xl mx-auto">
          
          {/* 狀態提示區塊 (改為無邊框黏土風格) */}
          {success && (
            <div className="p-5 bg-green-50 rounded-[20px] shadow-clay-pressed text-emerald-600 font-bold flex items-center gap-3">
              <span className="text-xl">✨</span> {getStepMessage()}
            </div>
          )}

          {isSubmitting && currentStep !== 'idle' && currentStep !== 'confirming-prompt' && (
            <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-[20px] shadow-clay-pressed text-clay-accent flex items-center justify-between">
              <div>
                <p className="font-bold text-lg mb-1 flex items-center gap-2">
                  <span className="animate-spin text-xl">⏳</span> {getStepMessage()}
                </p>
                {retryCount > 0 && <p className="text-sm font-medium opacity-80">(正在進行第 {retryCount} 次重試)</p>}
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={handleCancel}>
                中斷
              </Button>
            </div>
          )}

          {error && currentStep === 'error' && (
            <div className="p-5 bg-pink-50 rounded-[20px] shadow-clay-pressed text-clay-secondary flex items-center justify-between">
              <div>
                <p className="font-bold text-lg mb-1">❌ {error}</p>
                <p className="text-sm font-medium opacity-80">請稍後再試，或檢查輸入內容。</p>
              </div>
              {retryCount < 3 && (
                <Button type="button" variant="destructive" size="sm" onClick={handleRetry}>
                  重試
                </Button>
              )}
            </div>
          )}

          {/* 表單欄位群組 */}
          <fieldset disabled={isSubmitting || success} className="space-y-8">
            <StudentInfoForm />
            <ToneSelector />
            <WisdomSelector />
          </fieldset>

          {/* 提交按鈕區域 */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || success}
              className="flex-1 text-lg"
              size="lg"
            >
              {isSubmitting ? `${getStepMessage().split('...')[0]}...` : '✨ 立即生成評語'}
            </Button>

            {error && currentStep === 'error' && retryCount >= 3 && (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => {
                  setError(null);
                  setCurrentStep('idle');
                  setRetryCount(0);
                }}
              >
                清除錯誤
              </Button>
            )}
          </div>
        </form>
      </FormProvider>

      {/* Prompt 預覽和編輯對話框 */}
      <Dialog open={showPromptDialog} onOpenChange={handleClosePromptDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">確認提示詞</DialogTitle>
            <DialogDescription>
              請檢查下方生成的提示詞。您可以修改它以獲得更滿意的評語結果。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-6">
            <label className="block">
              <span className="text-sm font-bold text-clay-foreground mb-2 block">生成的提示詞</span>
              <Textarea
                value={editablePrompt}
                onChange={(e) => setEditablePrompt(e.target.value)}
                placeholder="提示詞內容..."
                rows={12}
                className="font-mono text-sm resize-none rounded-[12px]"
              />
              <p className="text-xs text-clay-muted mt-2">
                💡 提示：您可以編輯上方的提示詞以調整評語的風格或內容
              </p>
            </label>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClosePromptDialog}
            >
              返回修改
            </Button>
            <Button
              type="button"
              onClick={() => handleConfirmPrompt(editablePrompt)}
              disabled={!editablePrompt.trim()}
              className="text-lg"
            >
              ✨ 確認並生成評語
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}