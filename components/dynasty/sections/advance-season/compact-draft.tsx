'use client'

import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'

import { DraftedPlayerService, type DraftedPlayer } from '@/dal/features/drafted-players'
import type { RosterPlayer } from '@/dal/features/players'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

interface CompactDraftProps {
    dynastyId: string
    yearRecordId: string
    year: number
    schoolName: string
    roster: RosterPlayer[]
    draftedPlayers: DraftedPlayer[]
    onChange: (draftedPlayers: DraftedPlayer[]) => void
}

function sortDraftedPlayers(items: DraftedPlayer[]) {
    return [...items].sort((a, b) => a.player_name.localeCompare(b.player_name))
}

export function CompactDraft({
    dynastyId,
    yearRecordId,
    year,
    schoolName,
    roster,
    draftedPlayers,
    onChange,
}: CompactDraftProps) {
    const [selectedPlayerId, setSelectedPlayerId] = useState('')
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const declaredNames = useMemo(
        () => new Set(draftedPlayers.map((player) => player.player_name)),
        [draftedPlayers]
    )

    const availablePlayers = useMemo(
        () => roster.filter((player) => !declaredNames.has(player.name)),
        [declaredNames, roster]
    )

    const orderedDraftedPlayers = useMemo(
        () => sortDraftedPlayers(draftedPlayers),
        [draftedPlayers]
    )

    const handleAdd = async () => {
        if (saving || !selectedPlayerId) return

        const player = roster.find((entry) => entry.id === selectedPlayerId)
        if (!player) return

        setSaving(true)
        try {
            const created = await DraftedPlayerService.createDraftedPlayer({
                dynasty_id: dynastyId,
                year_record_id: yearRecordId,
                player_name: player.name,
                position: player.position,
                original_team: schoolName,
                drafted_team: 'TBD',
                round: null,
                pick: null,
                year,
            })

            if (created) {
                onChange(sortDraftedPlayers([...draftedPlayers, created]))
                setSelectedPlayerId('')
            }
        } catch (err) {
            console.error('Failed to add draft declaration:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            await DraftedPlayerService.deleteDraftedPlayer(id)
            onChange(draftedPlayers.filter((player) => player.id !== id))
        } catch (err) {
            console.error('Failed to delete draft declaration:', err)
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-primary/15 bg-background/80">
            <div className="border-b border-primary/10 px-3 py-2">
                <h3 className="text-sm font-semibold text-text">Draft Declarations</h3>
                <p className="text-[10px] text-text/55">{draftedPlayers.length} players marked as leaving for the draft</p>
            </div>

            <div className="grid gap-2 border-b border-primary/10 p-2 md:grid-cols-[minmax(0,1fr)_auto]">
                <Select
                    value={selectedPlayerId}
                    onChange={(event) => setSelectedPlayerId(event.target.value)}
                    className="h-8 text-base sm:text-xs"
                >
                    <option value="">Select player</option>
                    {availablePlayers.map((player) => (
                        <option key={player.id} value={player.id}>
                            {player.name} — {player.position} #{player.season.jersey_number ?? '—'}
                        </option>
                    ))}
                </Select>
                <Button
                    size="sm"
                    variant="save"
                    onClick={handleAdd}
                    disabled={saving || !selectedPlayerId}
                    className="h-8 text-base sm:text-xs font-semibold"
                >
                    {saving ? 'Adding...' : 'Add'}
                </Button>
            </div>

            <div>
                {orderedDraftedPlayers.length > 0 ? orderedDraftedPlayers.map((player) => (
                    <div
                        key={player.id}
                        className="grid gap-2 border-b border-primary/10 px-2 py-2 text-xs last:border-b-0 hover:bg-primary/5 md:grid-cols-[minmax(0,1.5fr)_80px_minmax(0,1fr)_32px] md:items-center"
                    >
                        <div className="min-w-0">
                            <p className="truncate font-semibold text-text">{player.player_name}</p>
                            <p className="text-[10px] text-text/50 md:hidden">{player.position} • {player.original_team}</p>
                        </div>
                        <span className="text-[10px] text-text/60 md:text-xs">{player.position}</span>
                        <span className="truncate text-[10px] text-amber-600 md:text-xs">Declared from {player.original_team}</span>
                        <button
                            type="button"
                            onClick={() => handleDelete(player.id)}
                            disabled={deletingId === player.id}
                            className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                            aria-label={`Delete ${player.player_name}`}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )) : (
                    <div className="px-3 py-6 text-center text-xs text-text/50">No draft declarations yet.</div>
                )}
            </div>
        </div>
    )
}
