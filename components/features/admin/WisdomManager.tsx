'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert } from '@/components/ui/alert';
import { extractErrorMessage } from '@/lib/errors';

interface Wisdom {
  id: string;
  content: string;
  description?: string;
  createdAt?: string;
}

export function WisdomManager() {
  const [wisdoms, setWisdoms] = useState<Wisdom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 表單狀態
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ content: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 刪除確認
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 獲取箴言列表
  const fetchWisdoms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/wisdoms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('認證失敗，請重新登入');
        }
        throw new Error('無法載入箴言列表');
      }

      const data = await response.json();
      setWisdoms(data.data || []);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWisdoms();
  }, [fetchWisdoms]);

  // 開啟建立/編輯對話框
  const handleOpenDialog = (mode: 'create' | 'edit', wisdom?: Wisdom) => {
    setDialogMode(mode);
    if (mode === 'edit' && wisdom) {
      setEditingId(wisdom.id);
      setFormData({ content: wisdom.content, description: wisdom.description || '' });
    } else {
      setEditingId(null);
      setFormData({ content: '', description: '' });
    }
    setShowDialog(true);
  };

  // 關閉對話框
  const handleCloseDialog = () => {
    setShowDialog(false);
    setFormData({ content: '', description: '' });
  };

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const method = dialogMode === 'create' ? 'POST' : 'PATCH';
      const url = dialogMode === 'create' ? '/api/admin/wisdoms' : `/api/admin/wisdoms/${editingId}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('認證失敗，請重新登入');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || (dialogMode === 'create' ? '建立失敗' : '更新失敗'));
      }

      setSuccessMessage(
        dialogMode === 'create' ? '箴言建立成功' : '箴言更新成功'
      );
      handleCloseDialog();

      // 重新載入列表
      setTimeout(() => {
        setSuccessMessage(null);
        fetchWisdoms();
      }, 1500);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 刪除箴言
  const handleDelete = async () => {
    if (!deletingId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/wisdoms/${deletingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('認證失敗，請重新登入');
        }
        throw new Error('刪除失敗');
      }

      setSuccessMessage('箴言已刪除');
      setShowDeleteConfirm(false);
      setDeletingId(null);

      // 重新載入列表
      setTimeout(() => {
        setSuccessMessage(null);
        fetchWisdoms();
      }, 1500);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 載入中
  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-gray-500">載入箴言列表中...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 消息提示 */}
      {error && (
        <Alert className="bg-red-50 border-red-200 text-red-700">
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200 text-green-700">
          ✓ {successMessage}
        </Alert>
      )}

      {/* 頂部操作欄 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">四字箴言管理</h2>
          <p className="text-sm text-gray-500">{wisdoms.length} 個箴言</p>
        </div>
        <Button onClick={() => handleOpenDialog('create')}>
          + 新增箴言
        </Button>
      </div>

      {/* 箴言列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {wisdoms.map((wisdom) => (
          <Card key={wisdom.id} className="p-4 hover:shadow-md transition">
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{wisdom.content}</h3>
                {wisdom.description && (
                  <p className="text-sm text-gray-600 mt-1">{wisdom.description}</p>
                )}
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog('edit', wisdom)}
                  className="flex-1"
                >
                  編輯
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDeletingId(wisdom.id);
                    setShowDeleteConfirm(true);
                  }}
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  刪除
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {wisdoms.length === 0 && !error && (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">還沒有箴言</p>
          <Button onClick={() => handleOpenDialog('create')}>
            + 新增箴言
          </Button>
        </Card>
      )}

      {/* 建立/編輯對話框 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create' ? '新增箴言' : '編輯箴言'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                箴言內容 *
              </label>
              <Input
                type="text"
                maxLength={20}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="例如：品德高尚"
                disabled={isSubmitting}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.content.length}/20 字
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                說明描述
              </label>
              <Input
                type="text"
                maxLength={100}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="例如：表示品德修養高尚"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/100 字
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={!formData.content.trim() || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? '処理中...' : '確認'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 刪除確認對話框 */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 mb-4">
            您確定要刪除箴言「{wisdoms.find((w) => w.id === deletingId)?.content}」嗎？
            <br />
            此操作無法撤銷。
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? '刪除中...' : '刪除'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
