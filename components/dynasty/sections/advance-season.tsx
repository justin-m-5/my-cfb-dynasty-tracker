// components/dynasty/sections/advance-season.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, FastForward } from 'lucide-react'

import { DynastyService, type Dynasty } from '@/dal/features/dynasty'
import { YearRecordService } from '@/dal/features/year-records'
import { GameService, type Game } from '@/dal/features/games'
import { PlayerService, type RosterPlayer } from '@/dal/features/players'
import { TransferService, type Transfer } from '@/dal/features/transfers'
import { RecruitService, type Recruit } from '@/dal/features/recruits'
import { DraftedPlayerService, type DraftedPlayer } from '@/dal/features/drafted-players'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SidebarNav } from '@/components/ui/sidebar-nav'
import { SeasonRecap } from './advance-season/season-recap'
import { SeasonFinalizeForm, type SeasonFinalizeData } from '../../forms/season-finalize-form'
import { CoachingCarousel, type TeamChange } from './advance-season/coaching-carousel'
import { RosterBreakdown } from './advance-season/roster-breakdown'
import { CompactTransfers } from './advance-season/compact-transfers'
import { CompactRecruits } from './advance-season/compact-recruits'
import { CompactDraft } from './advance-season/compact-draft'
import { CompactHonors } from './advance-season/compact-honors'

interface AdvanceSeasonProps {
    dynastyId: string
}

const navItems = [
    { name: 'Overview', key: 'overview' },
    { name: 'Transfers', key: 'transfers' },
    { name: 'Recruits', key: 'recruits' },
    { name: 'Draft', key: 'draft' },
    { name: 'Honors', key: 'honors' },
]

export function AdvanceSeason({ dynastyId }: AdvanceSeasonProps) {
    const router = useRouter()
    const [dynasty, setDynasty] = useState<Dynasty | null>(null)
    const [yearRecordId, setYearRecordId] = useState<string | null>(null)
    const [games, setGames] = useState<Game[]>([])
    const [roster, setRoster] = useState<RosterPlayer[]>([])
    const [transfers, setTransfers] = useState<Transfer[]>([])
    const [recruits, setRecruits] = useState<Recruit[]>([])
    const [draftedPlayers, setDraftedPlayers] = useState<DraftedPlayer[]>([])
    const [loading, setLoading] = useState(true)
    const [advancing, setAdvancing] = useState(false)
    const [activeTab, setActiveTab] = useState('overview')
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
                const [d, yr] = await Promise.all([
                    DynastyService.getDynastyById(dynastyId),
                    YearRecordService.getCurrentYearRecord(dynastyId),
                ])

                setDynasty(d)

                if (d && yr) {
                    setYearRecordId(yr.id)
                    setFinalizeData({
                        conference_record: yr.conference_record || '',
                        final_ranking: yr.final_ranking,
                        heisman: yr.heisman || '',
                        nat_champ: yr.nat_champ || '',
                    })

                    const [gameData, rosterData, transferData, recruitData, draftedData] = await Promise.all([
                        GameService.getGames(dynastyId, yr.id),
                        PlayerService.getRoster(dynastyId, yr.id),
                        TransferService.getTransfers(dynastyId, yr.id),
                        RecruitService.getRecruits(dynastyId, yr.id),
                        DraftedPlayerService.getDraftedPlayers(dynastyId, yr.id),
                    ])

                    setGames(gameData)
                    setRoster(rosterData)
                    setTransfers(transferData)
                    setRecruits(recruitData)
                    setDraftedPlayers(draftedData)
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
        setShowConfirm(false)
        setTeamChange(null)
        setTeamDecided(true)
    }

    const handleSwitch = (change: TeamChange) => {
        setShowConfirm(false)
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
        <div className="space-y-4 pt-10">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                        Advance to {dynasty.current_year + 1} Season
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-text/60">
                        Review and make final edits to your {dynasty.current_year} season before locking.
                    </p>
                </CardContent>
            </Card>

            <SidebarNav items={navItems} active={activeTab} onChange={setActiveTab} />

            {activeTab === 'overview' && (
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

                    <RosterBreakdown
                        roster={roster}
                        transfers={transfers}
                        recruits={recruits}
                        draftedPlayers={draftedPlayers}
                    />

                    <CoachingCarousel
                        currentSchool={dynasty.school_name}
                        onSwitch={handleSwitch}
                        onStay={handleStay}
                    />

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

                    {showConfirm && (
                        <Card className="border-orange-500/30">
                            <CardContent className="py-4">
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <div className="flex items-center gap-1.5 text-orange-600">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="text-xs font-semibold">This action cannot be undone</span>
                                    </div>
                                    <p className="max-w-sm text-[10px] text-text/60">
                                        The {dynasty.current_year} season will be permanently locked. You won&apos;t be able to edit schedule results, roster, recruits, or transfers for this year.
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="save"
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

            {!yearRecordId && activeTab !== 'overview' && (
                <div className="rounded-xl border border-red-500/20 bg-red-50/60 px-3 py-2 text-xs text-red-600">
                    Current season record not found.
                </div>
            )}

            {activeTab === 'transfers' && yearRecordId && (
                <CompactTransfers
                    dynastyId={dynastyId}
                    yearRecordId={yearRecordId}
                    transfers={transfers}
                    onChange={setTransfers}
                />
            )}

            {activeTab === 'recruits' && yearRecordId && (
                <CompactRecruits
                    dynastyId={dynastyId}
                    yearRecordId={yearRecordId}
                    recruits={recruits}
                    onChange={setRecruits}
                />
            )}

            {activeTab === 'draft' && yearRecordId && (
                <CompactDraft
                    dynastyId={dynastyId}
                    yearRecordId={yearRecordId}
                    year={dynasty.current_year}
                    schoolName={dynasty.school_name}
                    roster={roster}
                    draftedPlayers={draftedPlayers}
                    onChange={setDraftedPlayers}
                />
            )}

            {activeTab === 'honors' && yearRecordId && (
                <CompactHonors
                    roster={roster}
                    onRosterUpdate={setRoster}
                />
            )}
        </div>
    )
}
