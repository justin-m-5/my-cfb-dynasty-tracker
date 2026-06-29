// components/dynasty/advance-season-button.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FastForward } from 'lucide-react'
import { DynastyService, type Dynasty } from '@/dal/features/dynasty'
import { buttonStyles } from '@/components/ui/button'

interface AdvanceSeasonButtonProps {
    dynastyId: string
}

export function AdvanceSeasonButton({ dynastyId }: AdvanceSeasonButtonProps) {
    const pathname = usePathname()
    const [dynasty, setDynasty] = useState<Dynasty | null>(null)

    const homePath = `/dashboard/dynasty/${dynastyId}`
    const isHomePath = pathname === homePath || pathname === `${homePath}/`

    useEffect(() => {
        if (isHomePath) {
            DynastyService.getDynastyById(dynastyId).then(setDynasty)
        }
    }, [dynastyId, isHomePath])

    if (!isHomePath || !dynasty) return null

    return (
        <Link
            href={`/dashboard/dynasty/${dynastyId}/advance-season`}
            {...buttonStyles({ bg: 'var(--primary)', text: 'white', size: 'sm', className: 'flex items-center gap-1.5 text-xs font-semibold' })}
        >
            <FastForward className="h-3.5 w-3.5" />
            Next Season
        </Link>
    )
}
