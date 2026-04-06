'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { extractErrorMessage } from '@/lib/errors';

// ... (介面定義保持不變)
interface Evaluation {
  id: string;
  studentName: string;
  toneName: string;
  wisdoms: string[];
  createdAt: string;
}
interface EvaluationHistoryProps { limit?: number; showPagination?: boolean; }

export function EvaluationHistory({ limit = 10, showPagination = true }: EvaluationHistoryProps) {
  // ... (State 與 fetch 邏輯完全保持不變)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFetchEvaluations = useCallback(async () => {
    setLoading(true); setError(null); setSuccessMessage(null);
    try {
      const response = await fetch(`/api/evaluations?page=${page}&limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
      });
      if (!response.ok) throw new Error(response.status === 401 ? '認證失敗' : '無法載入');
      const data = await response.json();
      setEvaluations(data.data?.items || []);
    } catch (err) { setError(extractErrorMessage(err)); } 
    finally { setLoading(false); }
  }, [page, limit]);

  useEffect(() => { handleFetchEvaluations(); }, [handleFetchEvaluations]);

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此評語嗎？')) return;
    setDeleting(id);
    try {
      const response = await fetch(`/api/evaluations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
      });
      if (!response.ok) throw new Error('刪除失敗');
      setSuccessMessage('評語已成功刪除');
      setSelectedEvaluation(null);
      setTimeout(() => { setPage(1); handleFetchEvaluations(); }, 500);
    } catch (err) { 
      console.error('Error deleting evaluation:', err);
     } 
    finally { setDeleting(null); }
  };

  if (loading) {
    return (
      <div className="p-12 rounded-[40px] bg-white/70 backdrop-blur-xl shadow-clay-card text-center">
        <span className="text-4xl animate-spin inline-block mb-4">⏳</span>
        <p className="text-clay-muted font-bold text-lg">讀取歷史紀錄中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-[32px] bg-pink-50 shadow-clay-pressed text-center space-y-4">
        <p className="font-bold text-clay-secondary text-lg">❌ {error}</p>
        <Button onClick={() => handleFetchEvaluations()} variant="secondary">重新嘗試</Button>
      </div>
    );
  }

  if (!evaluations.length) {
    return (
      <div className="p-12 rounded-[40px] bg-white/70 backdrop-blur-xl shadow-clay-card text-center">
        <p className="text-5xl mb-4">📭</p>
        <p className="text-clay-foreground font-black font-heading text-2xl mb-2">還沒有評語記錄</p>
        <p className="text-clay-muted font-medium">生成第一份評語後，它將顯示在此處</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-600 font-bold rounded-[20px] shadow-clay-pressed">
          ✨ {successMessage}
        </div>
      )}
      
      <div className="bg-white/80 backdrop-blur-xl rounded-[32px] sm:rounded-[40px] shadow-clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#EFEBF5] border-b-0 hover:bg-[#EFEBF5]">
                <TableHead className="text-clay-muted font-bold py-5">學生姓名</TableHead>
                <TableHead className="text-clay-muted font-bold">語氣</TableHead>
                <TableHead className="text-clay-muted font-bold">生成時間</TableHead>
                <TableHead className="text-right text-clay-muted font-bold px-6">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.map((evaluation) => (
                <TableRow key={evaluation.id} className="border-b border-clay-muted/10 hover:bg-clay-accent/5 transition-colors">
                  <TableCell className="font-bold text-clay-foreground py-4">
                    {evaluation.studentName}
                  </TableCell>
                  <TableCell className="font-medium text-clay-muted">
                    {evaluation.toneName}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-clay-muted/80">
                    {new Date(evaluation.createdAt).toLocaleDateString('zh-TW', {
                      month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell className="text-right space-x-2 px-6">
                    <Button
                      variant="secondary" size="sm"
                      onClick={() => setSelectedEvaluation(evaluation)}
                      disabled={deleting === evaluation.id}
                    >
                      查看
                    </Button>
                    <Button
                      variant="destructive" size="sm"
                      onClick={() => handleDelete(evaluation.id)}
                      disabled={deleting === evaluation.id}
                    >
                      {deleting === evaluation.id ? '中...' : '刪除'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {showPagination && (
          <div className="flex justify-between items-center p-6 bg-white/50 border-t border-clay-muted/10">
            <span className="text-sm text-clay-muted font-bold">
              第 {page} 頁 (本頁 {evaluations.length} 項)
            </span>
            <div className="space-x-3">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                ← 上一頁
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={evaluations.length < limit}>
                下一頁 →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 詳情對話框 */}
      {selectedEvaluation && (
        <Dialog open={!!selectedEvaluation} onOpenChange={() => setSelectedEvaluation(null)}>
          <DialogContent className="bg-white/90 backdrop-blur-xl border-0 shadow-clay-card rounded-[32px] sm:rounded-[40px] p-8 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-clay-foreground text-2xl font-black font-heading mb-1">
                評語紀錄詳情
              </DialogTitle>
              <DialogDescription className="text-clay-muted font-bold text-base">
                {selectedEvaluation.studentName} · <span className="text-clay-accent">{selectedEvaluation.toneName}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="p-5 bg-[#EFEBF5] rounded-[20px] shadow-clay-pressed">
                <p className="text-sm font-bold text-clay-muted mb-3">套用箴言</p>
                <div className="flex flex-wrap gap-2">
                  {selectedEvaluation.wisdoms.map(w => (
                    <span key={w} className="px-3 py-1.5 bg-white shadow-sm rounded-full text-sm font-bold text-clay-accent">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-clay-muted font-medium tracking-wide">
                生成時間: {new Date(selectedEvaluation.createdAt).toLocaleString('zh-TW')}
              </p>
              <div className="flex gap-3 pt-2">
                <Button className="flex-1" onClick={() => window.location.href = `/dashboard/evaluation/${selectedEvaluation.id}`}>
                  開啟完整評語
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => { handleDelete(selectedEvaluation.id); setSelectedEvaluation(null); }} disabled={deleting === selectedEvaluation.id}>
                  刪除紀錄
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}