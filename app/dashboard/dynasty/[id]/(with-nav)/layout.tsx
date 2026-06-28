// app/dashboard/dynasty/[id]/(with-nav)/layout.tsx

import { ReactNode } from 'react'
import { DynastyNavShell } from '@/components/dynasty/dynasty-nav-shell'

interface NavLayoutProps {
    children: ReactNode
    params: Promise<{ id: string }>
}

export default async function NavLayout({ children, params }: NavLayoutProps) {
    const { id } = await params

    return (
        <>
            <DynastyNavShell dynastyId={id} />
            <div className="flex-1">{children}</div>
        </>
    )
}
