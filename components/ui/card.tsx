import * as React from "react"
import { cn } from "@/lib/utils"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        // RWD 圓角：手機 32px，桌面 40px。毛玻璃背景、黏土陰影、懸停浮起效果
        "group/card relative flex flex-col gap-6 overflow-hidden rounded-[32px] sm:rounded-[40px] bg-white/70 backdrop-blur-xl text-clay-foreground shadow-clay-card transition-all duration-500 hover:-translate-y-2 hover:shadow-clay-btn-hover p-6 sm:p-8 data-[size=sm]:gap-4 data-[size=sm]:p-5 data-[size=sm]:rounded-[24px]",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-2 relative z-10", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        // 強制使用標題字體，字重加大
        "font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-clay-foreground leading-tight group-data-[size=sm]/card:text-xl",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-base font-medium text-clay-muted group-data-[size=sm]/card:text-sm", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("relative z-10 flex-1", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center pt-4 relative z-10", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
}