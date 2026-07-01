'use client'

import { useMemo, useState } from 'react'

import type { DraftedPlayer } from '@/dal/features/drafted-players'
import { PlayerService, type RosterPlayer } from '@/dal/features/players'
import type { Recruit } from '@/dal/features/recruits'
import type { Transfer } from '@/dal/features/transfers'
import { Button } from '@/components/ui/display/button'
import { FilterTabs } from '@/components/ui/layout/filter-tabs'
import { Input } from '@/components/ui/form/input'
import { PlayerAvatar } from '@/components/ui/display/player-avatar'
import { Select } from '@/components/ui/form/select'
import { devTraitColors, positions, recruitPositionGroups, type DevTrait } from '@/lib/config/player-config'

type PositionGroupKey = keyof typeof recruitPositionGroups

type PlayerStatus = 'Returning' | 'Graduating' | 'Transfer Out' | 'Draft' | 'TR In' | 'FR In'

type DepthChartItem = {
    key: string
    kind: 'roster' | 'transfer' | 'recruit'
    name: string
    position: string
    year: string
    rating: number | null
    devTrait: string | null
    avatarUrl: string | null
    jerseyNumber: number | null
    depthChartOrder: number | null
    status: PlayerStatus
    detail?: string
    player: RosterPlayer | null
}

interface DepthChartProps {
    roster: RosterPlayer[]
    editable?: boolean
    transfers?: Transfer[]
    recruits?: Recruit[]
    draftedPlayers?: DraftedPlayer[]
    onRosterUpdate?: (updated: RosterPlayer[]) => void
    onTransferOut?: (player: RosterPlayer) => void
    onPlayerClick?: (player: RosterPlayer) => void
    schoolName?: string
}

const positionGroupKeys = Object.keys(recruitPositionGroups) as PositionGroupKey[]
const groupTabs = positionGroupKeys.map((group) => ({
    key: group,
    label: group === 'Other' ? 'ATH' : group,
}))

const statusClasses: Record<PlayerStatus, string> = {
    Returning: 'bg-primary/10 text-text/70',
    Graduating: 'bg-red-500/15 text-red-600',
    'Transfer Out': 'bg-red-500/15 text-red-600',
    Draft: 'bg-red-500/15 text-red-600',
    'TR In': 'bg-green-500/15 text-green-700',
    'FR In': 'bg-green-500/15 text-green-700',
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
    if (!devTrait || devTrait === 'Normal') {
        return 'bg-primary/5 text-text/55'
    }

    return devTraitColors[devTrait as DevTrait] ?? 'bg-primary/10 text-text/70'
}

function compareDepthChartItems(a: DepthChartItem, b: DepthChartItem) {
    if (a.depthChartOrder !== null && b.depthChartOrder !== null && a.depthChartOrder !== b.depthChartOrder) {
        return a.depthChartOrder - b.depthChartOrder
    }

    if (a.depthChartOrder !== null) return -1
    if (b.depthChartOrder !== null) return 1

    const ratingDiff = (b.rating ?? -1) - (a.rating ?? -1)
    if (ratingDiff !== 0) return ratingDiff

    return a.name.localeCompare(b.name)
}

