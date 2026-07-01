'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart2, Star, Trophy, User, X } from 'lucide-react'

import { AwardService, type Award } from '@/dal/features/awards'
import { PlayerService, type CareerSeason, type Player, type PlayerOrigin } from '@/dal/features/players'
import { PlayerStatService, type CareerPlayerStat } from '@/dal/features/player-stats'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PlayerAvatar } from '@/components/ui/player-avatar'
import { devTraitColors, type DevTrait } from '@/lib/player-config'
import { cn } from '@/lib/utils'

type PlayerCardTab = 'Career Stats' | 'Awards' | 'Player Info'

type StatKey =
    | 'attempts'
    | 'completions'
    | 'pass_yards'
    | 'pass_td'
    | 'pass_int'
    | 'long'
    | 'carries'
    | 'rush_yards'
    | 'rush_td'
    | 'fumbles'
    | 'yac'
    | 'receptions'
    | 'rec_yards'
    | 'rec_td'
    | 'rac'
    | 'solo'
    | 'assists'
    | 'tackles'
    | 'tfl'
    | 'sacks'
    | 'def_int'
    | 'forced_fumbles'
    | 'def_td'
    | 'fg_made'
    | 'fg_attempted'
    | 'xp_made'
    | 'xp_attempted'
    | 'punts'
    | 'punt_yards'
    | 'touchbacks'
    | 'kr_yards'
    | 'kr_td'
    | 'pr_yards'
    | 'pr_td'
    | 'kr_long'
    | 'pr_long'

type StatTotals = Record<StatKey, number>

interface YearlyStats extends StatTotals {
    year: number
}

interface StatColumn {
    label: string
    render: (row: StatTotals) => number | string
}

interface StatCategoryConfig {
    key: string
    label: string
    show: (row: StatTotals) => boolean
    columns: StatColumn[]
}

interface PlayerCardProps {
    playerId: string
    dynastyId: string
    isOpen: boolean
    onClose: () => void
    schoolColors: { primary: string; secondary: string }
}

const tabs: { key: PlayerCardTab; icon: typeof BarChart2 }[] = [
    { key: 'Career Stats', icon: BarChart2 },
    { key: 'Awards', icon: Trophy },
    { key: 'Player Info', icon: User },
]

const statKeys: readonly StatKey[] = [
    'attempts', 'completions', 'pass_yards', 'pass_td', 'pass_int', 'long',
    'carries', 'rush_yards', 'rush_td', 'fumbles', 'yac',
    'receptions', 'rec_yards', 'rec_td', 'rac',
    'solo', 'assists', 'tackles', 'tfl', 'sacks', 'def_int', 'forced_fumbles', 'def_td',
    'fg_made', 'fg_attempted', 'xp_made', 'xp_attempted',
    'punts', 'punt_yards', 'touchbacks',
    'kr_yards', 'kr_td', 'pr_yards', 'pr_td', 'kr_long', 'pr_long',
]

const longFields = new Set<StatKey>(['long', 'kr_long', 'pr_long'])

