// components/dynasty/sections/advance-season.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, FastForward } from 'lucide-react'

import { DynastyService, type Dynasty } from '@/dal/features/dynasty'
import { YearRecordService } from '@/dal/features/year-records'
import { GameService, type Game } from '@/dal/features/games'
import { PlayerService, type Player } from '@/dal/features/players'
import { RecruitService, type Recruit } from '@/dal/features/recruits'
import { TransferService, type Transfer } from '@/dal/features/transfers'
import { AwardService, type Award } from '@/dal/features/awards'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SeasonRecap } from './advance-season/season-recap'
import { SeasonSummary } from './advance-season/season-summary'
import { SeasonFinalizeForm, type SeasonFinalizeData } from './advance-season/season-finalize-form'
import { CoachingCarousel, type TeamChange } from './advance-season/coaching-carousel'

interface AdvanceSeasonProps {
    dynastyId: string
}

export function AdvanceSeason({ dynastyId }: AdvanceSeasonProps) {
    const router = useRouter()
    const [dynasty, setDynasty] = useState<Dynasty | null>(null)
    const [games, setGames] = useState<Game[]>([])
    const [players, setPlayers] = useState<Player[]>([])
    const [recruits, setRecruits] = useState<Recruit[]>([])
    const [transfers, setTransfers] = useState<Transfer[]>([])
    const [awards, setAwards] = useState<Award[]>([])
    const [loading, setLoading] = useState(true)
    const [advancing, setAdvancing] = useState(false)
    const [teamDecided, setTeamDecided] = useState(false)
    const [teamChange, setTeamChange] = useState<TeamChange | null>(null)
    const [showConfirm, setShowConfirm] = useState(false)
    const [finalizeData, setFinalizeData] = useState<SeasonFinalizeData>({
        conference_record: '',
        final_ranking: null,
        heisman: '',
        nat_champ: '',
    })
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const d = await DynastyService.getDynastyById(dynastyId)
                setDynasty(d)
                if (d) {
                    const yr = await YearRecordService.getCurrentYearRecord(dynastyId)
                    if (yr) {
                        const [g, p, r, t, a] = await Promise.all([
                            GameService.getGames(dynastyId, yr.id),
                            PlayerService.getRoster(dynastyId, yr.id),
                            RecruitService.getRecruits(dynastyId, yr.id),
                            TransferService.getTransfers(dynastyId, yr.id),
                            AwardService.getAwards(dynastyId, yr.id),
                        ])
                        setGames(g)
                        setPlayers(p)
                        setRecruits(r)
                        setTransfers(t)
                        setAwards(a)
                        setFinalizeData({
                            conference_record: yr.conference_record || '',
                            final_ranking: yr.final_ranking,
                            heisman: yr.heisman || '',
                            nat_champ: yr.nat_champ || '',
                        })
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
            if (teamChange) {
                await DynastyService.switchTeams(dynasty.id, teamChange)
            }

            const result = await DynastyService.advanceSeason(dynasty.id, {
                finalizeData,
                carryRoster: !teamChange,
            })
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
                        Review your {dynasty.current_year} season below. Fill in final details, then confirm to lock this year and start fresh.
                    </p>
                </CardContent>
            </Card>

            {/* Season recap - schedule results */}
            <Card>
                <CardContent className="pt-4">
                    <SeasonRecap dynasty={dynasty} games={games} />
                </CardContent>
            </Card>

            {/* Season summary - roster, transfers, recruits, awards */}
            <SeasonSummary
                players={players}
                recruits={recruits}
                transfers={transfers}
                awards={awards}
                year={dynasty.current_year}
            />

            {/* Finalize form - conf record, ranking, heisman, natty */}
            <SeasonFinalizeForm
                year={dynasty.current_year}
                initialData={finalizeData}
                onChange={setFinalizeData}
            />

            {/* Coaching carousel */}
            <CoachingCarousel
                currentSchool={dynasty.school_name}
                onSwitch={handleSwitch}
                onStay={handleStay}
            />

            {/* Confirmation gate */}
            {teamDecided && !showConfirm && (
                <Card>
                    <CardContent className="py-3">
                        <div className="flex flex-col items-center gap-2 text-center">
                            <p className="text-xs text-text/70">
                                {teamChange
                                    ? `Switching to ${teamChange.schoolName} — roster will start empty.`
                                    : `Staying at ${dynasty.school_name} — ${players.filter(p => p.year !== 'SR' && p.year !== 'SR (RS)').length} players will carry forward.`
                                }
                            </p>
                            <Button
                                size="sm"
                                onClick={() => setShowConfirm(true)}
                                className="text-xs font-semibold"
                            >
                                Ready to Proceed
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Final lock confirmation */}
            {showConfirm && (
                <Card className="border-orange-500/30">
                    <CardContent className="py-4">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <div className="flex items-center gap-1.5 text-orange-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-xs font-semibold">This action cannot be undone</span>
                            </div>
                            <p className="text-[10px] text-text/60 max-w-sm">
                                The {dynasty.current_year} season will be permanently locked. You won&apos;t be able to edit schedule results, roster, recruits, or transfers for this year.
                            </p>
                            <div className="flex items-center gap-2">
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
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowConfirm(false)}
                                    className="text-xs"
                                >
                                    Go Back
                                </Button>
                            </div>
                            {error && <p className="text-xs text-red-500">{error}</p>}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
