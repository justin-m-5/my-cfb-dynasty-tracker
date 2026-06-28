// app/dashboard/dynasty/[id]/layout.tsx

import { ReactNode } from 'react'
import { DynastyNavShell } from '@/components/dynasty/dynasty-nav-shell'

interface DynastyLayoutProps {
    children: ReactNode
    params: Promise<{ id: string }>
}

export default async function DynastyLayout({ children, params }: DynastyLayoutProps) {
    const { id } = await params

    return (
        <div className="flex min-h-full flex-col">
            <DynastyNavShell dynastyId={id} />
            <main className="flex-1 py-6">
                {children}
            </main>
        </div>
    )
}