const statCategoryConfigs: StatCategoryConfig[] = [
    {
        key: 'passing',
        label: 'Passing',
        show: row => row.attempts > 0,
        columns: [
            { label: 'CMP', render: row => row.completions },
            { label: 'ATT', render: row => row.attempts },
            { label: 'YDS', render: row => row.pass_yards },
            { label: 'AVG', render: row => formatAverage(row.pass_yards, row.attempts) },
            { label: 'TD', render: row => row.pass_td },
            { label: 'INT', render: row => row.pass_int },
            { label: 'LNG', render: row => row.long },
            { label: 'QBR', render: row => formatQbr(row) },
        ],
    },
    {
        key: 'rushing',
        label: 'Rushing',
        show: row => row.carries > 0,
        columns: [
            { label: 'CAR', render: row => row.carries },
            { label: 'YDS', render: row => row.rush_yards },
            { label: 'AVG', render: row => formatAverage(row.rush_yards, row.carries) },
            { label: 'TD', render: row => row.rush_td },
            { label: 'LNG', render: row => row.long },
            { label: 'FUM', render: row => row.fumbles },
        ],
    },
    {
        key: 'receiving',
        label: 'Receiving',
        show: row => row.receptions > 0,
        columns: [
            { label: 'REC', render: row => row.receptions },
            { label: 'YDS', render: row => row.rec_yards },
            { label: 'AVG', render: row => formatAverage(row.rec_yards, row.receptions) },
            { label: 'TD', render: row => row.rec_td },
            { label: 'LNG', render: row => row.long },
        ],
    },
    {
        key: 'defense',
        label: 'Defense',
        show: row => row.solo + row.assists > 0,
        columns: [
            { label: 'TCKL', render: row => row.solo + row.assists },
            { label: 'SOLO', render: row => row.solo },
            { label: 'AST', render: row => row.assists },
            { label: 'SACK', render: row => row.sacks },
            { label: 'TFL', render: row => row.tfl },
            { label: 'INT', render: row => row.def_int },
            { label: 'FF', render: row => row.forced_fumbles },
            { label: 'TD', render: row => row.def_td },
        ],
    },
    {
        key: 'kicking',
        label: 'Kicking',
        show: row => row.fg_attempted > 0,
        columns: [
            { label: 'FGM', render: row => row.fg_made },
            { label: 'FGA', render: row => row.fg_attempted },
            { label: 'FG%', render: row => formatPercent(row.fg_made, row.fg_attempted) },
            { label: 'LNG', render: row => row.long },
            { label: 'XPM', render: row => row.xp_made },
            { label: 'XPA', render: row => row.xp_attempted },
        ],
    },
    {
        key: 'punting',
        label: 'Punting',
        show: row => row.punts > 0,
        columns: [
            { label: 'PUNTS', render: row => row.punts },
            { label: 'YDS', render: row => row.punt_yards },
            { label: 'AVG', render: row => formatAverage(row.punt_yards, row.punts) },
            { label: 'LNG', render: row => row.long },
            { label: 'TB', render: row => row.touchbacks },
        ],
    },
    {
        key: 'kick-return',
        label: 'Kick Return',
        show: row => row.kr_yards > 0,
        columns: [
            { label: 'YDS', render: row => row.kr_yards },
            { label: 'TD', render: row => row.kr_td },
            { label: 'LNG', render: row => row.kr_long },
        ],
    },
    {
        key: 'punt-return',
        label: 'Punt Return',
        show: row => row.pr_yards > 0,
        columns: [
            { label: 'YDS', render: row => row.pr_yards },
            { label: 'TD', render: row => row.pr_td },
            { label: 'LNG', render: row => row.pr_long },
        ],
    },
]

function createEmptyTotals(): StatTotals {
    return {
        attempts: 0,
        completions: 0,
        pass_yards: 0,
        pass_td: 0,
        pass_int: 0,
        long: 0,
        carries: 0,
        rush_yards: 0,
        rush_td: 0,
        fumbles: 0,
        yac: 0,
        receptions: 0,
        rec_yards: 0,
        rec_td: 0,
        rac: 0,
        solo: 0,
        assists: 0,
        tackles: 0,
        tfl: 0,
        sacks: 0,
        def_int: 0,
        forced_fumbles: 0,
        def_td: 0,
        fg_made: 0,
        fg_attempted: 0,
        xp_made: 0,
        xp_attempted: 0,
        punts: 0,
        punt_yards: 0,
        touchbacks: 0,
        kr_yards: 0,
        kr_td: 0,
        pr_yards: 0,
        pr_td: 0,
        kr_long: 0,
        pr_long: 0,
    }
}

function aggregateCareerRows(stats: CareerPlayerStat[]) {
    const yearlyMap = new Map<number, YearlyStats>()
    const careerTotals = createEmptyTotals()

    for (const stat of stats) {
        const year = stat.game_year || 0
        const yearly = yearlyMap.get(year) ?? { year, ...createEmptyTotals() }

        for (const key of statKeys) {
            const value = Number(stat[key] ?? 0)
            if (longFields.has(key)) {
                yearly[key] = Math.max(yearly[key], value)
                careerTotals[key] = Math.max(careerTotals[key], value)
            } else {
                yearly[key] += value
                careerTotals[key] += value
            }
        }

        yearlyMap.set(year, yearly)
    }

    const yearlyRows = Array.from(yearlyMap.values()).sort((a, b) => (a.year || 0) - (b.year || 0))

    return { yearlyRows, careerTotals }
}

function formatAverage(total: number, attempts: number) {
    return attempts > 0 ? (total / attempts).toFixed(1) : '0.0'
}

function formatPercent(made: number, attempted: number) {
    return attempted > 0 ? `${((made / attempted) * 100).toFixed(1)}%` : '0.0%'
}

function formatQbr(row: StatTotals) {
    return row.attempts > 0
        ? (((8.4 * row.pass_yards) + (330 * row.pass_td) + (100 * row.completions) - (200 * row.pass_int)) / row.attempts).toFixed(1)
        : '0.0'
}

