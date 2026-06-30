// components/dashboard/dashboard-client-wrapper.tsx

'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { UserCog } from 'lucide-react'

import type { DynastySummary } from '@/dal/features/dynasty'
import { DynastyService } from '@/dal/features/dynasty'

import { DashboardEmptyState } from './dashboard-empty-state'
import { DashboardLoadingState } from './dashboard-loading-state'
import { DynastyList } from './dynasty-list'
import { buttonStyles } from '@/lib/button-utils'

export function DashboardClientWrapper() {
    const [dynasties, setDynasties] = useState<DynastySummary[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        const loadDynasties = async () => {
            const result = await DynastyService.getDynasties()
            if (!isMounted) return
            setDynasties(result)
            setIsLoading(false)
        }

        void loadDynasties()

        return () => {
            isMounted = false
        }
    }, [])

    const handleDelete = useCallback(async (id: string) => {
        await DynastyService.deleteDynasty(id)
        setDynasties(prev => prev.filter(d => d.id !== id))
    }, [])

    return (
        <div className="space-y-12">
            <div className="flex flex-wrap items-center justify-start gap-4">
                <Link
                    href="/dashboard/profile"
                    {...buttonStyles({ variant: "tile", size: "tile" })}
                >
                    <UserCog className="h-8 w-8" />
                    <span className="text-base font-semibold text-center">
                        Edit Profile
                    </span>
                </Link>
            </div>

            {isLoading && <DashboardLoadingState />}
            {!isLoading && dynasties.length === 0 && <DashboardEmptyState />}
            {!isLoading && dynasties.length > 0 && (
                <DynastyList dynasties={dynasties} onDelete={handleDelete} />
            )}
        </div>
    )
}
