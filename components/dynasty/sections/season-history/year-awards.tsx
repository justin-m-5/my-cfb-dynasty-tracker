'use client'

import { useEffect, useMemo, useState } from 'react'

import { AwardService, type Award } from '@/dal/features/awards'
import { PlayerService } from '@/dal/features/players'
import type { YearRecord } from '@/dal/features/year-records'
import { HONOR_CATEGORIES, getHonorLabel } from '@/lib/honors-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface YearAwardsProps {
    dynastyId: string
    yearRecords: YearRecord[]
    yearRecord?: YearRecord | null
    isAllTime?: boolean
}

interface HonorEntry {
    honorKey: string
    honorLabel: string
    playerId: string
    playerName: string
    position: string
    year: number
}

export function YearAwards({ dynastyId, yearRecords, yearRecord, isAllTime = false }: YearAwardsProps) {
    const [awards, setAwards] = useState<Award[]>([])
    const [honors, setHonors] = useState<HonorEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const targetRecords = isAllTime
                    ? yearRecords
                    : yearRecord
                        ? [yearRecord]
                        : []

                if (targetRecords.length === 0) {
                    setAwards([])
                    setHonors([])
                    return
                }

                const [awardResults, rosterResults] = await Promise.all([
                    Promise.all(targetRecords.map((record) => AwardService.getAwards(dynastyId, record.id))),
                    Promise.all(targetRecords.map((record) => PlayerService.getRoster(dynastyId, record.id).then((players) => ({ players, year: record.year })))),
                ])

                setAwards(
                    awardResults
                        .flat()
                        .sort((a, b) => b.year - a.year || a.award_name.localeCompare(b.award_name) || a.player_name.localeCompare(b.player_name))
                )

                setHonors(
                    rosterResults
                        .flatMap(({ players, year }) =>
                            players.flatMap((player) =>
                                (player.season.honors ?? []).map((honor) => ({
                                    honorKey: honor,
                                    honorLabel: getHonorLabel(honor),
                                    playerId: player.id,
                                    playerName: player.name,
                                    position: player.position,
                                    year,
                                }))
                            )
                        )
                        .sort((a, b) => b.year - a.year || a.honorLabel.localeCompare(b.honorLabel) || a.playerName.localeCompare(b.playerName))
                )
            } catch (error) {
                console.error('Failed to load season history awards:', error)
                setAwards([])
                setHonors([])
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [dynastyId, isAllTime, yearRecord, yearRecords])

    const groupedHonors = useMemo(() => {
        const grouped = new Map<string, HonorEntry[]>()

        for (const honor of honors) {
            if (!grouped.has(honor.honorLabel)) {
                grouped.set(honor.honorLabel, [])
            }
            grouped.get(honor.honorLabel)?.push(honor)
        }

        const orderedLabels = [
            ...HONOR_CATEGORIES.map((category) => category.label),
            ...Array.from(grouped.keys()).filter(
                (label) => !HONOR_CATEGORIES.some((category) => category.label === label)
            ).sort((a, b) => a.localeCompare(b)),
        ]

        return orderedLabels
            .map((label) => ({ label, entries: grouped.get(label) ?? [] }))
            .filter((group) => group.entries.length > 0)
    }, [honors])

    return (
        <div className="space-y-4">
            <Card className="border-primary/15">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Individual Awards</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-sm text-text/60">Loading awards...</p>
                    ) : awards.length === 0 ? (
                        <p className="text-sm text-text/60">No individual awards were recorded for this selection.</p>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-primary/15 bg-background/60">
                            {awards.map((award) => (
                                <div key={award.id} className="flex items-start gap-3 border-b border-primary/10 px-3 py-2 text-xs last:border-b-0 hover:bg-primary/5">
                                    <div className="w-11 shrink-0 rounded-md bg-primary/10 px-1.5 py-1 text-center text-[10px] font-semibold text-primary">
                                        {award.year}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-text">{award.award_name}</div>
                                        <div className="text-[10px] text-text/55">{award.player_name}</div>
                                    </div>
                                    <div className="shrink-0 text-right text-[10px] text-text/55">{award.team || '—'}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-primary/15">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Honors</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-sm text-text/60">Loading honors...</p>
                    ) : groupedHonors.length === 0 ? (
                        <p className="text-sm text-text/60">No honors were recorded for this selection.</p>
                    ) : (
                        <div className="space-y-3">
                            {groupedHonors.map((group) => (
                                <div key={group.label} className="rounded-xl border border-primary/15 bg-background/60">
                                    <div className="border-b border-primary/10 px-3 py-2 text-xs font-semibold text-text">{group.label}</div>
                                    <div>
                                        {group.entries.map((honor) => (
                                            <div key={`${honor.playerId}-${honor.honorKey}-${honor.year}`} className="flex items-start gap-3 border-b border-primary/10 px-3 py-2 text-xs last:border-b-0 hover:bg-primary/5">
                                                <div className="w-11 shrink-0 rounded-md bg-primary/10 px-1.5 py-1 text-center text-[10px] font-semibold text-primary">
                                                    {honor.year}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium text-text">{honor.playerName}</div>
                                                    <div className="text-[10px] text-text/55">{honor.position}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
