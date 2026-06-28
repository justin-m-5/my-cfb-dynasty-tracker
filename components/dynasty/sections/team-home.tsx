// components/dynasty/sections/team-home.tsx

'use client'

import { useEffect, useState } from 'react'

import { DynastyService, type Dynasty } from '@/dal/features/dynasty'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TeamHomeProps {
    dynastyId: string
}

export function TeamHome({ dynastyId }: TeamHomeProps) {
    const [dynasty, setDynasty] = useState<Dynasty | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        DynastyService.getDynastyById(dynastyId).then((d) => {
            setDynasty(d)
            setIsLoading(false)
        })
    }, [dynastyId])

    if (isLoading) {
        return <div className="text-sm text-text/60">Loading team data...</div>
    }

    if (!dynasty) {
        return <div className="text-sm text-red-500">Dynasty not found.</div>
    }

    return (
        <div className="space-y-6">
            {/* Current Season At A Glance */}
            <div>
                <h2 className="mb-3 text-lg font-bold text-text">Current Season</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Year" value={String(dynasty.current_year)} />
                    <StatCard label="Week" value="1" />
                    <StatCard label="Ranking" value="—" />
                    <StatCard label="Record" value="0 - 0" />
                </div>
            </div>

            {/* Career Stats */}
            <div>
                <h2 className="mb-3 text-lg font-bold text-text">Career</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="All-Time Record" value={`${dynasty.total_wins} - ${dynasty.total_losses}`} />
                    <StatCard label="Championships" value={String(dynasty.championships)} />
                    <StatCard label="Seasons Played" value={String(dynasty.seasons_played)} />
                    <StatCard label="Coach Level" value={String(dynasty.coach_level)} />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Team Info</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                        <InfoRow label="School" value={`${dynasty.school_name}${dynasty.school_nickname ? ` ${dynasty.school_nickname}` : ''}`} />
                        <InfoRow label="Conference" value={dynasty.conference ?? 'Independent'} />
                        <InfoRow label="Coach" value={dynasty.coach_name} />
                        <InfoRow label="Current Year" value={String(dynasty.current_year)} />
                        {dynasty.alma_mater && <InfoRow label="Alma Mater" value={dynasty.alma_mater} />}
                        {dynasty.pipeline && <InfoRow label="Pipeline" value={dynasty.pipeline} />}
                    </dl>
                </CardContent>
            </Card>
        </div>
    )
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-primary/20 bg-background/70 p-4 text-center">
            <p className="text-2xl font-bold text-text">{value}</p>
            <p className="mt-1 text-xs text-text/60">{label}</p>
        </div>
    )
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="font-medium text-text/60">{label}</dt>
            <dd className="text-text">{value}</dd>
        </div>
    )
}
