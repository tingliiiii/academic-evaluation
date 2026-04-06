import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // 增強高度、無邊框、凹陷陰影
        "flex min-h-[140px] w-full rounded-[20px] border-0 bg-[#EFEBF5] px-6 py-5 text-base sm:text-lg text-clay-foreground shadow-clay-pressed transition-all duration-200 outline-none resize-y",
        // Placeholder 樣式
        "placeholder:text-clay-muted placeholder:font-medium",
        // 獲取焦點時：浮起並變白
        "focus:bg-white focus:ring-4 focus:ring-clay-accent/20 focus:shadow-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-4 aria-invalid:ring-pink-400/30 aria-invalid:bg-pink-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }