// app/dashboard/dynasty/[id]/(with-nav)/top-25/page.tsx

import { Top25 } from '@/components/dynasty/sections/top25'

interface Top25PageProps {
    params: Promise<{ id: string }>
}

export default async function Top25Page({ params }: Top25PageProps) {
    const { id } = await params
    return <Top25 dynastyId={id} />
}
