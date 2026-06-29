// app/dashboard/dynasty/[id]/(with-nav)/roster/page.tsx

import { Roster } from '@/components/dynasty/sections/roster'

interface RosterPageProps {
    params: Promise<{ id: string }>
}

export default async function RosterPage({ params }: RosterPageProps) {
    const { id } = await params
    return <Roster dynastyId={id} />
}
