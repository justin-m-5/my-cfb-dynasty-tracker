// app/dashboard/dynasty/[id]/schedule/page.tsx

import { Schedule } from '@/components/dynasty/sections/schedule'

interface SchedulePageProps {
    params: Promise<{ id: string }>
}

export default async function SchedulePage({ params }: SchedulePageProps) {
    const { id } = await params

    return <Schedule dynastyId={id} />
}
