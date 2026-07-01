// components/ui/text-area.tsx

import * as React from 'react'

import { cn } from '@/lib/utils'

const TextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={cn(
                    'w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm text-text ring-offset-background placeholder:text-text/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                {...props}
            />
        )
    }
)

TextArea.displayName = 'TextArea'

export { TextArea }
