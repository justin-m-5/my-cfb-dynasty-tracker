'use client'

import { useMemo, useState } from 'react'

import type { DraftedPlayer } from '@/dal/features/drafted-players'
import { PlayerService, type RosterPlayer } from '@/dal/features/players'
import type { Recruit } from '@/dal/features/recruits'
import type { Transfer } from '@/dal/features/transfers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { devTraitColors, positionGroups, positions, type DevTrait } from '@/lib/player-config'

interface RosterManagementProps {
    roster: RosterPlayer[]
    transfers: Transfer[]
    recruits: Recruit[]
    draftedPlayers: DraftedPlayer[]
    onRosterUpdate: (updated: RosterPlayer[]) => void
}

type RosterStatus = 'Returning' | 'Incoming Transfer' | 'Incoming Recruit' | 'Graduating' | 'Transfer Out' | 'Draft'
type StatusFilter = 'All' | 'Returning' | 'Incoming' | 'Leaving'
type PositionGroupFilter = 'All' | keyof typeof positionGroups

type RosterItem =
    | {
        key: string
        kind: 'roster'
        name: string
        position: string
        year: string
        rating: number | null
        devTrait: string | null
        status: RosterStatus
        player: RosterPlayer
    }
    | {
        key: string
        kind: 'transfer'
        name: string
        position: string
        year: string
        rating: number | null
        devTrait: string | null
        status: RosterStatus
        transfer: Transfer
    }
    | {
        key: string
        kind: 'recruit'
        name: string
        position: string
        year: string
        rating: number | null
        devTrait: string | null
        status: RosterStatus
        recruit: Recruit
    }

const statusFilterOptions: StatusFilter[] = ['All', 'Returning', 'Incoming', 'Leaving']
const positionGroupOptions: PositionGroupFilter[] = ['All', ...(Object.keys(positionGroups) as Array<keyof typeof positionGroups>)]

const statusRank: Record<RosterStatus, number> = {
    Returning: 0,
    'Incoming Transfer': 1,
    'Incoming Recruit': 2,
    Draft: 3,
    'Transfer Out': 4,
    Graduating: 5,
}

const statusStyles: Record<RosterStatus, string> = {
    Returning: 'bg-primary/10 text-text/70',
    'Incoming Transfer': 'bg-green-500/15 text-green-700',
    'Incoming Recruit': 'bg-green-500/15 text-green-700',
    Graduating: 'bg-red-500/15 text-red-600',
    'Transfer Out': 'bg-red-500/15 text-red-600',
    Draft: 'bg-red-500/15 text-red-600',
}

const statusNotes: Record<Exclude<RosterStatus, 'Returning'>, string> = {
    'Incoming Transfer': 'Incoming players carry in automatically.',
    'Incoming Recruit': 'Incoming players carry in automatically.',
    Graduating: 'This player already leaves after the season.',
    'Transfer Out': 'This player already leaves after the season.',
    Draft: 'This player already leaves after the season.',
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

function getStatusFilterMatch(status: RosterStatus, filter: StatusFilter) {
    if (filter === 'All') return true
    if (filter === 'Returning') return status === 'Returning'
    if (filter === 'Incoming') return status === 'Incoming Transfer' || status === 'Incoming Recruit'
    return status === 'Graduating' || status === 'Transfer Out' || status === 'Draft'
}

function getTraitClasses(devTrait: string | null) {
    if (!devTrait || devTrait === 'Normal') {
        return 'bg-primary/5 text-text/55'
    }

    return devTraitColors[devTrait as DevTrait] ?? 'bg-primary/10 text-text/70'
}

export function RosterManagement({
    roster,
    transfers,
    recruits,
    draftedPlayers,
    onRosterUpdate,
}: RosterManagementProps) {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
    const [positionGroupFilter, setPositionGroupFilter] = useState<PositionGroupFilter>('All')
    const [ratingDrafts, setRatingDrafts] = useState<Record<string, string>>({})
    const [busyLabels, setBusyLabels] = useState<Record<string, string>>({})
    const [confirmCutId, setConfirmCutId] = useState<string | null>(null)

    const transferOutNames = useMemo(
        () => new Set(transfers.filter((transfer) => transfer.transfer_direction === 'To').map((transfer) => normalizeName(transfer.player_name))),
        [transfers]
    )
    const draftedNames = useMemo(
        () => new Set(draftedPlayers.map((player) => normalizeName(player.player_name))),
        [draftedPlayers]
    )

    const returningCount = useMemo(
        () => roster.filter((player) => {
            const normalized = normalizeName(player.name)

            return !isGraduatingPlayer(player) && !transferOutNames.has(normalized) && !draftedNames.has(normalized)
        }).length,
        [draftedNames, roster, transferOutNames]
    )
    const incomingCount = transfers.filter((transfer) => transfer.transfer_direction === 'From').length + recruits.length
    const leavingCount = roster.length - returningCount
    const projectedRosterCount = returningCount + incomingCount
    const overCapBy = projectedRosterCount - 85

    const items = useMemo<RosterItem[]>(() => {
        const rosterItems: RosterItem[] = roster.map((player) => {
            const normalized = normalizeName(player.name)
            let status: RosterStatus = 'Returning'

            if (draftedNames.has(normalized)) {
                status = 'Draft'
            } else if (transferOutNames.has(normalized)) {
                status = 'Transfer Out'
            } else if (isGraduatingPlayer(player)) {
                status = 'Graduating'
            }

            return {
                key: `roster-${player.id}`,
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

        const incomingTransfers: RosterItem[] = transfers
            .filter((transfer) => transfer.transfer_direction === 'From')
            .map((transfer) => ({
                key: `transfer-${transfer.id}`,
                kind: 'transfer',
                name: transfer.player_name,
                position: transfer.position,
                year: 'TR',
                rating: null,
                devTrait: transfer.dev_trait,
                status: 'Incoming Transfer',
                transfer,
            }))

        const incomingRecruits: RosterItem[] = recruits.map((recruit) => ({
            key: `recruit-${recruit.id}`,
            kind: 'recruit',
            name: recruit.name,
            position: recruit.position,
            year: 'FR',
            rating: null,
            devTrait: recruit.dev_trait,
            status: 'Incoming Recruit',
            recruit,
        }))

        return [...rosterItems, ...incomingTransfers, ...incomingRecruits].sort((a, b) => {
            const statusDiff = statusRank[a.status] - statusRank[b.status]
            if (statusDiff !== 0) return statusDiff

            const positionDiff = a.position.localeCompare(b.position)
            if (positionDiff !== 0) return positionDiff

            const ratingDiff = (b.rating ?? -1) - (a.rating ?? -1)
            if (ratingDiff !== 0) return ratingDiff

            return a.name.localeCompare(b.name)
        })
    }, [draftedNames, recruits, roster, transfers, transferOutNames])

    const filteredItems = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase()

        return items.filter((item) => {
            const matchesSearch = normalizedSearch.length === 0
                || item.name.toLowerCase().includes(normalizedSearch)
                || item.position.toLowerCase().includes(normalizedSearch)

            const matchesStatus = getStatusFilterMatch(item.status, statusFilter)
            const matchesGroup = positionGroupFilter === 'All' || positionGroups[positionGroupFilter].includes(item.position)

            return matchesSearch && matchesStatus && matchesGroup
        })
    }, [items, positionGroupFilter, search, statusFilter])

    const setBusyLabel = (playerId: string, label: string | null) => {
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

    const handlePositionChange = async (player: RosterPlayer, nextPosition: string) => {
        if (player.position === nextPosition || busyLabels[player.id]) return

        setBusyLabel(player.id, 'Saving...')
        try {
            await PlayerService.updatePlayer(player.id, { position: nextPosition })
            onRosterUpdate(
                roster.map((currentPlayer) => (
                    currentPlayer.id === player.id
                        ? { ...currentPlayer, position: nextPosition }
                        : currentPlayer
                ))
            )
        } catch (err) {
            console.error('Failed to update player position:', err)
        } finally {
            setBusyLabel(player.id, null)
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

        setBusyLabel(player.id, 'Saving...')
        try {
            await PlayerService.updatePlayerSeason(player.season.id, { rating: nextRating })
            onRosterUpdate(
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
            setBusyLabel(player.id, null)
        }
    }

    const handleCutPlayer = async (player: RosterPlayer) => {
        if (busyLabels[player.id]) return

        setBusyLabel(player.id, 'Cutting...')
        try {
            await PlayerService.deletePlayer(player.id)
            onRosterUpdate(roster.filter((currentPlayer) => currentPlayer.id !== player.id))
            setConfirmCutId(null)
            clearRatingDraft(player.id)
        } catch (err) {
            console.error('Failed to cut player:', err)
        } finally {
            setBusyLabel(player.id, null)
        }
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-primary/15 bg-background/80">
            <div className="border-b border-primary/10 px-3 py-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-semibold text-text">Roster Management</h3>
                        <p className="text-[10px] text-text/55">
                            {returningCount} returning • {incomingCount} incoming • {leavingCount} leaving
                        </p>
                    </div>
                    <div className="text-right">
                        <p className={`text-sm font-semibold ${overCapBy > 0 ? 'text-red-600' : 'text-text'}`}>
                            Roster: {projectedRosterCount}/85
                        </p>
                        <p className={`text-[10px] ${overCapBy > 0 ? 'text-red-500' : 'text-text/50'}`}>
                            {overCapBy > 0 ? `Over the cap by ${overCapBy}` : `${85 - projectedRosterCount} spot${85 - projectedRosterCount === 1 ? '' : 's'} open`}
                        </p>
                    </div>
                </div>

                <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_152px]">
                    <Input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search players or positions..."
                        aria-label="Search roster management players"
                        className="h-8 text-base sm:text-xs"
                    />
                    <Select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                        className="h-8 text-base sm:text-xs"
                        aria-label="Filter roster players by status"
                    >
                        {statusFilterOptions.map((option) => (
                            <option key={option} value={option}>
                                {option === 'All' ? 'All statuses' : option}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                    {positionGroupOptions.map((option) => {
                        const isActive = positionGroupFilter === option

                        return (
                            <Button
                                key={option}
                                type="button"
                                variant={isActive ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setPositionGroupFilter(option)}
                                className="h-7 px-2.5 text-[11px] font-semibold"
                            >
                                {option}
                            </Button>
                        )
                    })}
                </div>

                <p className="mt-2 text-[10px] text-text/45">
                    Position changes save instantly. Rating changes save when the field loses focus.
                </p>
            </div>

            <div className="hidden border-b border-primary/10 bg-primary/5 px-3 py-2 text-[10px] font-medium text-text/45 md:grid md:grid-cols-[minmax(0,1.6fr)_92px_64px_88px_88px_136px_200px] md:items-center">
                <span>Name</span>
                <span>Position</span>
                <span>Year</span>
                <span>OVR</span>
                <span>Dev</span>
                <span>Status</span>
                <span className="text-right">Actions</span>
            </div>

            <div>
                {filteredItems.length > 0 ? filteredItems.map((item) => {
                    const isEditable = item.kind === 'roster' && item.status === 'Returning'
                    const currentRatingValue = item.kind === 'roster'
                        ? (ratingDrafts[item.player.id] ?? (item.player.season.rating?.toString() ?? ''))
                        : ''
                    const busyLabel = item.kind === 'roster' ? busyLabels[item.player.id] : null

                    return (
                        <div
                            key={item.key}
                            className="grid grid-cols-2 gap-2 border-b border-primary/10 px-3 py-2 text-xs last:border-b-0 hover:bg-primary/5 md:grid-cols-[minmax(0,1.6fr)_92px_64px_88px_88px_136px_200px] md:items-center"
                        >
                            <div className="col-span-2 min-w-0 md:col-span-1">
                                <p className="truncate font-semibold text-text">{item.name}</p>
                                <p className="text-[10px] text-text/45 md:hidden">
                                    {item.position} • {item.year} • {item.rating ?? '—'} OVR
                                </p>
                            </div>

                            <div>
                                <p className="mb-1 text-[10px] text-text/45 md:hidden">Position</p>
                                {isEditable ? (
                                    <Select
                                        value={item.player.position}
                                        onChange={(event) => handlePositionChange(item.player, event.target.value)}
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
                                ) : (
                                    <div className="rounded-md border border-primary/10 bg-background/70 px-2 py-2 text-xs text-text/70">
                                        {item.position}
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className="mb-1 text-[10px] text-text/45 md:hidden">Year</p>
                                <div className="rounded-md border border-primary/10 bg-background/70 px-2 py-2 text-xs text-text/70">
                                    {item.year}
                                </div>
                            </div>

                            <div>
                                <p className="mb-1 text-[10px] text-text/45 md:hidden">OVR</p>
                                {isEditable ? (
                                    <Input
                                        type="number"
                                        min={0}
                                        max={99}
                                        value={currentRatingValue}
                                        onChange={(event) => setRatingDrafts((current) => ({
                                            ...current,
                                            [item.player.id]: event.target.value,
                                        }))}
                                        onBlur={(event) => handleRatingCommit(item.player, event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                event.currentTarget.blur()
                                            }
                                        }}
                                        disabled={Boolean(busyLabel)}
                                        className="h-8 text-base sm:text-xs"
                                        aria-label={`Change overall rating for ${item.name}`}
                                    />
                                ) : (
                                    <div className="rounded-md border border-primary/10 bg-background/70 px-2 py-2 text-xs text-text/70">
                                        {item.rating ?? '—'}
                                    </div>
                                )}
                            </div>

                            <div>
                                <p className="mb-1 text-[10px] text-text/45 md:hidden">Dev Trait</p>
                                <div className="flex h-8 items-center">
                                    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${getTraitClasses(item.devTrait)}`}>
                                        {item.devTrait ?? '—'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="mb-1 text-[10px] text-text/45 md:hidden">Status</p>
                                <div className="flex min-h-8 items-center">
                                    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyles[item.status]}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>

                            <div className="col-span-2 md:col-span-1 md:text-right">
                                {isEditable ? (
                                    <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
                                        {confirmCutId === item.player.id ? (
                                            <>
                                                <span className="text-[10px] text-red-500">Cut {item.name}?</span>
                                                <Button
                                                    type="button"
                                                    variant="delete"
                                                    size="sm"
                                                    onClick={() => handleCutPlayer(item.player)}
                                                    disabled={Boolean(busyLabel)}
                                                    className="h-7 px-2 text-[10px] font-semibold"
                                                >
                                                    Confirm
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setConfirmCutId(null)}
                                                    disabled={Boolean(busyLabel)}
                                                    className="h-7 px-2 text-[10px]"
                                                >
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                {busyLabel && (
                                                    <span className="text-[10px] text-text/45">{busyLabel}</span>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setConfirmCutId(item.player.id)}
                                                    disabled={Boolean(busyLabel)}
                                                    className="h-8 text-[10px] font-semibold text-red-500 hover:text-red-600"
                                                >
                                                    Cut
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-text/45">
                                        {statusNotes[item.status as Exclude<RosterStatus, 'Returning'>]}
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                }) : (
                    <div className="px-3 py-6 text-center text-xs text-text/50">
                        No players match the current search and filters.
                    </div>
                )}
            </div>
        </div>
    )
}
