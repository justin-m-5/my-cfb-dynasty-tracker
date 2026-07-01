'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart2, ListOrdered, Trophy, User, type LucideIcon } from 'lucide-react'

import { AwardService, type Award } from '@/dal/features/awards'
import { PlayerService, type CareerSeason, type Player, type PlayerOrigin } from '@/dal/features/players'
import { PlayerStatService, type CareerPlayerStat } from '@/dal/features/player-stats'
import { Card, CardContent } from '@/components/ui/card'
import { devTraitColors, type DevTrait } from '@/lib/player-config'
import { cn } from '@/lib/utils'

import { AwardsTab } from './awards-tab'
import { CareerStatsTab } from './career-stats'
import { GameLogsTab } from './game-logs'
import { PlayerCardHeader } from './card-header'
import { PlayerInfoTab } from './player-info'
import { getContrastTextColor } from './stat-config'
import type { PlayerCardProps, PlayerCardTab } from './types'

const tabs: { key: PlayerCardTab; icon: LucideIcon }[] = [
    { key: 'Career Stats', icon: BarChart2 },
    { key: 'Game Logs', icon: ListOrdered },
    { key: 'Awards', icon: Trophy },
    { key: 'Player Info', icon: User },
]

export function PlayerCard({ playerId, dynastyId, isOpen, onClose, schoolColors, schoolName }: PlayerCardProps) {
    const [activeTab, setActiveTab] = useState<PlayerCardTab>('Career Stats')
    const [loading, setLoading] = useState(false)
    const [player, setPlayer] = useState<Player | null>(null)
    const [career, setCareer] = useState<CareerSeason[]>([])
    const [careerStats, setCareerStats] = useState<CareerPlayerStat[]>([])
    const [awards, setAwards] = useState<Award[]>([])
    const [origin, setOrigin] = useState<PlayerOrigin | null>(null)

    useEffect(() => {
        if (!isOpen) return

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    useEffect(() => {
        if (!isOpen) return

        let cancelled = false

        const load = async () => {
            setLoading(true)
            setActiveTab('Career Stats')

            try {
                const playerData = await PlayerService.getPlayer(playerId)
                if (!playerData || cancelled) {
                    if (!cancelled) {
                        setPlayer(null)
                        setCareer([])
                        setCareerStats([])
                        setAwards([])
                        setOrigin(null)
                    }
                    return
                }

                const [careerData, statData, awardData, originData] = await Promise.all([
                    PlayerService.getPlayerCareer(playerId),
                    PlayerStatService.getCareerStats(playerId),
                    AwardService.getAwardsByPlayer(dynastyId, playerId),
                    PlayerService.getPlayerOrigin(dynastyId, playerData.name),
                ])

                if (cancelled) return

                setPlayer(playerData)
                setCareer(careerData)
                setCareerStats(statData)
                setAwards(awardData)
                setOrigin(originData)
            } catch (error) {
                if (!cancelled) {
                    console.error('Failed to load player card:', error)
                    setPlayer(null)
                    setCareer([])
                    setCareerStats([])
                    setAwards([])
                    setOrigin(null)
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        void load()

        return () => {
            cancelled = true
        }
    }, [dynastyId, isOpen, playerId])

    const currentSeason = useMemo(() => career[career.length - 1] ?? null, [career])
    const traitColor = currentSeason?.dev_trait ? devTraitColors[currentSeason.dev_trait as DevTrait] ?? devTraitColors.Normal : devTraitColors.Normal
    const headerTextColor = getContrastTextColor(schoolColors.primary, '#ffffff')

    if (!isOpen) {
        return null
    }

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/65 p-0 backdrop-blur-sm sm:p-6"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose()
                }
            }}
        >
            <Card className="mx-auto flex min-h-screen w-full max-w-4xl flex-col rounded-none border-primary/20 bg-background shadow-xl hover:shadow-xl sm:my-8 sm:min-h-0 sm:rounded-2xl">
                <PlayerCardHeader
                    player={player}
                    currentSeason={currentSeason}
                    schoolColors={schoolColors}
                    schoolName={schoolName}
                    headerTextColor={headerTextColor}
                    traitColor={traitColor}
                    onClose={onClose}
                />

                <CardContent className="flex-1 space-y-4 p-4 sm:p-6">
                    <div className="flex flex-col gap-1 sm:flex-row sm:gap-2">
                        {tabs.map(({ key, icon: Icon }) => {
                            const isActive = activeTab === key
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setActiveTab(key)}
                                    className={cn(
                                        'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                                        isActive
                                            ? 'border-transparent shadow-sm'
                                            : 'border-primary/10 bg-background text-text/70 hover:bg-primary/5 hover:text-text'
                                    )}
                                    style={isActive ? { backgroundColor: schoolColors.primary, color: headerTextColor } : undefined}
                                >
                                    <Icon className="h-4 w-4" />
                                    {key}
                                </button>
                            )
                        })}
                    </div>

                    {loading ? (
                        <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-10 text-center text-sm text-text/60">
                            Loading player card...
                        </div>
                    ) : !player ? (
                        <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-10 text-center text-sm text-text/60">
                            Player details could not be loaded.
                        </div>
                    ) : (
                        <>
                            {activeTab === 'Career Stats' && <CareerStatsTab careerStats={careerStats} />}
                            {activeTab === 'Game Logs' && <GameLogsTab careerStats={careerStats} schoolColors={schoolColors} />}
                            {activeTab === 'Awards' && <AwardsTab awards={awards} />}
                            {activeTab === 'Player Info' && (
                                <PlayerInfoTab
                                    player={player}
                                    currentSeason={currentSeason}
                                    career={career}
                                    origin={origin}
                                    schoolColors={schoolColors}
                                />
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
