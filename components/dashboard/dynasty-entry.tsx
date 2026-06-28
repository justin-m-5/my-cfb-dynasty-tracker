// components/dashboard/dashboard-entry.tsx

'use client'

import { useEffect, useState } from 'react'

import type { DynastySummary } from '@/dal/features/dynasty'
import { DynastyService } from '@/dal/features/dynasty'

import { DashboardEmptyState } from './dashboard-empty-state'
import { DashboardLoadingState } from './dashboard-loading-state'
import { DynastyList } from './dynasty-list'

export function DashboardEntry() {
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

    if (isLoading) return <DashboardLoadingState />
    if (dynasties.length === 0) return <DynastyEmptyState />

    return <DynastyEntries dynasties={dynasties} />
}
