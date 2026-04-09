'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { useFetchWisdoms } from '@/lib/hooks';
import { Label } from '@/components/ui/label';

export function WisdomSelector() {
  const { control, formState: { errors } } = useFormContext();
  const { wisdoms, loading, error } = useFetchWisdoms();

  if (loading) {
    return (
      <div className="space-y-3">
        <Label>選擇形容詞（多選）</Label>
        <div className="h-32 rounded-[24px] bg-[#EFEBF5] shadow-clay-pressed flex items-center justify-center">
          <p className="text-sm text-clay-muted font-bold tracking-wide">⏳ 載入形容詞庫...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <Label>選擇形容詞（多選）</Label>
        <div className="p-5 rounded-[24px] bg-pink-50 shadow-clay-pressed flex items-center justify-center">
          <p className="text-sm text-clay-secondary font-bold">❌ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <Controller
      name="selectedWisdoms"
      control={control}
      rules={{
        validate: (value) => {
          if (!value || value.length === 0) return '至少需選擇一個形容詞';
          return true;
        },
      }}
      render={({ field }) => (
        <div className="space-y-4">
          <Label>選擇形容詞（多選）</Label>
          
          <div className="space-y-4 flex flex-wrap">
            {wisdoms.map((wisdom) => {
              const isChecked = field.value?.includes(wisdom.id) || false;
              
              return (
                <label
                  key={wisdom.id}
                  className={`flex items-center m-2 cursor-pointer p-4 rounded-[20px] transition-all duration-300 select-none ${
                    isChecked
                      ? 'bg-[#EFEBF5] shadow-clay-pressed scale-[0.98]' 
                      : 'bg-white shadow-clay-btn hover:-translate-y-1 hover:shadow-clay-btn-hover' 
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    onChange={(e) => {
                      const current = field.value || [];
                      const updated = e.target.checked
                        ? [...current, wisdom.id]
                        : current.filter((id: string) => id !== wisdom.id);
                      field.onChange(updated);
                    }}
                  />
                  <div className="flex-1">
                    <p className={`font-heading font-black tracking-widest transition-colors ${isChecked ? 'text-clay-accent' : 'text-clay-foreground'}`}>
                      {wisdom.content}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
          
          {errors.selectedWisdoms && (
            <p className="text-sm text-clay-secondary font-bold px-2">
              ❌ {typeof errors.selectedWisdoms.message === 'string'
                ? errors.selectedWisdoms.message
                : '形容詞選擇有誤'}
            </p>
          )}
        </div>
      )}
    />
  );
}