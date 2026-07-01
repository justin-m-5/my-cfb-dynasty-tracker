'use client'

import { useMemo, useState } from 'react'

import type { DraftedPlayer } from '@/dal/features/drafted-players'
import { PlayerService, type RosterPlayer } from '@/dal/features/players'
import type { Recruit } from '@/dal/features/recruits'
import type { Transfer } from '@/dal/features/transfers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { FilterTabs } from '@/components/ui/filter-tabs'
import { devTraitColors, recruitPositionGroups, positions, type DevTrait } from '@/lib/player-config'

interface RosterManagementProps {
    roster: RosterPlayer[]
    transfers: Transfer[]
    recruits: Recruit[]
    draftedPlayers: DraftedPlayer[]
    onRosterUpdate: (updated: RosterPlayer[]) => void
}

type RosterStatus = 'Returning' | 'Incoming Transfer' | 'Incoming Recruit' | 'Graduating' | 'Transfer Out' | 'Draft'

type DepthChartItem = {
    id: string
    kind: 'roster' | 'transfer' | 'recruit'
    name: string
    position: string
    year: string
    rating: number | null
    devTrait: string | null
    status: RosterStatus
    player?: RosterPlayer
}

const statusStyles: Record<RosterStatus, string> = {
    Returning: 'bg-primary/10 text-text/70',
    'Incoming Transfer': 'bg-green-500/15 text-green-700',
    'Incoming Recruit': 'bg-green-500/15 text-green-700',
    Graduating: 'bg-red-500/15 text-red-600',
    'Transfer Out': 'bg-red-500/15 text-red-600',
    Draft: 'bg-red-500/15 text-red-600',
}

const statusLabels: Record<RosterStatus, string> = {
    Returning: '',
    'Incoming Transfer': 'TR In',
    'Incoming Recruit': 'FR In',
    Graduating: 'Grad',
    'Transfer Out': 'TR Out',
    Draft: 'Draft',
}

function normalizeName(value: string) {
    return value.trim().toLowerCase()
}

function isGraduatingPlayer(player: RosterPlayer) {
    return player.season.year === 'SR' || player.season.year === 'SR (RS)'
}

function parseRating(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return null
    const parsed = Number.parseInt(trimmed, 10)
    if (!Number.isFinite(parsed)) return undefined
    return Math.max(0, Math.min(99, parsed))
}

function getTraitClasses(devTrait: string | null) {
    if (!devTrait || devTrait === 'Normal') return 'text-text/40'
    return devTraitColors[devTrait as DevTrait] ?? 'text-text/60'
}

