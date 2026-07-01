// components/forms/award-form.tsx

'use client'

import { useState } from 'react'
import type { Player } from '@/dal/features/players'
import type { Award } from '@/dal/features/awards'
import { predefinedAwards, teamAwards, teamDesignations } from '@/lib/award-config'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AwardFormProps {
    players: Player[]
    editing: Award | null
    saving: boolean
    onSave: (data: { player_id: string; player_name: string; award_name: string; team: string | null }) => void
    onCancel: () => void
}

export function AwardForm({ players, editing, saving, onSave, onCancel }: AwardFormProps) {
    const [playerId, setPlayerId] = useState(editing?.player_id ?? '')
    const [awardName, setAwardName] = useState(editing?.award_name ?? '')
    const [team, setTeam] = useState(editing?.team ?? '')

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
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">{editing ? 'Edit Award' : 'Add Award'}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {/* Player */}
                    <div>
                        <Label className="text-xs">Player *</Label>
                        <Select
                            value={playerId}
                            onChange={(e) => setPlayerId(e.target.value)}
                            className="mt-1 h-8 text-sm"
                        >
                            <option value="">Select Player</option>
                            {players.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} — {p.position}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Award */}
                    <div>
                        <Label className="text-xs">Award *</Label>
                        <Select
                            value={awardName}
                            onChange={(e) => setAwardName(e.target.value)}
                            className="mt-1 h-8 text-sm"
                        >
                            <option value="">Select Award</option>
                            {predefinedAwards.map(a => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </Select>
                    </div>

                    {/* Team (conditional) */}
                    {showTeamSelect && (
                        <div>
                            <Label className="text-xs">Team</Label>
                            <Select
                                value={team}
                                onChange={(e) => setTeam(e.target.value)}
                                className="mt-1 h-8 text-sm"
                            >
                                <option value="">—</option>
                                {teamDesignations.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </Select>
                        </div>
                    )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                    <Button
                        bg="var(--green-600)"
                        text="white"
                        size="sm"
                        onClick={handleSubmit}
                        disabled={saving || !playerId || !awardName}
                        className="text-xs font-semibold"
                    >
                        {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Award'}
                    </Button>
                    <Button bg="var(--orange-400)" text="white" size="sm" onClick={onCancel} className="text-xs">
                        Cancel
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
