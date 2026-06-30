// components/dynasty/sections/advance-season.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, FastForward } from 'lucide-react'

import { DynastyService, type Dynasty } from '@/dal/features/dynasty'
import { YearRecordService } from '@/dal/features/year-records'
import { GameService, type Game } from '@/dal/features/games'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SeasonRecap } from './advance-season/season-recap'
import { SeasonFinalizeForm, type SeasonFinalizeData } from './advance-season/season-finalize-form'
import { CoachingCarousel, type TeamChange } from './advance-season/coaching-carousel'
import { Roster } from './roster'
import { Recruiting } from './recruiting'
import { Transfers } from './transfers'
import { PlayerAwards } from './player-awards'

interface AdvanceSeasonProps {
    dynastyId: string
}

const tabs = ['Overview', 'Roster', 'Recruiting', 'Transfers', 'Awards', 'Proceed'] as const
type Tab = (typeof tabs)[number]

export function AdvanceSeason({ dynastyId }: AdvanceSeasonProps) {
    const router = useRouter()
    const [dynasty, setDynasty] = useState<Dynasty | null>(null)
    const [games, setGames] = useState<Game[]>([])
    const [loading, setLoading] = useState(true)
    const [advancing, setAdvancing] = useState(false)
    const [activeTab, setActiveTab] = useState<Tab>('Overview')
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
                        const g = await GameService.getGames(dynastyId, yr.id)
                        setGames(g)
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
            {/* Header */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                        Advance to {dynasty.current_year + 1} Season
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-text/60">
                        Review and make final edits to your {dynasty.current_year} season. Use the tabs below to update roster, recruits, transfers, and awards before locking.
                    </p>
                </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto rounded-lg border border-primary/20 bg-background/70 p-1.5">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            activeTab === tab
                                ? 'bg-primary text-white'
                                : 'text-text/70 hover:bg-primary/10 hover:text-text'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'Overview' && (
                <div className="space-y-4">
                    <Card>
                        <CardContent className="pt-4">
                            <SeasonRecap dynasty={dynasty} games={games} />
                        </CardContent>
                    </Card>
                    <SeasonFinalizeForm
                        year={dynasty.current_year}
                        initialData={finalizeData}
                        onChange={setFinalizeData}
                    />
                </div>
            )}

            {activeTab === 'Roster' && <Roster dynastyId={dynastyId} />}
            {activeTab === 'Recruiting' && <Recruiting dynastyId={dynastyId} />}
            {activeTab === 'Transfers' && <Transfers dynastyId={dynastyId} />}
            {activeTab === 'Awards' && <PlayerAwards dynastyId={dynastyId} />}

            {activeTab === 'Proceed' && (
                <div className="space-y-4">
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
                                            : `Staying at ${dynasty.school_name} — returning players, incoming transfers, and recruits will carry forward.`
                                        }
                                    </p>
                                    <Button
                                        size="sm"
                                        onClick={() => setShowConfirm(true)}
                                        className="text-xs font-semibold"
                                    >
                                        Ready to Lock Season
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
            )}
        </div>
    )
}
