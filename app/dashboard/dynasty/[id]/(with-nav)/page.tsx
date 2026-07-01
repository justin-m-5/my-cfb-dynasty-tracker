// app/dashboard/dynasty/[id]/(with-nav)/page.tsx

import { DynastyHeader } from '@/components/dynasty/dynasty-header'
import { TeamHome } from '@/components/dynasty/sections/home'

interface DynastyPageProps {
    params: Promise<{ id: string }>
}

export default async function DynastyPage({ params }: DynastyPageProps) {
    const { id } = await params

    return (
        <>
            <DynastyHeader dynastyId={id} />
            <TeamHome dynastyId={id} />
        </>
    )
}
