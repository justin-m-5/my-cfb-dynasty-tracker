// components/dynasty/sections/roster.tsx

'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'

import { YearRecordService } from '@/dal/features/year-records'
import { PlayerService, type Player } from '@/dal/features/players'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RosterFilters } from './roster/roster-filters'
import { RosterList } from './roster/roster-list'
import { PlayerForm } from '../../forms/player-form'

interface RosterProps {
    dynastyId: string
}

export function Roster({ dynastyId }: RosterProps) {
    const [players, setPlayers] = useState<Player[]>([])
    const [yearRecordId, setYearRecordId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<Player | null>(null)
    const [search, setSearch] = useState('')
    const [posFilter, setPosFilter] = useState('ALL')

    useEffect(() => {
        const load = async () => {
            try {
                const yr = await YearRecordService.getCurrentYearRecord(dynastyId)
                if (yr) {
                    setYearRecordId(yr.id)
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

    const filtered = useMemo(() => {
        return players.filter(p => {
            const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
            const matchPos = posFilter === 'ALL' || p.position === posFilter
            return matchSearch && matchPos
        })
    }, [players, search, posFilter])

    const handleSave = async (form: Partial<Player>) => {
        if (!yearRecordId) return
        setSaving(true)
        try {
            if (editing?.id) {
                await PlayerService.updatePlayer(editing.id, form)
                setPlayers(prev => prev.map(p => p.id === editing.id ? { ...p, ...form } as Player : p))
            } else {
                const created = await PlayerService.createPlayer({
                    dynasty_id: dynastyId,
                    year_record_id: yearRecordId,
                    name: form.name ?? '',
                    position: form.position ?? '',
                    year: form.year ?? null,
                    rating: form.rating ?? null,
                    jersey_number: form.jersey_number ?? null,
                    dev_trait: form.dev_trait ?? 'Normal',
                    height: form.height ?? null,
                    weight: form.weight ?? null,
                    notes: form.notes ?? null,
                    is_redshirted: form.is_redshirted ?? false,
                })
                if (created) setPlayers(prev => [...prev, created])
            }
            setShowForm(false)
            setEditing(null)
        } catch (err) {
            console.error('Failed to save player:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await PlayerService.deletePlayer(id)
            setPlayers(prev => prev.filter(p => p.id !== id))
        } catch (err) {
            console.error('Failed to delete player:', err)
        }
    }

    const handleToggleRedshirt = async (player: Player) => {
        const updated = !player.is_redshirted
        try {
            await PlayerService.updatePlayer(player.id, { is_redshirted: updated })
            setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, is_redshirted: updated } : p))
        } catch (err) {
            console.error('Failed to toggle redshirt:', err)
        }
    }

    const handleEdit = (player: Player) => {
        setEditing(player)
        setShowForm(true)
    }

    const handleCancel = () => {
        setShowForm(false)
        setEditing(null)
    }

    if (loading) {
        return <div className="text-sm text-text/60">Loading roster...</div>
    }

    return (
        <div className="space-y-4">
            {showForm && (
                <PlayerForm
                    initial={editing ?? undefined}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    saving={saving}
                />
            )}

            <Card>
                <CardHeader className="pb-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-base">
                            Roster ({players.length})
                        </CardTitle>
                        {!showForm && (
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
                        )}
                    </div>
                    <div className="mt-2">
                        <RosterFilters
                            search={search}
                            onSearchChange={setSearch}
                            posFilter={posFilter}
                            onPosFilterChange={setPosFilter}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <RosterList
                        players={filtered}
                        totalCount={players.length}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleRedshirt={handleToggleRedshirt}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
