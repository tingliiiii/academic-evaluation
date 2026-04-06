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
        <Label>選擇箴言 (可多選)</Label>
        <Card className="p-4">
          <p className="text-sm text-gray-500">載入中...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label>選擇箴言 (可多選)</Label>
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-600">{error}</p>
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
          <Label>選擇箴言 (可多選)</Label>
          <Card className="p-4 space-y-3">
            {wisdoms.map((wisdom) => (
              <label
                key={wisdom.id}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition"
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
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{wisdom.id}</p>
                  {wisdom.content && (
                    <p className="text-xs text-gray-500">{wisdom.content}</p>
                  )}
                </div>
              </label>
            ))}
          </Card>
          {errors.selectedWisdoms && (
            <p className="text-sm text-red-500">
              {typeof errors.selectedWisdoms.message === 'string'
                ? errors.selectedWisdoms.message
                : '箴言選擇有誤'}
            </p>
          )}
        </div>
      )}
    />
  );
}