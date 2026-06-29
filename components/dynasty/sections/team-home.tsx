// components/dynasty/sections/team-home.tsx

'use client'

import { useEffect, useState } from 'react'

import { DynastyService, type Dynasty } from '@/dal/features/dynasty'
import { YearRecordService, type YearRecord } from '@/dal/features/year-records'
import { GameService, type Game } from '@/dal/features/games'

import { SeasonGlance } from './home/season-glance'
import { SeasonDetails } from './home/season-details'
import { NextGameCard } from './home/next-game-card'
import { CareerStats } from './home/career-stats'

interface TeamHomeProps {
    dynastyId: string
}

export function TeamHome({ dynastyId }: TeamHomeProps) {
    const [dynasty, setDynasty] = useState<Dynasty | null>(null)
    const [yearRecord, setYearRecord] = useState<YearRecord | null>(null)
    const [games, setGames] = useState<Game[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const d = await DynastyService.getDynastyById(dynastyId)
            setDynasty(d)

            if (d) {
                const yr = await YearRecordService.getCurrentYearRecord(dynastyId)
                setYearRecord(yr)

                if (yr) {
                    const g = await GameService.getGames(dynastyId, yr.id)
                    setGames(g)
                }
            }

            setIsLoading(false)
        }
        load()
    }, [dynastyId])

    if (isLoading) {
        return <div className="text-sm text-text/60">Loading team data...</div>
    }

    if (!dynasty) {
        return <div className="text-sm text-red-500">Dynasty not found.</div>
    }

    return (
        <div className="space-y-6">
            <SeasonGlance dynasty={dynasty} yearRecord={yearRecord} games={games} />
            <SeasonDetails yearRecord={yearRecord} games={games} />
            <NextGameCard games={games} />
            <CareerStats dynasty={dynasty} />
        </div>
    )
}
