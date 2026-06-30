// components/dynasty/dashboard-back-button.tsx

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { buttonStyles } from '@/lib/button-utils'

interface DashboardBackButtonProps {
    dynastyId: string
}

export function DashboardBackButton({ dynastyId }: DashboardBackButtonProps) {
    const pathname = usePathname()
    const homePath = `/dashboard/dynasty/${dynastyId}`
    const isHomePath = pathname === homePath || pathname === `${homePath}/`

    if (!isHomePath) return null

    return (
        <Link
            href="/dashboard"
            {...buttonStyles({ bg: 'var(--orange-400)', text: 'white', size: 'sm', className: 'flex items-center gap-1.5 text-xs font-semibold' })}
        >
            ← Dashboard
        </Link>
    )
}
