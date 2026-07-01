// lib/button-utils.ts

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const buttonVariants = cva(
    "cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-white hover:bg-primary/90",
                outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                cancel: "bg-(--orange-400) text-white hover:opacity-80",
                save: "bg-(--green-600) text-white hover:opacity-80",
                delete: "bg-red-600 text-white hover:bg-red-700",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                custom: "",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
                tile: "h-28 w-36 px-3 py-2",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export function buildColorStyle(bg?: string, text?: string): React.CSSProperties | undefined {
    if (!bg && !text) return undefined
    const style: React.CSSProperties = {}
    if (bg) style.backgroundColor = bg
    if (text) style.color = text
    return style
}

/**
 * Generate button props (className + style) with custom bg/text colors.
 * Use with Link: <Link {...buttonStyles({ variant: "outline" })}>
 */
export function buttonStyles({
    variant,
    size,
    bg,
    text,
    className,
}: VariantProps<typeof buttonVariants> & { bg?: string; text?: string; className?: string } = {}) {
    return {
        className: cn(buttonVariants({ variant: bg || text ? 'custom' : variant, size }), (bg || text) && 'hover:opacity-80',className),
        style: buildColorStyle(bg, text),
    }
}