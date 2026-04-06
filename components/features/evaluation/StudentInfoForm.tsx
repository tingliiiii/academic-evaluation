'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function StudentInfoForm() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-3">
      <Label htmlFor="studentName">
        學生姓名
      </Label>
      <Input
        id="studentName"
        placeholder="請輸入學生姓名"
        aria-invalid={!!errors.studentName}
        {...register('studentName', {
          required: '學生姓名為必填項',
          minLength: { value: 2, message: '姓名至少需 2 個字' },
          maxLength: { value: 10, message: '姓名最多 10 個字' },
        })}
      />
      {errors.studentName && (
        <p className="text-sm text-clay-secondary font-bold px-2">
          ❌ {typeof errors.studentName.message === 'string'
            ? errors.studentName.message
            : '輸入有誤'}
        </p>
      )}
    </div>
  );
}