'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert } from '@/components/ui/alert';
import { extractErrorMessage } from '@/lib/errors';

interface Evaluation {
  id: string;
  studentName: string;
  toneName: string;
  wisdoms: string[];
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
    if (!confirm('確定要刪除此評語嗎？')) return;

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
      <Card className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <svg
              className="w-6 h-6 text-amber-500"
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
          <p className="text-amber-700 font-medium">⏳ 載入評語歷史中...</p>
        </div>
      </Card>
    );
  }

  // 錯誤狀態
  if (error) {
    return (
      <Card className="p-8 bg-white border-2 border-red-300">
        <Alert className="bg-red-50 border-2 border-red-300 text-red-700 mb-4 font-medium">
          <div className="flex items-start gap-3">
            <span className="text-lg">❌</span>
            <div>
              <p className="font-bold">{error}</p>
              <p className="text-sm mt-1 text-red-600">
                {error.includes('認證') ? '請返回首頁重新登入' : '請稍後重試'}
              </p>
            </div>
          </div>
        </Alert>
        <div className="text-center">
          <button
            onClick={() => handleFetchEvaluations()}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all"
          >
            重試
          </button>
        </div>
      </Card>
    );
  }

  // 空狀態
  if (!evaluations || evaluations.length === 0) {
    return (
      <Card className="p-8 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-amber-200">
        <div className="text-center">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-amber-900 font-bold text-lg">還沒有評語記錄</p>
          <p className="text-sm text-amber-700 mt-2">生成第一份評語後，它將顯示在此處</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* 成功消息 */}
      {successMessage && (
        <Alert className="mb-4 bg-green-50 border-2 border-green-300 text-green-700 font-medium">
          ✨ {successMessage}
        </Alert>
      )}

      {/* 刪除錯誤消息 */}
      {deleteError && (
        <Alert className="mb-4 bg-red-50 border-2 border-red-300 text-red-700 font-medium">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold">❌ 刪除失敗</p>
              <p className="text-sm text-red-600">{deleteError}</p>
            </div>
            <button
              onClick={() => setDeleteError(null)}
              className="text-red-600 hover:text-red-800 font-bold"
            >
              ✕
            </button>
          </div>
        </Alert>
      )}

      {/* 評語表格 */}
      <Card className="overflow-hidden border-2 border-amber-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-amber-100 to-orange-100 border-b-2 border-amber-200">
                <TableHead className="text-amber-950 font-bold">學生姓名</TableHead>
                <TableHead className="text-amber-950 font-bold">語氣</TableHead>
                <TableHead className="text-amber-950 font-bold">生成時間</TableHead>
                <TableHead className="text-right text-amber-950 font-bold">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.map((evaluation) => (
                <TableRow
                  key={evaluation.id}
                  className={`hover:bg-amber-50 border-b border-amber-100 ${
                    deleting === evaluation.id ? 'opacity-50' : ''
                  }`}
                >
                  <TableCell className="font-medium text-amber-900">
                    {evaluation.studentName}
                  </TableCell>
                  <TableCell className="text-amber-800">
                    {evaluation.toneName}
                  </TableCell>
                  <TableCell className="text-sm text-amber-700">
                    {new Date(evaluation.createdAt).toLocaleDateString('zh-TW', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <button
                      onClick={() => setSelectedEvaluation(evaluation)}
                      disabled={deleting === evaluation.id}
                      className="px-3 py-1 border-2 border-amber-300 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded transition disabled:opacity-50"
                    >
                      查看
                    </button>
                    <button
                      onClick={() => handleDelete(evaluation.id)}
                      disabled={deleting === evaluation.id}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded transition disabled:opacity-50"
                    >
                      {deleting === evaluation.id ? '刪除中...' : '刪除'}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 分頁控件 */}
        {showPagination && (
          <div className="flex justify-between items-center p-4 border-t-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <span className="text-sm text-amber-800 font-medium">
              第 {page} 頁 (本頁 {evaluations.length} 項)
            </span>
            <div className="space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border-2 border-amber-300 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded transition disabled:opacity-50"
              >
                ← 上一頁
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={evaluations.length < limit}
                className="px-3 py-1 border-2 border-amber-300 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded transition disabled:opacity-50"
              >
                下一頁 →
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* 詳情對話框 */}
      {selectedEvaluation && (
        <Dialog open={!!selectedEvaluation} onOpenChange={() => setSelectedEvaluation(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
            <DialogHeader>
              <DialogTitle className="text-amber-900 text-2xl font-bold">
                📝 評語詳情
              </DialogTitle>
              <DialogDescription className="text-amber-700 font-medium">
                {selectedEvaluation.studentName} - {selectedEvaluation.toneName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-amber-900 mb-2">📚 箴言</p>
                <div className="text-sm text-amber-800 bg-white p-3 rounded-lg border border-amber-200">
                  {selectedEvaluation.wisdoms.join('、')}
                </div>
              </div>
              <div className="text-xs text-amber-700 font-medium">
                ⏰ 生成時間: {new Date(selectedEvaluation.createdAt).toLocaleString('zh-TW')}
              </div>

              {/* 複製成功提示 */}
              <div id="copy-notification" className="hidden text-xs text-green-600 font-bold">
                ✓ 已複製到剪貼板
              </div>

              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all"
                  onClick={() => {
                    window.location.href = `/dashboard/evaluation/${selectedEvaluation.id}`;
                  }}
                >
                  👁️ 查看詳情
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                  onClick={() => {
                    handleDelete(selectedEvaluation.id);
                    setSelectedEvaluation(null);
                  }}
                  disabled={deleting === selectedEvaluation.id}
                >
                  {deleting === selectedEvaluation.id ? '刪除中...' : '🗑️ 刪除'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
