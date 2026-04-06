import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // 增高至 h-16、移除邊框、使用凹陷陰影
        "flex h-14 sm:h-16 w-full min-w-0 rounded-[20px] sm:rounded-2xl border-0 bg-[#EFEBF5] px-6 py-4 text-base sm:text-lg text-clay-foreground shadow-clay-pressed transition-all duration-200 outline-none",
        // Placeholder 顏色
        "placeholder:text-clay-muted placeholder:font-medium",
        // 獲取焦點時：背景轉白、加上強調色外發光
        "focus:bg-white focus:ring-4 focus:ring-clay-accent/20 focus:shadow-none",
        // 禁用狀態
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // 錯誤狀態
        "aria-invalid:ring-4 aria-invalid:ring-clay-secondary/30 aria-invalid:bg-pink-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }