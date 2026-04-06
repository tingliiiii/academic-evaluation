'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { useFetchTones } from '@/lib/hooks';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ToneSelector() {
  const { control } = useFormContext();
  const { tones, loading, error } = useFetchTones();

  if (loading) {
    return (
      <div className="space-y-3">
        <Label htmlFor="tone">選擇語氣</Label>
        <div className="p-5 rounded-[20px] bg-[#EFEBF5] shadow-clay-pressed flex items-center justify-center">
          <p className="text-sm text-clay-muted font-bold tracking-wide">⏳ 系統載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <Label htmlFor="tone">選擇語氣</Label>
        <div className="p-5 rounded-[20px] bg-pink-50 shadow-clay-pressed flex items-center justify-center">
          <p className="text-sm text-clay-secondary font-bold">❌ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <Controller
      name="selectedTone"
      control={control}
      rules={{ required: '請選擇一個語氣' }}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-3">
          <Label htmlFor="tone">選擇語氣</Label>
          <Select value={field.value || ''} onValueChange={field.onChange}>
            <SelectTrigger id="tone" aria-invalid={!!error}>
              <SelectValue placeholder="選擇適合的語氣" />
            </SelectTrigger>
            <SelectContent>
              {tones.map((tone) => (
                <SelectItem key={tone.id} value={tone.id}>
                  <div className="flex flex-col gap-1 py-1">
                    <span className="font-bold text-clay-foreground">{tone.name}</span>
                    {tone.description && (
                      <span className="text-sm font-medium text-clay-muted">
                        {tone.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && (
            <p className="text-sm text-clay-secondary font-bold px-2">❌ {error.message}</p>
          )}
        </div>
      )}
    />
  );
}