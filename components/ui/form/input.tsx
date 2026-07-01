// components/ui/input.tsx

import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, onFocus, ...props }, ref) => {
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        if (type === 'number') {
            e.target.select()
        }
        onFocus?.(e)
    }

    return (
        <input
        type={type}
        className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 text-base sm:text-sm text-text ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
        )}
        ref={ref}
        onFocus={handleFocus}
        {...props}
        />
    )
})
Input.displayName = "Input"

export { Input }
