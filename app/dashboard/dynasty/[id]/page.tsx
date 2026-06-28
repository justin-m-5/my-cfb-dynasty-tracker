// app/dashboard/dynasty/[id]/page.tsx

import { TeamHome } from '@/components/dynasty/sections/team-home'

interface DynastyPageProps {
    params: Promise<{ id: string }>
}

export default async function DynastyPage({ params }: DynastyPageProps) {
    const { id } = await params

    return <TeamHome dynastyId={id} />
}
