import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // 基礎樣式：圓角 20px、文字加粗、流暢過渡動畫、點擊擠壓特效
  "group/button inline-flex shrink-0 items-center justify-center rounded-[20px] text-base font-bold tracking-wide whitespace-nowrap transition-all duration-200 outline-none select-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.92] active:shadow-clay-pressed focus-visible:ring-4 focus-visible:ring-clay-accent/30 focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        // 主按鈕：紫色漸層 + 凸起陰影 + 懸停浮起並加深陰影
        default: "bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] text-white shadow-clay-btn hover:shadow-clay-btn-hover hover:-translate-y-1",
        // 次要按鈕：白色底 + 凸起陰影
        secondary: "bg-white text-clay-foreground shadow-clay-btn hover:-translate-y-1 hover:shadow-clay-btn-hover",
        // 輪廓按鈕：微透邊框 + 懸停微透背景
        outline: "border-2 border-clay-accent/20 bg-transparent text-clay-accent hover:border-clay-accent hover:bg-clay-accent/5 hover:-translate-y-1",
        // 幽靈按鈕：無背景無陰影
        ghost: "text-clay-foreground hover:bg-clay-accent/10 hover:text-clay-accent",
        // 破壞性/警告按鈕：糖果色板的粉紅色系
        destructive: "bg-gradient-to-br from-pink-400 to-[#DB2777] text-white shadow-clay-btn hover:shadow-clay-btn-hover hover:-translate-y-1",
        // 連結
        link: "text-clay-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-14 px-8", // 預設高度 56px，適合觸控
        sm: "h-11 px-6 text-sm rounded-[16px] [&_svg:not([class*='size-'])]:size-4", // 小按鈕 44px
        lg: "h-16 px-10 text-lg rounded-[24px] [&_svg:not([class*='size-'])]:size-6", // 大按鈕 64px
        icon: "size-14",
        "icon-sm": "size-11 rounded-[16px]",
        "icon-lg": "size-16 rounded-[24px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }