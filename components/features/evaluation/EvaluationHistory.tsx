'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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

  const handleFetchEvaluations = useCallback(async () => {
    setLoading(true);
    setError(null);

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
        throw new Error('無法載入評語歷史');
      }

      const data = await response.json();
      setEvaluations(data.evaluations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入失敗');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    handleFetchEvaluations();
  }, [handleFetchEvaluations]);

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此評語嗎？')) return;

    try {
      const response = await fetch(`/api/evaluations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('刪除失敗');
      }

      // 重新載入列表
      setPage(1);
      await handleFetchEvaluations();
    } catch (err) {
      setError(err instanceof Error ? err.message : '刪除失敗');
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <p className="text-center text-gray-500">載入中...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 border-red-200 bg-red-50">
        <p className="text-center text-red-600">✕ {error}</p>
      </Card>
    );
  }

  if (!evaluations || evaluations.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-center text-gray-500">
          還沒有評語記錄
        </p>
      </Card>
    );
  }

  return (
    <>
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
                <TableRow key={evaluation.id} className="hover:bg-gray-50">
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
                    >
                      查看
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(evaluation.id)}
                    >
                      刪除
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
              第 {page} 頁 (共 {evaluations.length} 項)
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
                <div className="bg-gray-50 p-4 rounded border border-gray-200 text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedEvaluation.content}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                生成時間: {new Date(selectedEvaluation.createdAt).toLocaleString('zh-TW')}
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedEvaluation.content);
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
                >
                  🗑️ 刪除
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
