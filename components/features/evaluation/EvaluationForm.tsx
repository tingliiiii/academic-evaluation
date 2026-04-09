'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { StudentInfoForm } from './StudentInfoForm';
import { ToneSelector } from './ToneSelector';
import { WisdomSelector } from './WisdomSelector';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { fetchWithTimeout, retryAsync, extractErrorMessage } from '@/lib/errors';

interface EvaluationFormProps {
  onSuccess?: (evaluationId: string) => void;
}

// 加入 prompt-preview 步驟
type SubmitStep = 'idle' | 'generating-prompt' | 'prompt-preview' | 'calling-api' | 'success' | 'error';

export function EvaluationForm({ onSuccess }: EvaluationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState<SubmitStep>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>(''); 
  const abortControllerRef = useRef<AbortController | null>(null);

  const methods = useForm({
    mode: 'onSubmit', // 變更為 onSubmit，按下生成按鈕後才檢查表格
    defaultValues: {
      studentName: '',
      selectedTone: '',
      selectedWisdoms: [],
    },
  });

  const getStepMessage = (): string => {
    switch (currentStep) {
      case 'generating-prompt': return '正在組合提示詞...';
      case 'calling-api': return 'AI 靈感湧現中，請稍候...';
      case 'success': return '✓ 生成成功！準備呈現...';
      default: return '';
    }
  };

  const handleRetry = async () => {
    setRetryCount((prev) => prev + 1);
    if (currentStep === 'error' && generatedPrompt) {
      handleConfirmGenerate();
    } else {
      methods.handleSubmit(onSubmit)();
    }
  };

  // 第一階段：只產生提示詞 (Prompt) 並攔截預覽
  const onSubmit = async (data: { studentName: string; selectedTone: string; selectedWisdoms: string[]; }) => {
    setIsSubmitting(true); setError(null); setSuccess(false);
    setCurrentStep('generating-prompt'); setRetryCount(0);
    abortControllerRef.current = new AbortController();

    try {
      const promptResponse = await retryAsync(() => fetchWithTimeout(`/api/prompts/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify({
          studentName: data.studentName,
          toneId: data.selectedTone,
          wisdomIds: data.selectedWisdoms,
        }),
        timeout: 30000,
        signal: abortControllerRef.current!.signal,
      }), { maxRetries: 2, delayMs: 1000 });

      if (!promptResponse.ok) throw new Error('提示詞生成失敗，請檢查輸入');
      const promptData = await promptResponse.json();
      if (!promptData.success || !promptData.data?.prompt) throw new Error('提示詞生成失敗，請稍後重試');
      
      setGeneratedPrompt(promptData.data.prompt);
      setCurrentStep('prompt-preview');
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') setError('已取消生成');
      else setError(`提示詞生成失敗: ${extractErrorMessage(err)}`);
      setCurrentStep('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 第二階段：確認提示詞後，呼叫 Gemini API
  const handleConfirmGenerate = async () => {
    setIsSubmitting(true); setError(null);
    setCurrentStep('calling-api');
    abortControllerRef.current = new AbortController();

    try {
      const data = methods.getValues();
      const evaluationResponse = await retryAsync(() => fetchWithTimeout(`/api/evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify({
          studentName: data.studentName,
          toneId: data.selectedTone,
          wisdomIds: data.selectedWisdoms,
          prompt: generatedPrompt, // 傳送可被修改過的提示詞
        }),
        timeout: 120000,
        signal: abortControllerRef.current!.signal,
      }), { maxRetries: 2, delayMs: 2000 });

      if (!evaluationResponse.ok) throw new Error(`API 錯誤`);
      const result = await evaluationResponse.json();
      if (!result.success || !result.data?.id) throw new Error(result.error || '評語生成失敗');

      setCurrentStep('success'); setSuccess(true);
      methods.reset(); setGeneratedPrompt('');

      setTimeout(() => {
        if (onSuccess) onSuccess(result.data.id);
        else router.push(`/dashboard/evaluation/${result.data.id}`);
      }, 1500);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') setError('已取消生成');
      else setError(extractErrorMessage(err));
      setCurrentStep('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setIsSubmitting(false); setCurrentStep('idle'); setError('已中斷生成過程');
  };

  // 渲染畫面：提示詞預覽與編輯模式
  if (currentStep === 'prompt-preview') {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="p-6 sm:p-8 bg-white/80 backdrop-blur-xl rounded-[32px] sm:rounded-[40px] shadow-clay-card animate-in fade-in zoom-in-95 duration-300">
          <div className="mb-6">
            <h2 className="text-2xl font-heading font-black text-clay-foreground mb-2 flex items-center gap-2">
              檢視與微調提示詞
            </h2>
            <p className="text-clay-muted font-medium text-sm sm:text-base">
              這是即將傳送給 Gemini AI 的指令。<br/>
              可以在此進行最後的修改，確認無誤後再點擊生成。
            </p>
          </div>
          
          <div className="p-2 bg-[#EFEBF5] rounded-[24px] shadow-clay-pressed mb-6">
            <Textarea 
              value={generatedPrompt}
              onChange={(e) => setGeneratedPrompt(e.target.value)}
              className="min-h-[280px] border-0 bg-transparent shadow-none focus:ring-0 text-clay-foreground font-medium text-base resize-y leading-relaxed"
              placeholder="提示詞內容..."
            />
          </div>
          
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setCurrentStep('idle')} disabled={isSubmitting} className="flex-1 text-base sm:text-lg">
              返回
            </Button>
            <Button onClick={handleConfirmGenerate} disabled={isSubmitting} className="flex-[2] text-base sm:text-lg">
              {isSubmitting ? '✨ 生成中...' : '確認並呼叫 AI'}
            </Button>
          </div>

          {error && (
             <div className="mt-4 p-4 bg-pink-50 rounded-[20px] shadow-clay-pressed text-clay-secondary font-bold">
               ❌ {error}
             </div>
          )}
        </div>
      </div>
    );
  }

  // 渲染畫面：一般表單模式
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
        {success && (
          <div className="p-5 bg-emerald-50 rounded-[20px] shadow-clay-pressed text-emerald-600 font-bold flex items-center gap-3">
            <span className="text-xl">✨</span> {getStepMessage()}
          </div>
        )}

        {isSubmitting && currentStep !== 'idle' && (
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
              <Button type="button" variant="destructive" size="sm" onClick={handleRetry}>重試</Button>
            )}
          </div>
        )}

        <fieldset disabled={isSubmitting || success} className="space-y-8">
          <StudentInfoForm />
          <ToneSelector />
          <WisdomSelector />
        </fieldset>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isSubmitting || success} className="flex-1 text-lg" size="lg">
            {isSubmitting ? `${getStepMessage().split('...')[0]}...` : '產生提示詞預覽'}
          </Button>

          {error && currentStep === 'error' && retryCount >= 3 && (
            <Button type="button" variant="secondary" size="lg" onClick={() => { setError(null); setCurrentStep('idle'); setRetryCount(0); }}>
              清除錯誤
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}