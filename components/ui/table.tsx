"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto rounded-[24px]">
      <table data-slot="table" className={cn("w-full caption-bottom text-base", className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead data-slot="table-header" className={cn("bg-[#EFEBF5] rounded-t-[24px]", className)} {...props} />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot data-slot="table-footer" className={cn("border-t border-clay-muted/10 bg-[#EFEBF5]/50 font-bold text-clay-foreground", className)} {...props} />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn("border-b border-clay-muted/10 transition-colors hover:bg-clay-accent/5 data-[state=selected]:bg-clay-accent/10", className)}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn("h-14 px-6 text-left align-middle font-bold text-clay-muted whitespace-nowrap [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("p-6 align-middle whitespace-nowrap text-clay-foreground font-medium [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption data-slot="table-caption" className={cn("mt-4 text-sm font-bold tracking-wide text-clay-muted", className)} {...props} />
  )
}

export {
  Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption,
}