// app/dashboard/dynasty/[id]/(with-nav)/layout.tsx

import { ReactNode } from 'react'
import Link from 'next/link'
import { buttonStyles } from '@/components/ui/button'
import { DynastyNavShell } from '@/components/dynasty/dynasty-nav-shell'

interface NavLayoutProps {
    children: ReactNode
    params: Promise<{ id: string }>
}

export default async function NavLayout({ children, params }: NavLayoutProps) {
    const { id } = await params

    return (
        <>
            <div>
                <Link
                    href="/dashboard"
                    {...buttonStyles({ bg: 'var(--orange-400)', text: 'white', className: 'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold' })}
                >
                    ← Dashboard
                </Link>
            </div>
            <DynastyNavShell dynastyId={id} />
            <div className="flex-1">{children}</div>
        </>
    )
}
