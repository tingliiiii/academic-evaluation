"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" className={cn("p-1", className)} {...props} />
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        // 凹陷設計，與 Input 保持一致
        "flex h-14 sm:h-16 w-full items-center justify-between gap-2 rounded-[20px] border-0 bg-[#EFEBF5] px-6 py-4 text-base sm:text-lg text-clay-foreground shadow-clay-pressed transition-all duration-200 outline-none select-none",
        "focus:bg-white focus:ring-4 focus:ring-clay-accent/20 focus:shadow-none",
        "data-[placeholder]:text-clay-muted data-[placeholder]:font-medium",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "[&_svg]:shrink-0 [&_svg]:size-5 [&_svg]:text-clay-muted",
        className
      )}
      {...props}
    >
      <span className="line-clamp-1 flex-1 text-left">{children}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          // 展開後的選單面板：毛玻璃浮動卡片
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-[24px] border-0 bg-white/90 backdrop-blur-xl text-clay-foreground shadow-clay-card",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" && "data-[side=bottom]:translate-y-2 data-[side=left]:-translate-x-2 data-[side=right]:translate-x-2 data-[side=top]:-translate-y-2",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-2",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-4 py-2 text-sm font-bold tracking-wide text-clay-muted", className)}
      {...props}
    />
  )
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        // 個別選項：大圓角、懸停背景、字體加粗
        "relative flex w-full cursor-pointer select-none items-center rounded-[16px] py-3 pl-4 pr-10 text-base font-medium outline-none transition-colors",
        "focus:bg-clay-accent/10 focus:text-clay-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute right-4 flex size-4 items-center justify-center text-clay-accent">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon strokeWidth={3} className="size-5" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("-mx-1 my-2 h-px bg-clay-muted/20", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("flex cursor-default items-center justify-center py-2 text-clay-muted", className)}
      {...props}
    >
      <ChevronUpIcon className="size-5" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("flex cursor-default items-center justify-center py-2 text-clay-muted", className)}
      {...props}
    >
      <ChevronDownIcon className="size-5" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}