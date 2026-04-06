'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

interface PromptPreviewProps {
  promptContent: string;
  studentName?: string;
}

export function PromptPreview({ promptContent, studentName }: PromptPreviewProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(promptContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      <div className="p-6 rounded-[24px] bg-[#EFEBF5] shadow-clay-pressed">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-clay-foreground mb-2 flex items-center gap-2">
              <span>🤖</span> AI 提示詞預覽
            </h3>
            {studentName && (
              <p className="text-sm text-clay-muted font-bold mb-2">
                目標對象: <span className="text-clay-accent">{studentName}</span>
              </p>
            )}
            <p className="text-sm text-clay-muted/80 font-medium line-clamp-2">
              {promptContent}
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="secondary" size="sm" onClick={handleCopy} className="flex-1 sm:flex-none">
              {isCopied ? '✓ 已複製' : '📋 複製'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsDialogOpen(true)} className="flex-1 sm:flex-none">
              👁 展開
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white/90 backdrop-blur-xl border-0 shadow-clay-card rounded-[32px] max-w-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-clay-foreground font-heading font-black text-2xl">
              完整提示詞 (Prompt)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-2">
            <div className="p-5 bg-[#EFEBF5] rounded-[20px] shadow-clay-pressed max-h-[50vh] overflow-y-auto">
              <p className="text-sm font-medium text-clay-foreground whitespace-pre-wrap leading-relaxed">
                {promptContent}
              </p>
            </div>
            <Button onClick={handleCopy} className="w-full">
              {isCopied ? '✓ 已成功複製提示詞' : '📋 複製提示詞'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}