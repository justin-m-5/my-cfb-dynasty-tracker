// components/dynasty/sections/roster/index.tsx

'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

import { YearRecordService } from '@/dal/features/year-records'
import { PlayerService, type RosterPlayer } from '@/dal/features/players'
import { uploadPlayerImage, deletePlayerImage } from '@/lib/upload-player-image'
import { Button } from '@/components/ui/display/button'
import { Modal } from '@/components/ui/layout/modal'
import { DepthChart } from '@/components/dynasty/depth-chart'
import { PlayerCard } from '@/components/dynasty/player-card'
import { PlayerForm, type PlayerFormData } from '../../../forms/player-form'

interface RosterProps {
    dynastyId: string
}

export function Roster({ dynastyId }: RosterProps) {
    const [players, setPlayers] = useState<RosterPlayer[]>([])
    const [yearRecordId, setYearRecordId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<RosterPlayer | null>(null)
    const [selectedPlayer, setSelectedPlayer] = useState<RosterPlayer | null>(null)
    const [schoolColors, setSchoolColors] = useState({
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
    })
    const [schoolName, setSchoolName] = useState('')

    useEffect(() => {
        const load = async () => {
            try {
                const yr = await YearRecordService.getCurrentYearRecord(dynastyId)
                if (yr) {
                    setYearRecordId(yr.id)
                    setSchoolColors({
                        primary: yr.primary_color ?? 'var(--color-primary)',
                        secondary: yr.secondary_color ?? 'var(--color-secondary)',
                    })
                    setSchoolName(yr.school_name ?? '')
                    const roster = await PlayerService.getRoster(dynastyId, yr.id)
                    setPlayers(roster)
                }
            } catch (err) {
                console.error('Failed to load roster:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [dynastyId])

    const handleSave = async (form: PlayerFormData) => {
        if (!yearRecordId) return
        setSaving(true)
        try {
            if (editing?.id) {
                let avatarUrl = editing.avatar_url
                if (form.removeImage && editing.avatar_url) {
                    await deletePlayerImage(dynastyId, editing.id, editing.avatar_url)
                    avatarUrl = null
                }
                if (form.imageFile) {
                    avatarUrl = await uploadPlayerImage(form.imageFile, dynastyId, editing.id)
                }

                await PlayerService.updatePlayer(editing.id, {
                    name: form.name,
                    position: form.position,
                    height: form.height,
                    weight: form.weight,
                    avatar_url: avatarUrl,
                })
                await PlayerService.updatePlayerSeason(editing.season.id, {
                    year: form.year,
                    rating: form.rating,
                    jersey_number: form.jersey_number,
                    is_redshirted: form.is_redshirted,
                    notes: form.notes,
                    dev_trait: form.dev_trait,
                })
                const updatedPlayer = {
                    ...editing,
                    name: form.name,
                    position: form.position,
                    height: form.height,
                    weight: form.weight,
                    avatar_url: avatarUrl,
                    season: {
                        ...editing.season,
                        year: form.year,
                        rating: form.rating,
                        jersey_number: form.jersey_number,
                        is_redshirted: form.is_redshirted,
                        notes: form.notes,
                        dev_trait: form.dev_trait,
                    },
                }
                setPlayers(prev => prev.map(p => p.id === editing.id ? updatedPlayer : p))
                setSelectedPlayer(prev => prev?.id === editing.id ? updatedPlayer : prev)
            } else {
                const created = await PlayerService.createPlayer(
                    {
                        dynasty_id: dynastyId,
                        name: form.name,
                        position: form.position,
                        height: form.height,
                        weight: form.weight,
                    },
                    {
                        year_record_id: yearRecordId,
                        dynasty_id: dynastyId,
                        year: form.year,
                        rating: form.rating,
                        jersey_number: form.jersey_number,
                        is_redshirted: form.is_redshirted,
                        notes: form.notes,
                        dev_trait: form.dev_trait,
                    }
                )
                if (created) {
                    if (form.imageFile) {
                        const avatarUrl = await uploadPlayerImage(form.imageFile, dynastyId, created.id)
                        if (avatarUrl) {
                            await PlayerService.updatePlayer(created.id, { avatar_url: avatarUrl })
                            created.avatar_url = avatarUrl
                        }
                    }
                    setPlayers(prev => [...prev, created])
                }
            }
            setShowForm(false)
            setEditing(null)
        } catch (err) {
            console.error('Failed to save player:', err)
        } finally {
            setSaving(false)
        }
    }

    const handlePlayerClick = (player: RosterPlayer) => {
        setSelectedPlayer(player)
    }

    if (loading) {
        return <div className="text-sm text-text/60">Loading roster...</div>
    }

    return (
        <div className="space-y-4 pt-10">
            <div className="flex items-center justify-end">
                <Button
                    bg="var(--primary)"
                    text="white"
                    size="sm"
                    onClick={() => { setEditing(null); setShowForm(true) }}
                    className="flex items-center gap-1 text-xs font-semibold"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add Player
                </Button>
            </div>

            <DepthChart
                roster={players}
                mode="roster"
                onRosterUpdate={setPlayers}
                onPlayerClick={handlePlayerClick}
                schoolName={schoolName}
            />

            <Modal
                isOpen={showForm}
                onClose={() => { setShowForm(false); setEditing(null) }}
                title={editing ? `Edit ${editing.name}` : 'Add Player'}
                maxWidth="max-w-2xl"
            >
                <PlayerForm
                    key={editing?.id ?? 'new'}
                    initial={editing ?? undefined}
                    onSave={handleSave}
                    onCancel={() => { setShowForm(false); setEditing(null) }}
                    saving={saving}
                />
            </Modal>

            {selectedPlayer && (
                <PlayerCard
                    playerId={selectedPlayer.id}
                    dynastyId={dynastyId}
                    isOpen={!!selectedPlayer}
                    onClose={() => setSelectedPlayer(null)}
                    schoolColors={schoolColors}
                    schoolName={schoolName}
                />
            )}
        </div>
    )
}