export function RosterManagement({
    roster,
    transfers,
    recruits,
    draftedPlayers,
    onRosterUpdate,
}: RosterManagementProps) {
    const [positionGroupFilter, setPositionGroupFilter] = useState<string>('Offense')
    const [ratingDrafts, setRatingDrafts] = useState<Record<string, string>>({})
    const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
    const [confirmCutId, setConfirmCutId] = useState<string | null>(null)

    const transferOutNames = useMemo(
        () => new Set(transfers.filter(t => t.transfer_direction === 'To').map(t => normalizeName(t.player_name))),
        [transfers]
    )
    const draftedNames = useMemo(
        () => new Set(draftedPlayers.map(p => normalizeName(p.player_name))),
        [draftedPlayers]
    )

    // Build all items with status
    const allItems = useMemo<DepthChartItem[]>(() => {
        const rosterItems: DepthChartItem[] = roster.map(player => {
            const normalized = normalizeName(player.name)
            let status: RosterStatus = 'Returning'
            if (draftedNames.has(normalized)) status = 'Draft'
            else if (transferOutNames.has(normalized)) status = 'Transfer Out'
            else if (isGraduatingPlayer(player)) status = 'Graduating'

            return {
                id: player.id,
                kind: 'roster',
                name: player.name,
                position: player.position,
                year: player.season.year ?? '—',
                rating: player.season.rating,
                devTrait: player.season.dev_trait,
                status,
                player,
            }
        })

        const incomingTransfers: DepthChartItem[] = transfers
            .filter(t => t.transfer_direction === 'From')
            .map(t => ({
                id: `tr-${t.id}`,
                kind: 'transfer',
                name: t.player_name,
                position: t.position,
                year: 'TR',
                rating: null,
                devTrait: t.dev_trait,
                status: 'Incoming Transfer' as const,
            }))

        const incomingRecruits: DepthChartItem[] = recruits.map(r => ({
            id: `rc-${r.id}`,
            kind: 'recruit',
            name: r.name,
            position: r.position,
            year: 'FR',
            rating: null,
            devTrait: r.dev_trait,
            status: 'Incoming Recruit' as const,
        }))

        return [...rosterItems, ...incomingTransfers, ...incomingRecruits]
    }, [draftedNames, recruits, roster, transfers, transferOutNames])

    // Group by position, sorted by rating (depth chart style)
    const depthChart = useMemo(() => {
        const groupPositions = (recruitPositionGroups as Record<string, readonly string[]>)[positionGroupFilter] ?? []
        const filtered = allItems.filter(item => groupPositions.includes(item.position))

        const groups: Record<string, DepthChartItem[]> = {}
        // Initialize in position order from the group
        for (const pos of groupPositions) {
            groups[pos] = []
        }
        for (const item of filtered) {
            if (!groups[item.position]) groups[item.position] = []
            groups[item.position].push(item)
        }

        // Sort within each position by rating desc
        for (const pos of Object.keys(groups)) {
            groups[pos].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1))
        }

        // Return in position order (matching the group definition)
        return Object.entries(groups).filter(([, players]) => players.length > 0)
    }, [allItems, positionGroupFilter])

    const returningCount = allItems.filter(i => i.status === 'Returning').length
    const incomingCount = allItems.filter(i => i.status === 'Incoming Transfer' || i.status === 'Incoming Recruit').length
    const projectedCount = returningCount + incomingCount
    const overCap = projectedCount - 85

    const markBusy = (id: string, busy: boolean) => {
        setBusyIds(prev => {
            const next = new Set(prev)
            busy ? next.add(id) : next.delete(id)
            return next
        })
    }

    const handlePositionChange = async (player: RosterPlayer, nextPosition: string) => {
        if (player.position === nextPosition || busyIds.has(player.id)) return
        markBusy(player.id, true)
        try {
            await PlayerService.updatePlayer(player.id, { position: nextPosition })
            onRosterUpdate(roster.map(p => p.id === player.id ? { ...p, position: nextPosition } : p))
        } catch (err) {
            console.error('Position update failed:', err)
        } finally {
            markBusy(player.id, false)
        }
    }

    const handleRatingCommit = async (player: RosterPlayer, rawValue: string) => {
        if (busyIds.has(player.id)) return
        const nextRating = parseRating(rawValue)
        if (typeof nextRating === 'undefined') { clearDraft(player.id); return }
        if (nextRating === player.season.rating) { clearDraft(player.id); return }

        markBusy(player.id, true)
        try {
            await PlayerService.updatePlayerSeason(player.season.id, { rating: nextRating })
            onRosterUpdate(roster.map(p => p.id === player.id ? { ...p, season: { ...p.season, rating: nextRating } } : p))
        } catch (err) {
            console.error('Rating update failed:', err)
        } finally {
            clearDraft(player.id)
            markBusy(player.id, false)
        }
    }

    const handleCut = async (player: RosterPlayer) => {
        if (busyIds.has(player.id)) return
        markBusy(player.id, true)
        try {
            await PlayerService.deletePlayer(player.id)
            onRosterUpdate(roster.filter(p => p.id !== player.id))
            setConfirmCutId(null)
        } catch (err) {
            console.error('Cut player failed:', err)
        } finally {
            markBusy(player.id, false)
        }
    }

    const clearDraft = (id: string) => {
        setRatingDrafts(prev => {
            if (!(id in prev)) return prev
            const next = { ...prev }
            delete next[id]
            return next
        })
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-primary/15 bg-background/80">
            {/* Header */}
            <div className="border-b border-primary/10 px-3 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h3 className="text-sm font-semibold text-text">Depth Chart</h3>
                        <p className="text-[10px] text-text/55">
                            {returningCount} returning + {incomingCount} incoming
                        </p>
                    </div>
                    <div className="text-right">
                        <p className={`text-sm font-bold ${overCap > 0 ? 'text-red-600' : 'text-text'}`}>
                            {projectedCount}/85
                        </p>
                        {overCap > 0 && (
                            <p className="text-[10px] text-red-500">Cut {overCap} to advance</p>
                        )}
                    </div>
                </div>

                <FilterTabs
                    tabs={Object.keys(recruitPositionGroups).map(group => ({
                        key: group,
                        label: group === 'Other' ? 'ATH' : group,
                    }))}
                    active={positionGroupFilter}
                    onChange={setPositionGroupFilter}
                    className="mt-2"
                />
            </div>

            {/* Depth Chart */}
            <div className="divide-y divide-primary/10">
                {depthChart.map(([position, players]) => (
                    <div key={position} className="px-3 py-2">
                        <div className="mb-1.5 flex items-center gap-2">
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                {position}
                            </span>
                            <span className="text-[10px] text-text/40">{players.length} player{players.length !== 1 ? 's' : ''}</span>
                        </div>

                        <div className="space-y-1">
                            {players.map((item, depth) => {
                                const isEditable = item.kind === 'roster' && item.status === 'Returning'
                                const isBusy = busyIds.has(item.id)
                                const ratingValue = item.player
                                    ? (ratingDrafts[item.player.id] ?? (item.player.season.rating?.toString() ?? ''))
                                    : ''

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-primary/5"
                                    >
                                        {/* Depth number */}
                                        <span className="w-4 shrink-0 text-center text-[10px] font-bold text-text/30">
                                            {depth + 1}
                                        </span>

                                        {/* Name + year */}
                                        <div className="min-w-0 flex-1">
                                            <span className="text-xs font-semibold text-text">{item.name}</span>
                                            <span className="ml-1.5 text-[10px] text-text/45">{item.year}</span>
                                        </div>

                                        {/* Dev trait */}
                                        {item.devTrait && item.devTrait !== 'Normal' && (
                                            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${getTraitClasses(item.devTrait)}`}>
                                                {item.devTrait}
                                            </span>
                                        )}

                                        {/* Rating */}
                                        {isEditable && item.player ? (
                                            <Input
                                                type="number"
                                                min={0}
                                                max={99}
                                                value={ratingValue}
                                                onChange={(e) => setRatingDrafts(prev => ({ ...prev, [item.player!.id]: e.target.value }))}
                                                onBlur={(e) => handleRatingCommit(item.player!, e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                                                disabled={isBusy}
                                                className="h-7 w-12 text-center text-xs"
                                                aria-label={`OVR for ${item.name}`}
                                            />
                                        ) : (
                                            <span className="w-12 text-center text-xs font-bold text-text">
                                                {item.rating ?? '—'}
                                            </span>
                                        )}

                                        {/* Status badge (non-returning only) */}
                                        {item.status !== 'Returning' && (
                                            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${statusStyles[item.status]}`}>
                                                {statusLabels[item.status]}
                                            </span>
                                        )}

                                        {/* Position change */}
                                        {isEditable && item.player && (
                                            <Select
                                                value={item.player.position}
                                                onChange={(e) => handlePositionChange(item.player!, e.target.value)}
                                                disabled={isBusy}
                                                className="h-7 w-20 text-[10px]"
                                                aria-label={`Position for ${item.name}`}
                                            >
                                                {positions.map(p => <option key={p} value={p}>{p}</option>)}
                                            </Select>
                                        )}

                                        {/* Cut button */}
                                        {isEditable && item.player && (
                                            confirmCutId === item.player.id ? (
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="delete"
                                                        size="sm"
                                                        onClick={() => handleCut(item.player!)}
                                                        disabled={isBusy}
                                                        className="h-6 px-1.5 text-[9px]"
                                                    >
                                                        Yes
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setConfirmCutId(null)}
                                                        className="h-6 px-1.5 text-[9px]"
                                                    >
                                                        No
                                                    </Button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmCutId(item.player!.id)}
                                                    disabled={isBusy}
                                                    className="rounded px-1.5 py-0.5 text-[9px] font-semibold text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                                                >
                                                    Cut
                                                </button>
                                            )
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}

                {depthChart.length === 0 && (
                    <div className="px-3 py-6 text-center text-xs text-text/50">
                        No players found.
                    </div>
                )}
            </div>
        </div>
    )
}
