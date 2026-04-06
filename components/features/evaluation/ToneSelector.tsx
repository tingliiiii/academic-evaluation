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
import { Card } from '@/components/ui/card';

export function ToneSelector() {
  const { control } = useFormContext();
  const { tones, loading, error } = useFetchTones();

  if (loading) {
    return (
      <div className="space-y-2">
        <Label htmlFor="tone" className="text-amber-900 font-bold">
          🎭 選擇語氣
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
        <Label htmlFor="tone" className="text-amber-900 font-bold">
          🎭 選擇語氣
        </Label>
        <Card className="p-4 border-2 border-red-300 bg-red-50">
          <p className="text-sm text-red-700 font-medium">❌ {error}</p>
        </Card>
      </div>
    );
  }

  return (
    <Controller
      name="selectedTone"
      control={control}
      rules={{ required: '請選擇一個語氣' }}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-2">
          <Label htmlFor="tone" className="text-amber-900 font-bold">
            🎭 選擇語氣
          </Label>
          <Select value={field.value || ''} onValueChange={field.onChange}>
            <SelectTrigger
              id="tone"
              className={`border-2 focus:border-amber-400 ${error ? 'border-red-500 ring-red-500' : 'border-amber-200'}`}
            >
              <SelectValue placeholder="請選擇語氣" />
            </SelectTrigger>
            <SelectContent>
              {tones.map((tone) => (
                <SelectItem key={tone.id} value={tone.id}>
                  <div className="flex flex-col">
                    <span className="font-medium text-amber-900">{tone.name}</span>
                    {tone.description && (
                      <span className="text-xs text-amber-600">
                        {tone.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && (
            <p className="text-sm text-red-600 font-medium">❌ {error.message}</p>
          )}
        </div>
      )}
    />
  );
}