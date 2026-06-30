import * as React from "react"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants, buildColorStyle } from "@/lib/button-utils"

export interface ButtonProps 
    extends React.ButtonHTMLAttributes<HTMLButtonElement>, 
    VariantProps<typeof buttonVariants> {
    bg?: string
    text?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, bg, text, style, ...props }, ref) => {
        return (
            <button
                className={cn(
                    buttonVariants({ variant: bg || text ? 'custom' : variant, size }),
                    (bg || text) && 'hover:opacity-80',
                    className
                )}
                style={{ ...buildColorStyle(bg, text), ...style }}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
