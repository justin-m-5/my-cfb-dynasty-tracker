// app/dashboard/dynasty/[id]/advance-season/page.tsx

import Link from 'next/link'
import { AdvanceSeason } from '@/components/dynasty/sections/advance-season'
import { buttonStyles } from '@/lib/button-utils'

interface AdvanceSeasonPageProps {
    params: Promise<{ id: string }>
}

export default async function AdvanceSeasonPage({ params }: AdvanceSeasonPageProps) {
    const { id } = await params
    return (
        <>
            <div className="flex items-center">
                <Link
                    href={`/dashboard/dynasty/${id}`}
                    {...buttonStyles({ bg: 'var(--orange-400)', text: 'white', size: 'sm', className: 'flex items-center gap-1.5 text-xs font-semibold' })}
                >
                    ← Back to Team
                </Link>
            </div>
            <AdvanceSeason dynastyId={id} />
        </>
    )
}
