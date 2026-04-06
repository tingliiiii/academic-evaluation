'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert } from '@/components/ui/alert';
import { extractErrorMessage } from '@/lib/errors';

interface Evaluation {
  id: string;
  studentName: string;
  tone: { name: string };
  content: string;
  createdAt: string;
}

interface EvaluationHistoryProps {
  limit?: number;
  showPagination?: boolean;
}

export function EvaluationHistory({ limit = 10, showPagination = true }: EvaluationHistoryProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFetchEvaluations = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `/api/evaluations?page=${page}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('認證失敗，請重新登入');
        }
        throw new Error('無法載入評語歷史');
      }

      const data = await response.json();
      setEvaluations(data.data?.items || []);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    handleFetchEvaluations();
  }, [handleFetchEvaluations]);

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此評語嗎？此操作無法撤銷。')) return;

    setDeleting(id);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/evaluations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('認證失敗，請重新登入');
        }
        if (response.status === 404) {
          throw new Error('評語不存在或已刪除');
        }
        throw new Error('刪除失敗');
      }

      setSuccessMessage('評語已成功刪除');
      setSelectedEvaluation(null);

      // 重新載入列表
      setTimeout(() => {
        setPage(1);
        handleFetchEvaluations();
      }, 500);
    } catch (err) {
      setDeleteError(extractErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  // 載入中狀態
  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <p className="text-gray-500">載入評語歷史中...</p>
        </div>
      </Card>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <Card className="p-8">
        <Alert className="bg-red-50 border-red-200 text-red-700 mb-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">✕</span>
            <div>
              <p className="font-medium">{error}</p>
              <p className="text-sm mt-1">
                {error.includes('認證') ? '請返回首頁重新登入' : '請稍後重試'}
              </p>
            </div>
          </div>
        </Alert>
        <div className="text-center">
          <Button onClick={() => handleFetchEvaluations()}>
            重試
          </Button>
        </div>
      </Card>
    );
  }

  // 空狀態
  if (!evaluations || evaluations.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-gray-500">還沒有評語記錄</p>
          <p className="text-sm text-gray-400 mt-2">生成第一份評語後，它將顯示在此處</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* 成功消息 */}
      {successMessage && (
        <Alert className="mb-4 bg-green-50 border-green-200 text-green-700">
          ✓ {successMessage}
        </Alert>
      )}

      {/* 刪除錯誤消息 */}
      {deleteError && (
        <Alert className="mb-4 bg-red-50 border-red-200 text-red-700">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">削除失敗</p>
              <p className="text-sm">{deleteError}</p>
            </div>
            <button
              onClick={() => setDeleteError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </Alert>
      )}

      {/* 評語表格 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>學生姓名</TableHead>
                <TableHead>語氣</TableHead>
                <TableHead>生成時間</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.map((evaluation) => (
                <TableRow
                  key={evaluation.id}
                  className={`hover:bg-gray-50 ${
                    deleting === evaluation.id ? 'opacity-50' : ''
                  }`}
                >
                  <TableCell className="font-medium">
                    {evaluation.studentName}
                  </TableCell>
                  <TableCell>
                    {evaluation.tone?.name || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(evaluation.createdAt).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEvaluation(evaluation)}
                      disabled={deleting === evaluation.id}
                    >
                      查看
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(evaluation.id)}
                      disabled={deleting === evaluation.id}
                    >
                      {deleting === evaluation.id ? '刪除中...' : '刪除'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 分頁控件 */}
        {showPagination && (
          <div className="flex justify-between items-center p-4 border-t">
            <span className="text-sm text-gray-500">
              第 {page} 頁 (本頁 {evaluations.length} 項)
            </span>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                ← 上一頁
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={evaluations.length < limit}
              >
                下一頁 →
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 詳情對話框 */}
      {selectedEvaluation && (
        <Dialog open={!!selectedEvaluation} onOpenChange={() => setSelectedEvaluation(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>評語詳情</DialogTitle>
              <DialogDescription>
                {selectedEvaluation.studentName} - {selectedEvaluation.tone?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">評語內容</p>
                <div className="bg-gray-50 p-4 rounded border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {selectedEvaluation.content}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                生成時間: {new Date(selectedEvaluation.createdAt).toLocaleString('zh-TW')}
              </div>

              {/* 複製成功提示 */}
              <div id="copy-notification" className="hidden text-xs text-green-600">
                ✓ 已複製到剪貼板
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedEvaluation.content);
                    // 顯示複製提示
                    const notif = document.getElementById('copy-notification');
                    if (notif) {
                      notif.classList.remove('hidden');
                      setTimeout(() => {
                        notif.classList.add('hidden');
                      }, 2000);
                    }
                  }}
                >
                  📋 複製評語
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedEvaluation.id);
                    setSelectedEvaluation(null);
                  }}
                  disabled={deleting === selectedEvaluation.id}
                >
                  {deleting === selectedEvaluation.id ? '刪除中...' : '🗑️ 刪除'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
