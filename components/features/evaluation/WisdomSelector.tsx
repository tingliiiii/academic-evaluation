'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { useFetchWisdoms } from '@/lib/hooks';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export function WisdomSelector() {
  const { control, formState: { errors } } = useFormContext();
  const { wisdoms, loading, error } = useFetchWisdoms();

  if (loading) {
    return (
      <div className="space-y-2">
        <Label className="text-amber-900 font-bold">
          📚 選擇箴言 (可多選)
        </Label>
        <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
          <p className="text-sm text-amber-700 font-medium">⏳ 載入中...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label className="text-amber-900 font-bold">
          📚 選擇箴言 (可多選)
        </Label>
        <Card className="p-4 border-2 border-red-300 bg-red-50">
          <p className="text-sm text-red-700 font-medium">❌ {error}</p>
        </Card>
      </div>
    );
  }

  return (
    <Controller
      name="selectedWisdoms"
      control={control}
      rules={{
        validate: (value) => {
          if (!value || value.length === 0) {
            return '至少需選擇一個箴言';
          }
          return true;
        },
      }}
      render={({ field }) => (
        <div className="space-y-3">
          <Label className="text-amber-900 font-bold">
            📚 選擇箴言 (可多選)
          </Label>
          <Card className="p-4 space-y-3 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-amber-200">
            {wisdoms.map((wisdom) => (
              <label
                key={wisdom.id}
                className="flex items-center gap-3 cursor-pointer hover:bg-white p-3 rounded-lg transition border-2 border-transparent hover:border-amber-200"
              >
                <input
                  type="checkbox"
                  checked={field.value?.includes(wisdom.id) || false}
                  onChange={(e) => {
                    const current = field.value || [];
                    const updated = e.target.checked
                      ? [...current, wisdom.id]
                      : current.filter((id: string) => id !== wisdom.id);
                    field.onChange(updated);
                  }}
                  className="w-4 h-4 rounded border-amber-300 cursor-pointer accent-amber-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-amber-900">{wisdom.id}</p>
                  {wisdom.content && (
                    <p className="text-xs text-amber-700">{wisdom.content}</p>
                  )}
                </div>
              </label>
            ))}
          </Card>
          {errors.selectedWisdoms && (
            <p className="text-sm text-red-600 font-medium">
              ❌ {typeof errors.selectedWisdoms.message === 'string'
                ? errors.selectedWisdoms.message
                : '箴言選擇有誤'}
            </p>
          )}
        </div>
      )}
    />
  );
}