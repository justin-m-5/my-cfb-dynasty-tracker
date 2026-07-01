'use client'

import { useMemo, useState } from 'react'
import { Award, Plus, Trash2 } from 'lucide-react'

import { PlayerService, type RosterPlayer } from '@/dal/features/players'
import { HONOR_CATEGORIES, type HonorKey } from '@/lib/honors-config'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Select } from '@/components/ui/select'

interface CompactHonorsProps {
    roster: RosterPlayer[]
    onRosterUpdate: (updated: RosterPlayer[]) => void
}

export function CompactHonors({ roster, onRosterUpdate }: CompactHonorsProps) {
    const [selectedPlayerId, setSelectedPlayerId] = useState('')
    const [selectedHonor, setSelectedHonor] = useState<HonorKey | ''>('')
    const [saving, setSaving] = useState(false)
    const [removingKey, setRemovingKey] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const honorGroups = useMemo(() => {
        const groups: Record<string, { player: RosterPlayer; seasonId: string }[]> = {}
        for (const cat of HONOR_CATEGORIES) {
            groups[cat.key] = []
        }
        for (const player of roster) {
            for (const honor of player.season.honors) {
                if (groups[honor]) {
                    groups[honor].push({ player, seasonId: player.season.id })
                }
            }
        }
        return groups
    }, [roster])

    const totalHonors = useMemo(
        () => roster.reduce((sum, p) => sum + p.season.honors.length, 0),
        [roster]
    )

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedPlayerId('')
        setSelectedHonor('')
    }

    const handleAdd = async () => {
        if (saving || !selectedPlayerId || !selectedHonor) return

        const player = roster.find(p => p.id === selectedPlayerId)
        if (!player || player.season.honors.includes(selectedHonor)) return

        setSaving(true)
        try {
            const newHonors = [...player.season.honors, selectedHonor]
            await PlayerService.updatePlayerSeason(player.season.id, { honors: newHonors })

            const updated = roster.map(p =>
                p.id === selectedPlayerId
                    ? { ...p, season: { ...p.season, honors: newHonors } }
                    : p
            )
            onRosterUpdate(updated)
            closeModal()
        } catch (err) {
            console.error('Failed to add honor:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleRemove = async (playerId: string, seasonId: string, honor: string) => {
        const key = `${playerId}-${honor}`
        setRemovingKey(key)
        try {
            const player = roster.find(p => p.id === playerId)
            if (!player) return

            const newHonors = player.season.honors.filter(h => h !== honor)
            await PlayerService.updatePlayerSeason(seasonId, { honors: newHonors })

            const updated = roster.map(p =>
                p.id === playerId
                    ? { ...p, season: { ...p.season, honors: newHonors } }
                    : p
            )
            onRosterUpdate(updated)
        } catch (err) {
            console.error('Failed to remove honor:', err)
        } finally {
            setRemovingKey(null)
        }
    }

    return (
        <>
            <div className="overflow-hidden rounded-2xl border border-primary/15 bg-background/80">
                <div className="border-b border-primary/10 px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h3 className="text-sm font-semibold text-text">Season Honors</h3>
                            <p className="text-[10px] text-text/55">
                                {totalHonors} honor{totalHonors !== 1 ? 's' : ''} assigned
                            </p>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setIsModalOpen(true)}
                            className="text-xs font-semibold"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add Honor
                        </Button>
                    </div>
                </div>

                <div className="divide-y divide-primary/10">
                    {HONOR_CATEGORIES.map(cat => {
                        const players = honorGroups[cat.key]
                        if (players.length === 0) return null

                        return (
                            <div key={cat.key} className="px-3 py-2">
                                <div className="mb-1.5 flex items-center gap-1.5">
                                    <Award className="h-3 w-3 text-amber-500" />
                                    <span className="text-[11px] font-semibold text-text/80">{cat.label}</span>
                                    <span className="text-[10px] text-text/40">({players.length})</span>
                                </div>
                                <div className="space-y-1">
                                    {players.map(({ player, seasonId }) => (
                                        <div
                                            key={`${player.id}-${cat.key}`}
                                            className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-primary/5"
                                        >
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="font-medium text-text">{player.name}</span>
                                                <span className="text-text/50">{player.position}</span>
                                                {player.season.jersey_number && (
                                                    <span className="text-text/40">#{player.season.jersey_number}</span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(player.id, seasonId, cat.key)}
                                                disabled={removingKey === `${player.id}-${cat.key}`}
                                                className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                                                aria-label={`Remove ${cat.label} from ${player.name}`}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}

                    {totalHonors === 0 && (
                        <div className="px-3 py-6 text-center text-xs text-text/50">
                            No honors assigned yet.
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Add Season Honor"
                maxWidth="max-w-xl"
            >
                <div className="space-y-4">
                    <div>
                        <Label className="text-xs">Player</Label>
                        <Select
                            value={selectedPlayerId}
                            onChange={(e) => setSelectedPlayerId(e.target.value)}
                            className="mt-1 h-9 text-sm"
                        >
                            <option value="">Select player</option>
                            {roster.map(player => (
                                <option key={player.id} value={player.id}>
                                    {player.name} — {player.position} #{player.season.jersey_number ?? '—'}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs">Honor</Label>
                        <Select
                            value={selectedHonor}
                            onChange={(e) => setSelectedHonor(e.target.value as HonorKey | '')}
                            className="mt-1 h-9 text-sm"
                        >
                            <option value="">Select honor</option>
                            {HONOR_CATEGORIES.map(cat => (
                                <option key={cat.key} value={cat.key}>
                                    {cat.label}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="save"
                            size="sm"
                            onClick={handleAdd}
                            disabled={saving || !selectedPlayerId || !selectedHonor}
                            className="text-xs font-semibold"
                        >
                            {saving ? 'Adding...' : 'Add Honor'}
                        </Button>
                        <Button type="button" variant="cancel" size="sm" onClick={closeModal} className="text-xs">
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
