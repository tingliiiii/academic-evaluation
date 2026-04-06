'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { extractErrorMessage } from '@/lib/errors';

interface Tone { id: string; name: string; description?: string; createdAt?: string; }

export function ToneManager() {
  const [tones, setTones] = useState<Tone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTones = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await fetch('/api/admin/tones', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
      });
      if (!response.ok) throw new Error(response.status === 401 ? '認證失敗' : '無法載入');
      const data = await response.json();
      setTones(data.data || []);
    } catch (err) { setError(extractErrorMessage(err)); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTones(); }, [fetchTones]);

  const handleOpenDialog = (mode: 'create' | 'edit', tone?: Tone) => {
    setDialogMode(mode);
    if (mode === 'edit' && tone) {
      setEditingId(tone.id); setFormData({ name: tone.name, description: tone.description || '' });
    } else {
      setEditingId(null); setFormData({ name: '', description: '' });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => { setShowDialog(false); setFormData({ name: '', description: '' }); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true); setError(null);
    try {
      const url = dialogMode === 'create' ? '/api/admin/tones' : `/api/admin/tones/${editingId}`;
      const response = await fetch(url, {
        method: dialogMode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error(dialogMode === 'create' ? '建立失敗' : '更新失敗');
      setSuccessMessage(dialogMode === 'create' ? '語氣建立成功' : '語氣更新成功');
      handleCloseDialog();
      setTimeout(() => { setSuccessMessage(null); fetchTones(); }, 1500);
    } catch (err) { setError(extractErrorMessage(err)); } 
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true); setError(null);
    try {
      const response = await fetch(`/api/admin/tones/${deletingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
      });
      if (!response.ok) throw new Error('刪除失敗');
      setSuccessMessage('語氣已刪除');
      setShowDeleteConfirm(false); setDeletingId(null);
      setTimeout(() => { setSuccessMessage(null); fetchTones(); }, 1500);
    } catch (err) { setError(extractErrorMessage(err)); } 
    finally { setIsSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="p-12 rounded-[32px] bg-white/70 backdrop-blur-xl shadow-clay-card text-center">
        <p className="text-clay-muted font-bold text-lg flex items-center justify-center gap-2">
          <span className="animate-spin text-2xl">⏳</span> 載入語氣列表中...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 消息提示 */}
      {error && (
        <div className="p-4 bg-pink-50 rounded-[20px] shadow-clay-pressed text-clay-secondary font-bold">
          ❌ {error}
        </div>
      )}
      {successMessage && (
        <div className="p-4 bg-emerald-50 rounded-[20px] shadow-clay-pressed text-emerald-600 font-bold">
          ✨ {successMessage}
        </div>
      )}

      {/* 頂部操作欄 */}
      <div className="flex justify-between items-center bg-[#EFEBF5] p-5 rounded-[24px] shadow-clay-pressed">
        <div>
          <h2 className="text-xl font-heading font-black text-clay-foreground">語氣風格列表</h2>
          <p className="text-sm text-clay-muted font-medium mt-1">目前共有 {tones.length} 種設定</p>
        </div>
        <Button onClick={() => handleOpenDialog('create')}>+ 新增語氣</Button>
      </div>

      {/* 語氣列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tones.map((tone) => (
          <div key={tone.id} className="p-6 rounded-[24px] bg-white/80 backdrop-blur-xl border-0 shadow-clay-card hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            <div className="flex-1 mb-6">
              <h3 className="text-xl font-heading font-black text-clay-foreground mb-2">{tone.name}</h3>
              {tone.description && (
                <p className="text-base text-clay-muted font-medium">{tone.description}</p>
              )}
            </div>
            <div className="flex gap-3 pt-4 border-t border-clay-muted/10">
              <Button variant="secondary" size="sm" onClick={() => handleOpenDialog('edit', tone)} className="flex-1">
                編輯
              </Button>
              <Button variant="destructive" size="sm" onClick={() => { setDeletingId(tone.id); setShowDeleteConfirm(true); }} className="flex-1">
                刪除
              </Button>
            </div>
          </div>
        ))}
      </div>

      {tones.length === 0 && !error && (
        <div className="p-12 text-center bg-white/70 backdrop-blur-xl rounded-[32px] shadow-clay-card">
          <p className="text-clay-muted font-bold text-lg mb-6">目前還沒有設定任何語氣</p>
          <Button onClick={() => handleOpenDialog('create')}>+ 建立第一個語氣</Button>
        </div>
      )}

      {/* 建立/編輯對話框 */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-white/90 backdrop-blur-xl border-0 shadow-clay-card rounded-[32px] p-8 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-black text-clay-foreground mb-2">
              {dialogMode === 'create' ? '✨ 新增語氣' : '📝 編輯語氣'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            <div className="space-y-2">
              <label className="block text-base font-bold text-clay-foreground pl-2">語氣名稱 *</label>
              <Input
                type="text" maxLength={20} required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：熱情風格" disabled={isSubmitting}
              />
              <p className="text-xs text-clay-muted font-medium pl-2 text-right">{formData.name.length}/20 字</p>
            </div>
            <div className="space-y-2">
              <label className="block text-base font-bold text-clay-foreground pl-2">風格描述</label>
              <Input
                type="text" maxLength={100}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="例如：充滿熱情與正能量" disabled={isSubmitting}
              />
              <p className="text-xs text-clay-muted font-medium pl-2 text-right">{formData.description.length}/100 字</p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={handleCloseDialog} disabled={isSubmitting} className="flex-1">
                取消
              </Button>
              <Button type="submit" disabled={!formData.name.trim() || isSubmitting} className="flex-1">
                {isSubmitting ? '處理中...' : '確認儲存'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 刪除確認對話框 */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-white/90 backdrop-blur-xl border-0 shadow-clay-card rounded-[32px] p-8 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-black text-clay-secondary mb-2">
              🗑️ 確認刪除
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-2">
            <p className="text-base text-clay-foreground font-medium">
              確定要刪除語氣 <span className="font-bold text-clay-accent">「{tones.find((t) => t.id === deletingId)?.name}」</span> 嗎？<br /><br />此操作無法復原。
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} disabled={isSubmitting} className="flex-1">
                保留
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? '刪除中...' : '是的，刪除'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}