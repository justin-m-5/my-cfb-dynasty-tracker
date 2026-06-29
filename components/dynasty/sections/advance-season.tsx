// components/dynasty/sections/advance-season.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FastForward } from 'lucide-react'

import { DynastyService, type Dynasty } from '@/dal/features/dynasty'
import { YearRecordService } from '@/dal/features/year-records'
import { GameService, type Game } from '@/dal/features/games'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SeasonRecap } from './advance-season/season-recap'
import { CoachingCarousel, type TeamChange } from './advance-season/coaching-carousel'

interface AdvanceSeasonProps {
    dynastyId: string
}

export function AdvanceSeason({ dynastyId }: AdvanceSeasonProps) {
    const router = useRouter()
    const [dynasty, setDynasty] = useState<Dynasty | null>(null)
    const [games, setGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(true)
    const [advancing, setAdvancing] = useState(false)
    const [teamDecided, setTeamDecided] = useState(false)
    const [teamChange, setTeamChange] = useState<TeamChange | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const d = await DynastyService.getDynastyById(dynastyId)
                setDynasty(d)
                if (d) {
                    const yr = await YearRecordService.getCurrentYearRecord(dynastyId)
                    if (yr) {
                        const g = await GameService.getGames(dynastyId, yr.id)
                        setGames(g)
                    }
                }
            } catch (err) {
                console.error('Failed to load:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [dynastyId])

    const handleStay = () => {
        setTeamChange(null)
        setTeamDecided(true)
    }

    const handleSwitch = (change: TeamChange) => {
        setTeamChange(change)
        setTeamDecided(true)
    }

    const handleAdvance = async () => {
        if (!dynasty) return
        setAdvancing(true)
        setError(null)
        try {
            // If switching teams, update dynasty first
            if (teamChange) {
                await DynastyService.switchTeams(dynasty.id, teamChange)
            }

            const result = await DynastyService.advanceSeason(dynasty.id)
            if (result) {
                router.push(`/dashboard/dynasty/${dynastyId}`)
                router.refresh()
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to advance season')
        } finally {
            setAdvancing(false)
        }
    }

    if (loading) {
        return <div className="text-sm text-text/60">Loading...</div>
    }

    if (!dynasty) {
        return <div className="text-sm text-red-500">Dynasty not found.</div>
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                        Advance to {dynasty.current_year + 1} Season
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-text/60">
                        Review your {dynasty.current_year} season below. Once you proceed, this season will be locked.
                    </p>
                </CardContent>
            </Card>

            {/* Season recap */}
            <Card>
                <CardContent className="pt-4">
                    <SeasonRecap dynasty={dynasty} games={games} />
                </CardContent>
            </Card>

            {/* Coaching carousel */}
            <CoachingCarousel
                currentSchool={dynasty.school_name}
                onSwitch={handleSwitch}
                onStay={handleStay}
            />

            {/* Decided indicator */}
            {teamDecided && (
                <Card>
                    <CardContent className="py-3">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <p className="text-xs text-text/70">
                                {teamChange
                                    ? `You're switching to ${teamChange.schoolName} for ${dynasty.current_year + 1}.`
                                    : `You're staying at ${dynasty.school_name} for ${dynasty.current_year + 1}.`
                                }
                            </p>
                            <Button
                                bg="var(--green-600)"
                                text="white"
                                size="sm"
                                onClick={handleAdvance}
                                disabled={advancing}
                                className="flex items-center gap-1.5 text-xs font-semibold"
                            >
                                <FastForward className="h-3.5 w-3.5" />
                                {advancing ? 'Advancing...' : `Lock ${dynasty.current_year} & Start ${dynasty.current_year + 1}`}
                            </Button>
                            {error && <p className="text-xs text-red-500">{error}</p>}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
