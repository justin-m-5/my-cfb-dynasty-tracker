// components/dynasty/dynasty-action-bar.tsx

'use client'

import { usePathname } from 'next/navigation'
import { DashboardBackButton } from './dashboard-back-button'
import { AdvanceSeasonButton } from './advance-season-button'

interface DynastyActionBarProps {
    dynastyId: string
}

export function DynastyActionBar({ dynastyId }: DynastyActionBarProps) {
    const pathname = usePathname()
    const homePath = `/dashboard/dynasty/${dynastyId}`
    const isHomePath = pathname === homePath || pathname === `${homePath}/`

    if (!isHomePath) return null

    return (
        <div className="flex items-center justify-between gap-2">
            <DashboardBackButton dynastyId={dynastyId} />
            <AdvanceSeasonButton dynastyId={dynastyId} />
        </div>
    )
}
