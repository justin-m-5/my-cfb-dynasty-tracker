// components/dynasty/sections/advance-season/compact-honors.tsx

'use client'

import { useMemo, useState } from 'react'
import { Award as AwardIcon, Plus, Trash2 } from 'lucide-react'

import { AwardService, type Award } from '@/dal/features/awards'
import type { RosterPlayer } from '@/dal/features/players'
import { predefinedAwards, teamAwards, teamDesignations } from '@/lib/config/award-config'
import { Button } from '@/components/ui/display/button'
import { Label } from '@/components/ui/form/label'
import { Modal } from '@/components/ui/layout/modal'
import { Select } from '@/components/ui/form/select'

interface CompactHonorsProps {
    dynastyId: string
    yearRecordId: string
    year: number
    roster: RosterPlayer[]
    awards: Award[]
    onAwardsChange: (awards: Award[]) => void
}

export function CompactHonors({ dynastyId, yearRecordId, year, roster, awards, onAwardsChange }: CompactHonorsProps) {
    const [selectedPlayerId, setSelectedPlayerId] = useState('')
    const [selectedAward, setSelectedAward] = useState('')
    const [selectedTeam, setSelectedTeam] = useState('')
    const [saving, setSaving] = useState(false)
    const [removingId, setRemovingId] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const showTeamSelect = teamAwards.includes(selectedAward)

    const groupedAwards = useMemo(() => {
        const groups: Record<string, Award[]> = {}
        for (const award of awards) {
            const key = award.award_name + (award.team ? ` (${award.team})` : '')
            if (!groups[key]) groups[key] = []
            groups[key].push(award)
        }
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    }, [awards])

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedPlayerId('')
        setSelectedAward('')
        setSelectedTeam('')
    }

    const handleAdd = async () => {
        if (saving || !selectedPlayerId || !selectedAward) return

        const player = roster.find(p => p.id === selectedPlayerId)
        if (!player) return

        setSaving(true)
        try {
            const created = await AwardService.createAward({
                dynasty_id: dynastyId,
                year_record_id: yearRecordId,
                player_id: selectedPlayerId,
                player_name: player.name,
                award_name: selectedAward,
                team: showTeamSelect && selectedTeam ? selectedTeam : null,
                year,
            })

            if (created) {
                onAwardsChange([...awards, created])
                closeModal()
            }
        } catch (err) {
            console.error('Failed to add award:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleRemove = async (id: string) => {
        setRemovingId(id)
        try {
            const success = await AwardService.deleteAward(id)
            if (success) {
                onAwardsChange(awards.filter(a => a.id !== id))
            }
        } catch (err) {
            console.error('Failed to remove award:', err)
        } finally {
            setRemovingId(null)
        }
    }

    return (
        <>
            <div className="overflow-hidden rounded-2xl border border-primary/15 bg-background/80">
                <div className="border-b border-primary/10 px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h3 className="text-sm font-semibold text-text">Season Awards</h3>
                            <p className="text-[10px] text-text/55">
                                {awards.length} award{awards.length !== 1 ? 's' : ''} assigned
                            </p>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setIsModalOpen(true)}
                            className="text-xs font-semibold"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add Award
                        </Button>
                    </div>
                </div>

                <div className="divide-y divide-primary/10">
                    {groupedAwards.map(([groupLabel, groupAwards]) => (
                        <div key={groupLabel} className="px-3 py-2">
                            <div className="mb-1.5 flex items-center gap-1.5">
                                <AwardIcon className="h-3 w-3 text-amber-500" />
                                <span className="text-[11px] font-semibold text-text/80">{groupLabel}</span>
                                <span className="text-[10px] text-text/40">({groupAwards.length})</span>
                            </div>
                            <div className="space-y-1">
                                {groupAwards.map((award) => (
                                    <div
                                        key={award.id}
                                        className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-primary/5"
                                    >
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="font-medium text-text">{award.player_name}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(award.id)}
                                            disabled={removingId === award.id}
                                            className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                                            aria-label={`Remove ${award.award_name} from ${award.player_name}`}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {awards.length === 0 && (
                        <div className="px-3 py-6 text-center text-xs text-text/50">
                            No awards assigned yet.
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Add Season Award"
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
                        <Label className="text-xs">Award</Label>
                        <Select
                            value={selectedAward}
                            onChange={(e) => { setSelectedAward(e.target.value); setSelectedTeam('') }}
                            className="mt-1 h-9 text-sm"
                        >
                            <option value="">Select award</option>
                            {predefinedAwards.map(a => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </Select>
                    </div>
                    {showTeamSelect && (
                        <div>
                            <Label className="text-xs">Team Designation</Label>
                            <Select
                                value={selectedTeam}
                                onChange={(e) => setSelectedTeam(e.target.value)}
                                className="mt-1 h-9 text-sm"
                            >
                                <option value="">—</option>
                                {teamDesignations.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </Select>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="save"
                            size="sm"
                            onClick={handleAdd}
                            disabled={saving || !selectedPlayerId || !selectedAward}
                            className="text-xs font-semibold"
                        >
                            {saving ? 'Adding...' : 'Add Award'}
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

