// app/dashboard/dynasty/[id]/layout.tsx

import { ReactNode } from 'react'
import Link from 'next/link'
import { buttonStyles } from '@/components/ui/button'

interface DynastyLayoutProps {
    children: ReactNode
    params: Promise<{ id: string }>
}

export default async function DynastyLayout({ children, params }: DynastyLayoutProps) {
    const { id } = await params

    return (
        <div className="flex min-h-full flex-col gap-4">
            <div>
                <Link
                    href="/dashboard"
                    {...buttonStyles({ bg: 'var(--orange-400)', text: 'white', className: 'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold' })}
                >
                    ← Dashboard
                </Link>
            </div>
            <main className="flex flex-1 flex-col gap-4">
                {children}
            </main>
        </div>
    )
}
