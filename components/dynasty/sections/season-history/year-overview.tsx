// components/dynasty/sections/season-history/year-overview.tsx

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DetailCard } from '@/components/ui/detail-card'
import { GlanceCard } from '@/components/ui/glance-card'
import type { YearRecord } from '@/dal/features/year-records'

interface YearOverviewProps {
    yearRecord: YearRecord
}

export function YearOverview({ yearRecord }: YearOverviewProps) {
    const pointDiff = yearRecord.points_for - yearRecord.points_against

    return (
        <Card className="border-primary/15">
            <CardHeader className="pb-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <CardTitle className="text-base">
                            {yearRecord.year} {yearRecord.school_name}
                        </CardTitle>
                        <p className="text-xs text-text/60">
                            {yearRecord.conference ?? 'Independent'}
                            {yearRecord.school_nickname ? ` • ${yearRecord.school_nickname}` : ''}
                        </p>
                    </div>
                    <span
                        className="inline-flex w-fit items-center rounded-full px-2 py-1 text-[10px] font-semibold"
                        style={{
                            backgroundColor: yearRecord.primary_color ?? 'var(--primary5)',
                            color: yearRecord.secondary_color ?? 'white',
                        }}
                    >
                        {yearRecord.school_abbrev ?? yearRecord.school_name}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <GlanceCard label="Overall Record" value={yearRecord.overall_record || '—'} />
                    <GlanceCard label="Conf Record" value={yearRecord.conference_record || '—'} />
                    <GlanceCard label="Final Ranking" value={yearRecord.final_ranking ? `#${yearRecord.final_ranking}` : 'Unranked'} />
                    <GlanceCard label="Point Diff" value={`${pointDiff >= 0 ? '+' : ''}${pointDiff}`} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <DetailCard label="Points For" value={String(yearRecord.points_for ?? 0)} />
                    <DetailCard label="Points Against" value={String(yearRecord.points_against ?? 0)} />
                    <DetailCard label="Bowl Game" value={yearRecord.bowl_game || '—'} />
                    <DetailCard label="Bowl Result" value={yearRecord.bowl_result || '—'} />
                    <DetailCard label="National Champion" value={yearRecord.nat_champ || '—'} />
                    <DetailCard label="Heisman" value={yearRecord.heisman || '—'} />
                </div>
            </CardContent>
        </Card>
    )
}
