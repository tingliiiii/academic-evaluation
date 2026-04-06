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
        <Label>選擇箴言（多選）</Label>
        <div className="h-32 rounded-[24px] bg-[#EFEBF5] shadow-clay-pressed flex items-center justify-center">
          <p className="text-sm text-clay-muted font-bold tracking-wide">⏳ 載入箴言庫...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <Label>選擇箴言（多選）</Label>
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
          if (!value || value.length === 0) return '至少需選擇一個箴言';
          return true;
        },
      }}
      render={({ field }) => (
        <div className="space-y-4">
          <Label>選擇箴言（多選）</Label>
          
          {/* 裝載選項的微凹槽底盤 */}
          <div className="p-4 sm:p-6 rounded-[32px] bg-[#F4F1FA] shadow-clay-pressed space-y-4">
            {wisdoms.map((wisdom) => {
              const isChecked = field.value?.includes(wisdom.id) || false;
              
              return (
                <label
                  key={wisdom.id}
                  className={`flex items-center gap-4 cursor-pointer p-5 rounded-[20px] transition-all duration-300 select-none ${
                    isChecked
                      ? 'bg-[#EFEBF5] shadow-clay-pressed scale-[0.98]' // 選中時凹陷並稍微縮小
                      : 'bg-white shadow-clay-btn hover:-translate-y-1 hover:shadow-clay-btn-hover' // 未選時浮起
                  }`}
                >
                  {/* 隱藏原生 checkbox */}
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
                  
                  {/* 自訂的黏土核取圓圈 */}
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 transition-all duration-300 flex items-center justify-center ${
                    isChecked ? 'bg-clay-accent shadow-inner' : 'bg-[#EFEBF5] shadow-clay-pressed'
                  }`}>
                    {isChecked && <div className="w-2.5 h-2.5 bg-white rounded-full animate-in zoom-in" />}
                  </div>

                  <div className="flex-1">
                    <p className={`text-base font-bold transition-colors ${isChecked ? 'text-clay-accent' : 'text-clay-foreground'}`}>
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
                : '箴言選擇有誤'}
            </p>
          )}
        </div>
      )}
    />
  );
}