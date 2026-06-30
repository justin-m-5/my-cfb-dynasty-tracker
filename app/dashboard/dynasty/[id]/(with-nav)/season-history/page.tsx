import { SeasonHistory } from '@/components/dynasty/sections/season-history'

interface Props {
    params: Promise<{ id: string }>
}

export default async function SeasonHistoryPage({ params }: Props) {
    const { id } = await params
    return <SeasonHistory dynastyId={id} />
}
