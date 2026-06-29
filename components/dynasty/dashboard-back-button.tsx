// components/dynasty/dashboard-back-button.tsx

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { buttonStyles } from '@/components/ui/button'

interface DashboardBackButtonProps {
    dynastyId: string
}

export function DashboardBackButton({ dynastyId }: DashboardBackButtonProps) {
    const pathname = usePathname()
    const homePath = `/dashboard/dynasty/${dynastyId}`
    const isHomePath = pathname === homePath || pathname === `${homePath}/`

    if (!isHomePath) return null

    return (
        <div>
            <Link
                href="/dashboard"
                {...buttonStyles({ bg: 'var(--orange-400)', text: 'white', className: 'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold' })}
            >
                ← Dashboard
            </Link>
        </div>
    )
}
