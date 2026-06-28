// app/dashboard/dynasty/[id]/(with-nav)/page.tsx

import Link from 'next/link'
import { buttonStyles } from '@/components/ui/button'
import { DynastyHeader } from '@/components/dynasty/dynasty-header'
import { TeamHome } from '@/components/dynasty/sections/team-home'

interface DynastyPageProps {
    params: Promise<{ id: string }>
}

export default async function DynastyPage({ params }: DynastyPageProps) {
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
            <DynastyHeader dynastyId={id} />
            <TeamHome dynastyId={id} />
        </>
    )
}
