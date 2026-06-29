// components/dynasty/sections/player-awards/award-form.tsx

'use client'

import { useState, useEffect } from 'react'
import type { Player } from '@/dal/features/players'
import type { Award } from '@/dal/features/awards'
import { predefinedAwards, teamAwards, teamDesignations } from '@/lib/award-config'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

interface AwardFormProps {
    players: Player[]
    editing: Award | null
    saving: boolean
    onSave: (data: { player_id: string; player_name: string; award_name: string; team: string | null }) => void
    onCancel: () => void
}

export function AwardForm({ players, editing, saving, onSave, onCancel }: AwardFormProps) {
    const [playerId, setPlayerId] = useState('')
    const [awardName, setAwardName] = useState('')
    const [team, setTeam] = useState('')

    useEffect(() => {
        if (editing) {
            setPlayerId(editing.player_id)
            setAwardName(editing.award_name)
            setTeam(editing.team || '')
        } else {
            setPlayerId('')
            setAwardName('')
            setTeam('')
        }
    }, [editing])

    const showTeamSelect = teamAwards.includes(awardName)

    const handleSubmit = () => {
        if (!playerId || !awardName) return
        const player = players.find(p => p.id === playerId)
        if (!player) return

        onSave({
            player_id: playerId,
            player_name: player.name,
            award_name: awardName,
            team: showTeamSelect && team ? team : null,
        })
    }

    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
            <Select
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                className="h-8 text-xs flex-1"
            >
                <option value="">Select Player</option>
                {players.map(p => (
                    <option key={p.id} value={p.id}>
                        {p.name} — {p.position} {p.jersey_number ? `#${p.jersey_number}` : ''}
                    </option>
                ))}
            </Select>

            <Select
                value={awardName}
                onChange={(e) => setAwardName(e.target.value)}
                className="h-8 text-xs flex-1"
            >
                <option value="">Select Award</option>
                {predefinedAwards.map(a => (
                    <option key={a} value={a}>{a}</option>
                ))}
            </Select>

            {showTeamSelect && (
                <Select
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    className="h-8 text-xs w-28"
                >
                    <option value="">Team</option>
                    {teamDesignations.map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </Select>
            )}

            <div className="flex gap-2">
                <Button size="sm" onClick={handleSubmit} disabled={saving || !playerId || !awardName}>
                    {editing ? 'Save' : 'Add'}
                </Button>
                {editing && (
                    <Button size="sm" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>
        </div>
    )
}
