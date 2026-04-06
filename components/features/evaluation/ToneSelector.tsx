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
        <Label htmlFor="tone">選擇語氣</Label>
        <Card className="p-4">
          <p className="text-sm text-gray-500">載入中...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <Label htmlFor="tone">選擇語氣</Label>
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-600">{error}</p>
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
          <Label htmlFor="tone">選擇語氣</Label>
          <Select value={field.value || ''} onValueChange={field.onChange}>
            <SelectTrigger
              id="tone"
              className={error ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="請選擇語氣" />
            </SelectTrigger>
            <SelectContent>
              {tones.map((tone) => (
                <SelectItem key={tone.id} value={tone.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{tone.name}</span>
                    {tone.description && (
                      <span className="text-xs text-gray-500">
                        {tone.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && (
            <p className="text-sm text-red-500">{error.message}</p>
          )}
        </div>
      )}
    />
  );
}