// app/dashboard/dynasty/[id]/(with-nav)/recruiting/page.tsx

import { Recruiting } from '@/components/dynasty/sections/recruiting'

interface RecruitingPageProps {
    params: Promise<{ id: string }>
}

export default async function RecruitingPage({ params }: RecruitingPageProps) {
    const { id } = await params
    return <Recruiting dynastyId={id} />
}
