'use client';

import { Card } from '@/components/ui/card';
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
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">
              📋 生成的提示詞
            </h3>
            {studentName && (
              <p className="text-sm text-blue-700 mb-2">
                學生: <span className="font-medium">{studentName}</span>
              </p>
            )}
            <p className="text-sm text-blue-700 line-clamp-3">
              {promptContent}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="whitespace-nowrap"
            >
              {isCopied ? '✓ 已複製' : '📋 複製'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="whitespace-nowrap"
            >
              👁 查看全部
            </Button>
          </div>
        </div>
      </Card>

      {/* 全文顯示對話框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>完整提示詞</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {studentName && (
              <div>
                <p className="text-sm font-semibold text-gray-600">學生名稱</p>
                <p className="text-base text-gray-900">{studentName}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">提示詞內容</p>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap">
                {promptContent}
              </div>
            </div>
            <Button
              onClick={handleCopy}
              className="w-full"
            >
              {isCopied ? '✓ 已複製' : '📋 複製提示詞'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
