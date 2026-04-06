'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert } from '@/components/ui/alert';

interface EvaluationResultProps {
  studentName: string;
  toneName: string;
  content: string;
  createdAt?: string;
  evaluationId?: string;
  onDelete?: (id: string) => Promise<void>;
  onClose?: () => void;
}

export function EvaluationResult({
  studentName,
  toneName,
  content,
  createdAt,
  evaluationId,
  onDelete,
  onClose,
}: EvaluationResultProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setDeleteError('複製失敗，請重試');
    }
  };

  const handleExport = () => {
    // 生成可下載的文字檔案
    const element = document.createElement('a');
    const file = new Blob([
      `學生姓名：${studentName}\n語氣：${toneName}\n${createdAt ? `生成時間：${createdAt}\n` : ''}---\n\n${content}`,
    ], { type: 'text/plain;charset=utf-8' });
    
    element.href = URL.createObjectURL(file);
    element.download = `評語_${studentName}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setIsExporting(false);
  };

  const handleDelete = async () => {
    if (!evaluationId || !onDelete) return;

    try {
      setDeleteError(null);
      await onDelete(evaluationId);
      setShowDeleteConfirm(false);
      onClose?.();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : '刪除失敗');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {/* 頭部資訊 */}
      <Card className="p-6 bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 shadow-md">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-amber-950">
                👤 {studentName}
              </h2>
              <p className="text-sm text-amber-900 mt-1">
                🎭 語氣：<span className="font-bold">{toneName}</span>
              </p>
              {createdAt && (
                <p className="text-xs text-amber-800 mt-1 font-medium">
                  ⏰ 生成時間：{formatDate(createdAt)}
                </p>
              )}
            </div>
            <div className="text-4xl">✨</div>
          </div>
        </div>
      </Card>

      {/* 評語內容 */}
      <Card className="p-6 bg-white border-2 border-amber-200 shadow-md">
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-amber-900 leading-relaxed font-medium">
          {content}
        </div>
      </Card>

      {/* 操作按鈕 */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleCopy}
          className="flex-1 min-w-[120px] px-4 py-2 border-2 border-amber-300 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded-lg transition-all"
        >
          {isCopied ? '✓ 已複製' : '📋 複製'}
        </button>
        <button
          onClick={() => setIsExporting(true)}
          className="flex-1 min-w-[120px] px-4 py-2 border-2 border-amber-300 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded-lg transition-all"
        >
          💾 匯出
        </button>
        {evaluationId && onDelete && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 min-w-[120px] px-4 py-2 border-2 border-red-300 bg-white hover:bg-red-50 text-red-600 font-bold rounded-lg transition-all"
          >
            🗑️ 刪除
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="flex-1 min-w-[120px] px-4 py-2 border-2 border-amber-300 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded-lg transition-all"
          >
            ← 返回
          </button>
        )}
      </div>

      {/* 匯出確認對話框 */}
      <Dialog open={isExporting} onOpenChange={setIsExporting}>
        <DialogContent className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
          <DialogHeader>
            <DialogTitle className="text-amber-900 text-xl font-bold">
              💾 確認匯出
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-amber-800 mb-4 font-medium">
            評語將被匯出為文字檔案。檔案名稱為：
            <br />
            <code className="bg-white px-2 py-1 rounded mt-2 block border border-amber-200 text-amber-950 font-bold">
              評語_{studentName}_{new Date().toISOString().split('T')[0]}.txt
            </code>
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all"
            >
              確認匯出
            </button>
            <button
              onClick={() => setIsExporting(false)}
              className="flex-1 px-4 py-2 border-2 border-amber-300 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded-lg transition-all"
            >
              取消
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 刪除確認對話框 */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300">
          <DialogHeader>
            <DialogTitle className="text-red-900 text-xl font-bold">
              🗑️ 確認刪除
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {deleteError && (
              <Alert className="bg-red-100 border-2 border-red-300 text-red-700 font-bold">
                ❌ {deleteError}
              </Alert>
            )}
            <p className="text-sm text-red-800 font-medium">
              您確定要刪除 <span className="font-bold">{studentName}</span> 的評語嗎？
              <br />
              此操作無法撤銷。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border-2 border-red-300 bg-white hover:bg-red-50 text-red-700 font-bold rounded-lg transition-all"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all"
              >
                是的，刪除
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
