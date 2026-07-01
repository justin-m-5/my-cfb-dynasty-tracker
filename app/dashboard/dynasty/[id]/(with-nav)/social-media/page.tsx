// app/dashboard/dynasty/[id]/(with-nav)/social-media/page.tsx

import { DynastyService } from '@/dal/features/dynasty'
import { YearRecordService } from '@/dal/features/year-records'
import { GameService } from '@/dal/features/games'
import { PlayerService } from '@/dal/features/players'
import { RecruitService } from '@/dal/features/recruits'
import { TransferService } from '@/dal/features/transfers'
import { SocialMedia } from '@/components/dynasty/sections/social-media'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function SocialMediaPage({ params }: PageProps) {
    const { id: dynastyId } = await params

    const [dynasty, yearRecord] = await Promise.all([
        DynastyService.getDynastyById(dynastyId),
        YearRecordService.getCurrentYearRecord(dynastyId),
    ])

    if (!dynasty || !yearRecord) {
        return <p className="text-sm text-red-500">Dynasty not found.</p>
    }

    const [games, roster, recruits, transfers] = await Promise.all([
        GameService.getGames(dynastyId, yearRecord.id),
        PlayerService.getRoster(dynastyId, yearRecord.id),
        RecruitService.getRecruits(dynastyId, yearRecord.id),
        TransferService.getTransfers(dynastyId, yearRecord.id),
    ])

    return <SocialMedia dynasty={dynasty} games={games} roster={roster} recruits={recruits} transfers={transfers} />
}