function getContrastTextColor(color: string, fallback: string) {
    if (!color.startsWith('#')) return fallback

    const hex = color.slice(1)
    const normalized = hex.length === 3
        ? hex.split('').map(char => `${char}${char}`).join('')
        : hex

    if (normalized.length !== 6) return fallback

    const red = parseInt(normalized.slice(0, 2), 16)
    const green = parseInt(normalized.slice(2, 4), 16)
    const blue = parseInt(normalized.slice(4, 6), 16)
    const luminance = (0.299 * red) + (0.587 * green) + (0.114 * blue)

    return luminance > 170 ? '#111827' : '#ffffff'
}

function CareerStatsSection({ config, yearlyRows, careerTotals }: { config: StatCategoryConfig; yearlyRows: YearlyStats[]; careerTotals: StatTotals }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-primary/15 bg-background/70">
            <div className="border-b border-primary/10 px-4 py-3">
                <h3 className="text-sm font-semibold text-text">{config.label}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                    <thead>
                        <tr className="border-b border-primary/10 bg-primary/5 text-text/60">
                            <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide">Year</th>
                            {config.columns.map((column) => (
                                <th key={column.label} className="px-3 py-2 text-center font-semibold uppercase tracking-wide whitespace-nowrap">
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {yearlyRows.map((row) => (
                            <tr key={`${config.key}-${row.year}`} className="border-b border-primary/10 last:border-b-0 hover:bg-primary/5 transition-colors">
                                <td className="px-3 py-2 font-medium text-text">{row.year || '—'}</td>
                                {config.columns.map((column) => (
                                    <td key={column.label} className="px-3 py-2 text-center tabular-nums text-text/80 whitespace-nowrap">
                                        {column.render(row)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        <tr className="bg-primary/10 font-semibold text-text">
                            <td className="px-3 py-2">Career</td>
                            {config.columns.map((column) => (
                                <td key={column.label} className="px-3 py-2 text-center tabular-nums whitespace-nowrap">
                                    {column.render(careerTotals)}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export function PlayerCard({ playerId, dynastyId, isOpen, onClose, schoolColors }: PlayerCardProps) {
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
    const secondaryTextColor = getContrastTextColor(schoolColors.secondary, 'var(--color-text)')

    const { yearlyRows, careerTotals } = useMemo(() => aggregateCareerRows(careerStats), [careerStats])
    const visibleStatSections = useMemo(
        () => statCategoryConfigs.filter((config) => config.show(careerTotals)),
        [careerTotals]
    )

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
                <CardHeader
                    className="gap-4 border-b border-primary/10 pb-4"
                    style={{
                        background: `linear-gradient(135deg, ${schoolColors.primary} 0%, ${schoolColors.secondary} 100%)`,
                        color: headerTextColor,
                    }}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <PlayerAvatar src={player?.avatar_url} alt={player?.name ?? 'Player'} size={72} className="border-white/25 bg-white/10" />
                            <div className="min-w-0 space-y-2">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="truncate text-xl font-semibold sm:text-2xl">{player?.name ?? 'Loading player...'}</h2>
                                        {currentSeason?.rating != null && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-black/15 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
                                                <Star className="h-3.5 w-3.5" />
                                                {currentSeason.rating} OVR
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm opacity-90">
                                        {currentSeason?.jersey_number != null ? `#${currentSeason.jersey_number} • ` : ''}
                                        {player?.position ?? '—'}
                                        {currentSeason?.year ? ` • ${currentSeason.year}` : ''}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    {currentSeason?.dev_trait && (
                                        <span className={cn('rounded-full px-2.5 py-1 font-semibold', traitColor)}>
                                            {currentSeason.dev_trait}
                                        </span>
                                    )}
                                    {currentSeason?.record_year != null && currentSeason.record_year > 0 && (
                                        <span className="rounded-full px-2.5 py-1 font-medium backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                                            Season {currentSeason.record_year}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="border-white/25 bg-black/10 text-xs font-semibold hover:bg-black/20"
                            style={{ color: headerTextColor }}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close player card</span>
                        </Button>
                    </div>
                </CardHeader>

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
                            {activeTab === 'Career Stats' && (
                                <div className="space-y-4">
                                    {visibleStatSections.length === 0 ? (
                                        <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-10 text-center text-sm text-text/60">
                                            No career stats recorded yet.
                                        </div>
                                    ) : (
                                        visibleStatSections.map((config) => (
                                            <CareerStatsSection
                                                key={config.key}
                                                config={config}
                                                yearlyRows={yearlyRows.filter((row) => config.show(row))}
                                                careerTotals={careerTotals}
                                            />
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'Awards' && (
                                <div className="rounded-2xl border border-primary/15 bg-background/70">
                                    {awards.length === 0 ? (
                                        <div className="px-4 py-10 text-center text-sm text-text/60">
                                            No awards recorded for this player.
                                        </div>
                                    ) : (
                                        awards.map((award) => (
                                            <div key={award.id} className="flex items-start gap-3 border-b border-primary/10 px-4 py-3 text-sm last:border-b-0 hover:bg-primary/5 transition-colors">
                                                <div className="rounded-full bg-primary/10 p-2 text-primary">
                                                    <Trophy className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="font-medium text-text">{award.award_name}</div>
                                                    <div className="text-xs text-text/60">{award.team || 'Team not set'}</div>
                                                </div>
                                                <div className="shrink-0 text-xs font-semibold text-text/60">{award.year}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'Player Info' && (
                                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                                    <div className="space-y-4">
                                        <div className="rounded-2xl border border-primary/15 bg-background/70">
                                            <div className="border-b border-primary/10 px-4 py-3">
                                                <h3 className="text-sm font-semibold text-text">Player Details</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 px-4 py-4 text-sm sm:grid-cols-3">
                                                <InfoField label="Position" value={player.position} />
                                                <InfoField label="Class" value={currentSeason?.year} />
                                                <InfoField label="Jersey #" value={currentSeason?.jersey_number?.toString()} />
                                                <InfoField label="Rating" value={currentSeason?.rating != null ? `${currentSeason.rating}` : null} />
                                                <InfoField label="Dev Trait" value={currentSeason?.dev_trait} />
                                                <InfoField label="Height" value={player.height} />
                                                <InfoField label="Weight" value={player.weight != null ? `${player.weight} lbs` : null} />
                                                <InfoField label="Redshirt" value={currentSeason ? (currentSeason.is_redshirted ? 'Yes' : 'No') : null} />
                                                <InfoField label="Career Seasons" value={career.length ? `${career.length}` : null} />
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-primary/15 bg-background/70">
                                            <div className="border-b border-primary/10 px-4 py-3">
                                                <h3 className="text-sm font-semibold text-text">Notes</h3>
                                            </div>
                                            <div className="px-4 py-4 text-sm text-text/80">
                                                {currentSeason?.notes?.trim() ? currentSeason.notes : 'No notes recorded for the current season.'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="rounded-2xl border border-primary/15 bg-background/70">
                                            <div className="border-b border-primary/10 px-4 py-3">
                                                <h3 className="text-sm font-semibold text-text">Origin</h3>
                                            </div>
                                            {!origin ? (
                                                <div className="px-4 py-6 text-sm text-text/60">No recruiting or transfer origin found.</div>
                                            ) : origin.type === 'recruit' ? (
                                                <div className="space-y-4 px-4 py-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: schoolColors.secondary, color: secondaryTextColor }}>
                                                            <Star className="h-3.5 w-3.5" />
                                                            {origin.data.stars ?? '—'} Star Recruit
                                                        </span>
                                                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">Recruit</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                        <InfoField label="State" value={origin.data.state} compact />
                                                        <InfoField label="Nat Rank" value={origin.data.national_rank?.toString()} compact />
                                                        <InfoField label="State Rank" value={origin.data.state_rank?.toString()} compact />
                                                        <InfoField label="Pos Rank" value={origin.data.position_rank?.toString()} compact />
                                                        <InfoField label="Height" value={origin.data.height} compact />
                                                        <InfoField label="Weight" value={origin.data.weight != null ? `${origin.data.weight} lbs` : null} compact />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4 px-4 py-4 text-sm">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">Transfer</span>
                                                        {origin.data.stars != null && (
                                                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: schoolColors.secondary, color: secondaryTextColor }}>
                                                                <Star className="h-3.5 w-3.5" />
                                                                {origin.data.stars} Star
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                        <InfoField label="School" value={origin.data.school} compact />
                                                        <InfoField
                                                            label="Direction"
                                                            value={origin.data.transfer_direction === 'From' ? 'Arrived From' : 'Transferred To'}
                                                            compact
                                                        />
                                                        <InfoField label="Position" value={origin.data.position} compact />
                                                        <InfoField label="Height" value={origin.data.height} compact />
                                                        <InfoField label="Weight" value={origin.data.weight != null ? `${origin.data.weight} lbs` : null} compact />
                                                        <InfoField label="Dev Trait" value={origin.data.dev_trait} compact />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function InfoField({ label, value, compact = false }: { label: string; value?: string | null; compact?: boolean }) {
    return (
        <div className={compact ? 'space-y-1 rounded-xl border border-primary/10 bg-primary/5 px-3 py-2' : 'space-y-1'}>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-text/50">{label}</div>
            <div className="text-sm font-medium text-text">{value || '—'}</div>
        </div>
    )
}
