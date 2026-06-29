// app/dashboard/dynasty/[id]/(with-nav)/layout.tsx

import { ReactNode } from 'react'
import { DashboardBackButton } from '@/components/dynasty/dashboard-back-button'
import { DynastyNavShell } from '@/components/dynasty/dynasty-nav-shell'
import { AdvanceSeasonButton } from '@/components/dynasty/advance-season-button'

interface NavLayoutProps {
    children: ReactNode
    params: Promise<{ id: string }>
}

export default async function NavLayout({ children, params }: NavLayoutProps) {
    const { id } = await params

    return (
        <>
            <div className="flex items-center justify-between gap-2">
                <DashboardBackButton dynastyId={id} />
                <AdvanceSeasonButton dynastyId={id} />
            </div>
            <DynastyNavShell dynastyId={id} />
            <div className="flex-1">{children}</div>
        </>
    )
}
