// app/dashboard/dynasty/[id]/(with-nav)/transfers/page.tsx

import { Transfers } from '@/components/dynasty/sections/transfers'

interface TransfersPageProps {
    params: Promise<{ id: string }>
}

export default async function TransfersPage({ params }: TransfersPageProps) {
    const { id } = await params
    return <Transfers dynastyId={id} />
}
