// app/dashboard/dynasty/[id]/(with-nav)/layout.tsx

import { ReactNode } from 'react'
import { DashboardBackButton } from '@/components/dynasty/dashboard-back-button'
import { DynastyNavShell } from '@/components/dynasty/dynasty-nav-shell'

interface NavLayoutProps {
    children: ReactNode
    params: Promise<{ id: string }>
}

export default async function NavLayout({ children, params }: NavLayoutProps) {
    const { id } = await params

    return (
        <>
            <DashboardBackButton dynastyId={id} />
            <DynastyNavShell dynastyId={id} />
            <div className="flex-1">{children}</div>
        </>
    )
}
