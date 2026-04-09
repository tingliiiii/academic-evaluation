'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface EvaluationResultProps {
  studentName: string;
  toneName: string;
  wisdoms: string;
  content: string;
  createdAt?: string;
  evaluationId?: string;
  onDelete?: (id: string) => Promise<void>;
  onClose?: () => void;
}

export function EvaluationResult({
  studentName,
  toneName,
  wisdoms,
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
    const element = document.createElement('a');
    const file = new Blob([
      `學生姓名：${studentName}
      \n語氣：${toneName}
      \n形容詞：${wisdoms}
      \n${createdAt ? `生成時間：${createdAt}
      \n` : ''}---\n\n${content}`,
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
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      {/* 頭部資訊：凹陷設計 */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-[#EFEBF5] shadow-clay-pressed">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-3xl font-heading font-black text-clay-foreground mb-4">
              {studentName}
            </h2>
            <p className="text-sm text-clay-muted">
              語氣：<span className="font-bold text-clay-accent">{toneName}</span>
            </p>
            <p className="text-sm text-clay-muted">
              形容詞：<span className="font-bold text-clay-accent">{wisdoms}</span>
            </p>
            {createdAt && (
              <p className="text-sm text-clay-muted tracking-wide">
                生成時間：{formatDate(createdAt)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 評語內容：浮起毛玻璃卡片 */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-white/80 backdrop-blur-xl shadow-clay-card transition-all duration-500 hover:-translate-y-2">
        <div className="whitespace-pre-wrap text-clay-foreground text-lg leading-relaxed font-medium">
          {content}
        </div>
      </div>

      {/* 操作按鈕群 */}
      <div className="flex gap-3 flex-wrap pt-2">
        <Button onClick={handleCopy} variant={isCopied ? "default" : "secondary"} className="flex-1 min-w-[120px]">
          {isCopied ? '已複製' : '複製評語'}
        </Button>
        <Button onClick={() => setIsExporting(true)} variant="secondary" className="flex-1 min-w-[120px]">
          匯出檔案
        </Button>
        {evaluationId && onDelete && (
          <Button onClick={() => setShowDeleteConfirm(true)} variant="destructive" className="flex-1 min-w-[120px]">
            刪除
          </Button>
        )}
      </div>

      {/* 匯出確認對話框 */}
      <Dialog open={isExporting} onOpenChange={setIsExporting}>
        <DialogContent className="bg-white/90 backdrop-blur-xl border-0 shadow-clay-card rounded-[32px] sm:rounded-[40px] p-8">
          <DialogHeader>
            <DialogTitle className="text-clay-foreground text-2xl font-black font-heading">
              確認匯出
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-2">
            <p className="text-base text-clay-muted font-medium">
              評語將被匯出為文字檔案。檔案名稱為：
            </p>
            <div className="p-4 bg-[#EFEBF5] rounded-[16px] shadow-clay-pressed text-clay-foreground font-bold break-all">
              評語_{studentName}_{new Date().toISOString().split('T')[0]}.txt
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleExport} className="flex-1">確認匯出</Button>
              <Button onClick={() => setIsExporting(false)} variant="secondary" className="flex-1">取消</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 刪除確認對話框 */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-white/90 backdrop-blur-xl border-0 shadow-clay-card rounded-[32px] sm:rounded-[40px] p-8">
          <DialogHeader>
            <DialogTitle className="text-clay-secondary text-2xl font-black font-heading">
              確認刪除
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-2">
            {deleteError && (
              <div className="p-4 bg-pink-50 rounded-[16px] text-clay-secondary font-bold">
                ❌ {deleteError}
              </div>
            )}
            <p className="text-lg text-clay-foreground font-medium">
              確定要刪除 <span className="font-bold text-clay-accent">{studentName}</span> 的評語嗎？<br/>
            </p>
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setShowDeleteConfirm(false)} variant="secondary" className="flex-1">
                保留
              </Button>
              <Button onClick={handleDelete} variant="destructive" className="flex-1">
                是的，刪除
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}