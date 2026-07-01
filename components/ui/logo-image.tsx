// components/ui/logo-image.tsx

'use client'

import { useState } from 'react'
import Image from 'next/image'

interface LogoImageProps {
    candidates: string[]
    alt: string
    size?: number
    className?: string
}

export function LogoImage({ candidates, alt, size = 40, className }: LogoImageProps) {
    const [index, setIndex] = useState(0)

    if (candidates.length === 0 || index >= candidates.length) {
        return (
            <div
                className={`flex items-center justify-center rounded-md border bg-white dark:bg-white text-xs text-text/70 ${className ?? ''}`}
                style={{ width: size, height: size }}
            >
                N/A
            </div>
        )
    }

    return (
        <Image
            src={candidates[index]}
            alt={alt}
            width={size}
            height={size}
            className={`rounded-md border bg-white dark:bg-white object-contain p-0.5 ${className ?? ''}`}
            style={{ width: size, height: size }}
            onError={() => setIndex((prev) => prev + 1)}
            unoptimized
        />
    )
}
