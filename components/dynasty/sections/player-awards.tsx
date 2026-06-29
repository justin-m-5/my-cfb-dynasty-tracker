// components/dynasty/sections/player-awards.tsx

'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

import { YearRecordService } from '@/dal/features/year-records'
import { PlayerService, type Player } from '@/dal/features/players'
import { AwardService, type Award } from '@/dal/features/awards'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AwardForm } from './player-awards/award-form'
import { AwardList } from './player-awards/award-list'

interface PlayerAwardsProps {
    dynastyId: string
}

export function PlayerAwards({ dynastyId }: PlayerAwardsProps) {
    const [awards, setAwards] = useState<Award[]>([])
    const [players, setPlayers] = useState<Player[]>([])
    const [yearRecordId, setYearRecordId] = useState<string | null>(null)
    const [year, setYear] = useState<number>(2026)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<Award | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const yr = await YearRecordService.getCurrentYearRecord(dynastyId)
                if (yr) {
                    setYearRecordId(yr.id)
                    setYear(yr.year)
                    const [awardData, playerData] = await Promise.all([
                        AwardService.getAwards(dynastyId, yr.id),
                        PlayerService.getRoster(dynastyId, yr.id),
                    ])
                    setAwards(awardData)
                    setPlayers(playerData)
                }
            } catch (err) {
                console.error('Failed to load awards:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [dynastyId])

    const handleSave = async (data: { player_id: string; player_name: string; award_name: string; team: string | null }) => {
        if (!yearRecordId) return
        setSaving(true)
        try {
            if (editing) {
                const updated = await AwardService.updateAward(editing.id, {
                    player_id: data.player_id,
                    player_name: data.player_name,
                    award_name: data.award_name,
                    team: data.team,
                })
                if (updated) {
                    setAwards(awards.map(a => a.id === editing.id ? updated : a))
                }
            } else {
                const created = await AwardService.createAward({
                    dynasty_id: dynastyId,
                    year_record_id: yearRecordId,
                    player_id: data.player_id,
                    player_name: data.player_name,
                    award_name: data.award_name,
                    team: data.team,
                    year,
                })
                if (created) {
                    setAwards([...awards, created])
                }
            }
            setEditing(null)
            setShowForm(false)
        } catch (err) {
            console.error('Failed to save award:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (award: Award) => {
        setEditing(award)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        const ok = await AwardService.deleteAward(id)
        if (ok) setAwards(awards.filter(a => a.id !== id))
    }

    const handleCancel = () => {
        setEditing(null)
        setShowForm(false)
    }

    if (loading) {
        return <div className="text-sm text-text/60">Loading awards...</div>
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Player Awards</CardTitle>
                        {!showForm && (
                            <Button size="sm"  bg="var(--primary)" text="white" onClick={() => setShowForm(true)}>
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Add Award
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {showForm && (
                        <div className="mb-4 p-3 rounded-lg border border-primary/15 bg-primary/5">
                            <AwardForm
                                key={editing?.id ?? 'new'}
                                players={players}
                                editing={editing}
                                saving={saving}
                                onSave={handleSave}
                                onCancel={handleCancel}
                            />
                        </div>
                    )}
                    <AwardList
                        awards={awards}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