export function DepthChart({
    roster,
    editable = false,
    transfers = [],
    recruits = [],
    draftedPlayers = [],
    onRosterUpdate,
    onTransferOut,
    onPlayerClick,
    schoolName,
}: DepthChartProps) {
    const [selectedGroupPreference, setSelectedGroupPreference] = useState<PositionGroupKey>(positionGroupKeys[0] ?? 'Offense')
    const [selectedPositionPreference, setSelectedPositionPreference] = useState<string>(recruitPositionGroups[positionGroupKeys[0] ?? 'Offense'][0])
    const [ratingDrafts, setRatingDrafts] = useState<Record<string, string>>({})
    const [busyLabels, setBusyLabels] = useState<Record<string, string>>({})

    const transferOutNames = useMemo(
        () => new Set(transfers.filter((transfer) => transfer.transfer_direction === 'To').map((transfer) => normalizeName(transfer.player_name))),
        [transfers]
    )
    const draftedNames = useMemo(
        () => new Set(draftedPlayers.map((player) => normalizeName(player.player_name))),
        [draftedPlayers]
    )

    const items = useMemo<DepthChartItem[]>(() => {
        const rosterItems = roster.map((player) => {
            const normalized = normalizeName(player.name)
            let status: PlayerStatus = 'Returning'

            if (draftedNames.has(normalized)) {
                status = 'Draft'
            } else if (transferOutNames.has(normalized)) {
                status = 'Transfer Out'
            } else if (isGraduatingPlayer(player)) {
                status = 'Graduating'
            }

            return {
                key: `roster-${player.id}`,
                kind: 'roster' as const,
                name: player.name,
                position: player.position,
                year: player.season.year ?? '—',
                rating: player.season.rating,
                devTrait: player.season.dev_trait,
                avatarUrl: player.avatar_url,
                jerseyNumber: player.season.jersey_number,
                depthChartOrder: player.season.depth_chart_order,
                status,
                player,
            }
        })

        const incomingTransfers = transfers
            .filter((transfer) => transfer.transfer_direction === 'From')
            .map((transfer) => ({
                key: `transfer-${transfer.id}`,
                kind: 'transfer' as const,
                name: transfer.player_name,
                position: transfer.position,
                year: 'TR',
                rating: null,
                devTrait: transfer.dev_trait,
                avatarUrl: null,
                jerseyNumber: null,
                depthChartOrder: null,
                status: 'TR In' as const,
                detail: transfer.school ? `From ${transfer.school}` : 'Incoming transfer',
                player: null,
            }))

        const incomingRecruits = recruits.map((recruit) => ({
            key: `recruit-${recruit.id}`,
            kind: 'recruit' as const,
            name: recruit.name,
            position: recruit.position,
            year: 'FR',
            rating: null,
            devTrait: recruit.dev_trait,
            avatarUrl: null,
            jerseyNumber: null,
            depthChartOrder: null,
            status: 'FR In' as const,
            detail: recruit.stars ? `${recruit.stars}★ recruit` : 'Incoming recruit',
            player: null,
        }))

        return [...rosterItems, ...incomingTransfers, ...incomingRecruits]
    }, [draftedNames, recruits, roster, transfers, transferOutNames])

    const positionCounts = useMemo(() => {
        return items.reduce<Record<string, number>>((counts, item) => {
            counts[item.position] = (counts[item.position] ?? 0) + 1
            return counts
        }, {})
    }, [items])

    const firstGroupWithPlayers = useMemo(
        () => positionGroupKeys.find((group) => recruitPositionGroups[group].some((position) => (positionCounts[position] ?? 0) > 0)) ?? positionGroupKeys[0],
        [positionCounts]
    )

    const selectedGroup = useMemo(() => {
        const preferredHasPlayers = recruitPositionGroups[selectedGroupPreference].some((position) => (positionCounts[position] ?? 0) > 0)
        if (preferredHasPlayers || !items.length) {
            return selectedGroupPreference
        }

        return firstGroupWithPlayers
    }, [firstGroupWithPlayers, items.length, positionCounts, selectedGroupPreference])

    const positionOptions = useMemo(() => {
        return recruitPositionGroups[selectedGroup].map((position) => ({
            position,
            count: positionCounts[position] ?? 0,
        }))
    }, [positionCounts, selectedGroup])

    const selectedPosition = useMemo(() => {
        const groupPositions = recruitPositionGroups[selectedGroup]
        if (groupPositions.includes(selectedPositionPreference)) {
            const selectedHasPlayers = (positionCounts[selectedPositionPreference] ?? 0) > 0
            if (selectedHasPlayers || !items.length) {
                return selectedPositionPreference
            }
        }

        return groupPositions.find((position) => (positionCounts[position] ?? 0) > 0) ?? groupPositions[0]
    }, [items.length, positionCounts, selectedGroup, selectedPositionPreference])

    const selectedItems = useMemo(() => {
        return items
            .filter((item) => item.position === selectedPosition)
            .sort(compareDepthChartItems)
    }, [items, selectedPosition])

    const returningCount = useMemo(
        () => items.filter((item) => item.kind === 'roster' && item.status === 'Returning').length,
        [items]
    )
    const incomingCount = useMemo(
        () => items.filter((item) => item.status === 'TR In' || item.status === 'FR In').length,
        [items]
    )
    const projectedRosterCount = returningCount + incomingCount
    const hasProjectionContext = editable || transfers.length > 0 || recruits.length > 0 || draftedPlayers.length > 0
    const displayedRosterCount = hasProjectionContext ? projectedRosterCount : roster.length
    const overCapBy = displayedRosterCount - 85

    const updateBusyLabel = (playerId: string, label: string | null) => {
        setBusyLabels((current) => {
            const next = { ...current }

            if (label) {
                next[playerId] = label
            } else {
                delete next[playerId]
            }

            return next
        })
    }

    const clearRatingDraft = (playerId: string) => {
        setRatingDrafts((current) => {
            if (!(playerId in current)) return current

            const next = { ...current }
            delete next[playerId]
            return next
        })
    }

    const pushRosterUpdate = (updated: RosterPlayer[]) => {
        onRosterUpdate?.(updated)
    }

    const handlePositionChange = async (player: RosterPlayer, nextPosition: string) => {
        if (player.position === nextPosition || busyLabels[player.id]) return

        updateBusyLabel(player.id, 'Saving...')
        try {
            await PlayerService.updatePlayer(player.id, { position: nextPosition })
            pushRosterUpdate(
                roster.map((currentPlayer) => (
                    currentPlayer.id === player.id
                        ? { ...currentPlayer, position: nextPosition }
                        : currentPlayer
                ))
            )
        } catch (err) {
            console.error('Failed to update player position:', err)
        } finally {
            updateBusyLabel(player.id, null)
        }
    }

    const handleRatingCommit = async (player: RosterPlayer, rawValue: string) => {
        if (busyLabels[player.id]) return

        const nextRating = parseRating(rawValue)
        if (typeof nextRating === 'undefined') {
            clearRatingDraft(player.id)
            return
        }

        if (nextRating === player.season.rating) {
            clearRatingDraft(player.id)
            return
        }

        updateBusyLabel(player.id, 'Saving...')
        try {
            await PlayerService.updatePlayerSeason(player.season.id, { rating: nextRating })
            pushRosterUpdate(
                roster.map((currentPlayer) => (
                    currentPlayer.id === player.id
                        ? { ...currentPlayer, season: { ...currentPlayer.season, rating: nextRating } }
                        : currentPlayer
                ))
            )
        } catch (err) {
            console.error('Failed to update player rating:', err)
        } finally {
            clearRatingDraft(player.id)
            updateBusyLabel(player.id, null)
        }
    }

    const handleCutPlayer = async (player: RosterPlayer) => {
        if (busyLabels[player.id]) return
        if (!window.confirm(`Cut ${player.name} from the roster?`)) return

        updateBusyLabel(player.id, 'Cutting...')
        try {
            await PlayerService.deletePlayer(player.id)
            pushRosterUpdate(roster.filter((currentPlayer) => currentPlayer.id !== player.id))
            clearRatingDraft(player.id)
        } catch (err) {
            console.error('Failed to cut player:', err)
        } finally {
            updateBusyLabel(player.id, null)
        }
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-primary/15 bg-background/80">
            <div className="border-b border-primary/10 px-3 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold text-text">Depth Chart</h3>
                        <p className="text-[10px] text-text/55">
                            {schoolName ? `${schoolName} • ` : ''}
                            {hasProjectionContext ? 'Projected roster count' : 'Current roster count'}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className={`text-sm font-semibold ${overCapBy > 0 ? 'text-red-600' : 'text-text'}`}>
                            {displayedRosterCount}/85
                        </p>
                        <p className={`text-[10px] ${overCapBy > 0 ? 'text-red-500' : 'text-text/50'}`}>
                            {overCapBy > 0 ? `Over the cap by ${overCapBy}` : `${85 - displayedRosterCount} spot${85 - displayedRosterCount === 1 ? '' : 's'} open`}
                        </p>
                    </div>
                </div>

                <div className="mt-3 space-y-2">
                    <FilterTabs
                        tabs={groupTabs}
                        active={selectedGroup}
                        onChange={(group) => {
                            setSelectedGroupPreference(group)
                            setSelectedPositionPreference(recruitPositionGroups[group][0])
                        }}
                    />

                    <Select
                        value={selectedPosition}
                        onChange={(event) => setSelectedPositionPreference(event.target.value)}
                        className="h-9 text-base sm:text-sm"
                        aria-label="Select depth chart position"
                    >
                        {positionOptions.map((option) => (
                            <option key={option.position} value={option.position}>
                                {option.position} ({option.count} {option.count === 1 ? 'player' : 'players'})
                            </option>
                        ))}
                    </Select>

                    {editable && (
                        <p className="text-[10px] text-text/45">
                            Position changes save instantly. OVR changes save when the field loses focus.
                        </p>
                    )}
                </div>
            </div>

            <div className="grid gap-3 px-3 py-3 md:grid-cols-2 xl:grid-cols-3">
                {selectedItems.length > 0 ? selectedItems.map((item) => {
                    const rosterPlayer = item.player
                    const isEditablePlayer = editable && item.kind === 'roster' && rosterPlayer !== null && item.status === 'Returning'
                    const busyLabel = rosterPlayer ? busyLabels[rosterPlayer.id] : null
                    const ratingValue = rosterPlayer
                        ? (ratingDrafts[rosterPlayer.id] ?? (rosterPlayer.season.rating?.toString() ?? ''))
                        : ''
                    const showStatusBadge = editable || item.status !== 'Returning'
                    const isClickable = !editable && item.kind === 'roster' && rosterPlayer !== null && onPlayerClick
                    const details = [item.position, item.year, item.jerseyNumber !== null ? `#${item.jerseyNumber}` : null]
                        .filter(Boolean)
                        .join(' • ')
                    const cardClasses = `rounded-xl border border-primary/10 bg-background/70 p-3 text-left transition-colors ${isClickable ? 'cursor-pointer hover:border-primary/25 hover:bg-primary/5' : ''}`

                    const content = (
                        <>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <PlayerAvatar src={item.avatarUrl} alt={item.name} size={36} />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-text">{item.name}</p>
                                        <p className="text-[10px] text-text/55">{details || item.detail || '—'}</p>
                                        {item.detail && item.kind !== 'roster' && (
                                            <p className="text-[10px] text-text/45">{item.detail}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-sm font-bold text-text">{item.rating ?? '—'}</p>
                                    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${getTraitClasses(item.devTrait)}`}>
                                        {item.devTrait ?? 'Normal'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                {showStatusBadge && (
                                    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${statusClasses[item.status]}`}>
                                        {item.status}
                                    </span>
                                )}
                                {busyLabel && <span className="text-[10px] text-text/45">{busyLabel}</span>}
                            </div>

                            {isEditablePlayer && rosterPlayer && (
                                <div className="mt-3 grid gap-2 sm:grid-cols-[92px_minmax(0,1fr)]">
                                    <div>
                                        <p className="mb-1 text-[10px] text-text/45">OVR</p>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={99}
                                            value={ratingValue}
                                            onChange={(event) => setRatingDrafts((current) => ({
                                                ...current,
                                                [rosterPlayer.id]: event.target.value,
                                            }))}
                                            onBlur={(event) => handleRatingCommit(rosterPlayer, event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter') {
                                                    event.currentTarget.blur()
                                                }
                                            }}
                                            disabled={Boolean(busyLabel)}
                                            className="h-8 text-base sm:text-xs"
                                            aria-label={`Change overall rating for ${item.name}`}
                                        />
                                    </div>

                                    <div>
                                        <p className="mb-1 text-[10px] text-text/45">Position</p>
                                        <Select
                                            value={rosterPlayer.position}
                                            onChange={(event) => handlePositionChange(rosterPlayer, event.target.value)}
                                            disabled={Boolean(busyLabel)}
                                            className="h-8 text-base sm:text-xs"
                                            aria-label={`Change position for ${item.name}`}
                                        >
                                            {positions.map((position) => (
                                                <option key={position} value={position}>
                                                    {position}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onTransferOut?.(rosterPlayer)}
                                            disabled={Boolean(busyLabel) || !onTransferOut}
                                            className="h-8 px-3 text-[10px] font-semibold"
                                        >
                                            Transfer
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="delete"
                                            size="sm"
                                            onClick={() => handleCutPlayer(rosterPlayer)}
                                            disabled={Boolean(busyLabel)}
                                            className="h-8 px-3 text-[10px] font-semibold"
                                        >
                                            Cut
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )

                    if (isClickable && rosterPlayer) {
                        return (
                            <button
                                key={item.key}
                                type="button"
                                className={cardClasses}
                                onClick={() => onPlayerClick(rosterPlayer)}
                            >
                                {content}
                            </button>
                        )
                    }

                    return (
                        <div key={item.key} className={cardClasses}>
                            {content}
                        </div>
                    )
                }) : (
                    <div className="rounded-xl border border-dashed border-primary/15 bg-background/50 px-3 py-6 text-center text-xs text-text/55 md:col-span-2 xl:col-span-3">
                        No {selectedPosition} players available.
                    </div>
                )}
            </div>
        </div>
    )
}
