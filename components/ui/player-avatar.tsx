// components/ui/player-avatar.tsx

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { User } from 'lucide-react'

interface PlayerAvatarProps {
    src?: string | null
    alt: string
    size?: number
    className?: string
}

export function PlayerAvatar({ src, alt, size = 28, className = '' }: PlayerAvatarProps) {
    const [error, setError] = useState(false)

    const containerClass = `shrink-0 rounded-full border border-primary/15 bg-primary/5 flex items-center justify-center overflow-hidden ${className}`

    if (!src || error) {
        return (
            <div className={containerClass} style={{ width: size, height: size }}>
                <User className="text-text/25" style={{ width: size * 0.5, height: size * 0.5 }} />
            </div>
        )
    }

    return (
        <div className={containerClass} style={{ width: size, height: size }}>
            <Image
                src={src}
                alt={alt}
                width={size}
                height={size}
                className="h-full w-full object-cover"
                onError={() => setError(true)}
                unoptimized
            />
        </div>
    )
}
