// components/dynasty/sections/roster.tsx

'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'

import { YearRecordService } from '@/dal/features/year-records'
import { PlayerService, type Player } from '@/dal/features/players'
import { positions } from '@/lib/player-config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlayerRow } from './roster/player-row'
import { PlayerForm } from './roster/player-form'

interface RosterProps {
    dynastyId: string
}

export function Roster({ dynastyId }: RosterProps) {
    const [players, setPlayers] = useState<Player[]>([])
    const [yearRecordId, setYearRecordId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form state
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<Player | null>(null)

    // Filters
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
            {/* Add/Edit form */}
            {showForm && (
                <PlayerForm
                    initial={editing ?? undefined}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    saving={saving}
                />
            )}

            {/* Roster list */}
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

                    {/* Filters */}
                    <div className="mt-2 flex gap-2">
                        <Input
                            placeholder="Search name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 flex-1 text-xs"
                        />
                        <Select
                            value={posFilter}
                            onChange={(e) => setPosFilter(e.target.value)}
                            className="h-8 w-24 text-xs"
                        >
                            <option value="ALL">All</option>
                            {positions.map(p => <option key={p} value={p}>{p}</option>)}
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {filtered.length === 0 ? (
                        <p className="text-sm text-text/60 py-4 text-center">
                            {players.length === 0 ? 'No players yet. Add your first player.' : 'No players match your filter.'}
                        </p>
                    ) : (
                        <div>
                            {/* Header */}
                            <div className="flex items-center gap-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-text/50 border-b border-primary/15">
                                <span className="w-7 text-center">#</span>
                                <span className="flex-1">Player</span>
                                <span className="w-14 text-center hidden sm:block">Year</span>
                                <span className="w-8 text-center">OVR</span>
                                <span className="w-20 shrink-0" />
                            </div>
                            {filtered.map(player => (
                                <PlayerRow
                                    key={player.id}
                                    player={player}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onToggleRedshirt={handleToggleRedshirt}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
