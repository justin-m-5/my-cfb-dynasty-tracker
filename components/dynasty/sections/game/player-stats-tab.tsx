'use client'

import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import type { RosterPlayer } from '@/dal/features/players'
import { PlayerStatService, type PlayerStat } from '@/dal/features/player-stats'
import { Button } from '@/components/ui/display/button'
import { Input } from '@/components/ui/form/input'
import { Select } from '@/components/ui/form/select'
import { Label } from '@/components/ui/form/label'
import { Card, CardContent } from '@/components/ui/layout/card'
import { Modal } from '@/components/ui/layout/modal'
import {
    type StatCategory,
    statCategories,
    displayColumns,
    computeStatValue,
} from '@/lib/config/stat-config'

interface PlayerStatsTabProps {
    gameId: string
    roster: RosterPlayer[]
    stats: PlayerStat[]
    onStatsChange: (stats: PlayerStat[]) => void
}

function blankStatFields(): Omit<PlayerStat, 'id' | 'player_id' | 'game_id'> {
    return {
        attempts: 0, completions: 0, pass_yards: 0, pass_td: 0,
        pass_int: 0, long: 0, carries: 0, rush_yards: 0, rush_td: 0, fumbles: 0,
        yac: 0, receptions: 0, rec_yards: 0, rec_td: 0, rac: 0, solo: 0, assists: 0,
        tackles: 0, tfl: 0, sacks: 0, def_int: 0, forced_fumbles: 0, def_td: 0,
        fg_made: 0, fg_attempted: 0, xp_made: 0, xp_attempted: 0, punts: 0,
        punt_yards: 0, touchbacks: 0, kr_yards: 0, kr_td: 0, pr_yards: 0, pr_td: 0,
        kr_long: 0, pr_long: 0,
    }
}

function hasStatsInCategory(stat: PlayerStat, category: StatCategory): boolean {
    const fields = statCategories[category]
    return fields.some(({ field }) => {
        const val = (stat as unknown as Record<string, number>)[field]
        return val !== 0 && val !== undefined && val !== null
    })
}

export function PlayerStatsTab({ gameId, roster, stats, onStatsChange }: PlayerStatsTabProps) {
    const [selectedCategory, setSelectedCategory] = useState<StatCategory>('Passing')
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formPlayerId, setFormPlayerId] = useState('')
    const [formFields, setFormFields] = useState<Record<string, number>>({})
    const [saving, setSaving] = useState(false)

    const categoryStats = stats.filter(s => hasStatsInCategory(s, selectedCategory))
    const columns = displayColumns[selectedCategory]
    const inputFields = statCategories[selectedCategory]

    const closeForm = () => {
        setShowForm(false)
        setEditingId(null)
    }

    const openAddForm = () => {
        setEditingId(null)
        setFormPlayerId('')
        setFormFields({})
        setShowForm(true)
    }

    const openEditForm = (stat: PlayerStat) => {
        setEditingId(stat.id)
        setFormPlayerId(stat.player_id)
        const fields: Record<string, number> = {}
        for (const { field } of inputFields) {
            fields[field] = (stat as unknown as Record<string, number>)[field] ?? 0
        }
        setFormFields(fields)
        setShowForm(true)
    }

    const handleSave = async () => {
        if (!formPlayerId) return
        setSaving(true)

        try {
            const existing = stats.find(s => s.player_id === formPlayerId)

            if (editingId || existing) {
                const id = editingId || existing!.id
                const updates: Partial<PlayerStat> = {}
                for (const { field } of inputFields) {
                    ;(updates as unknown as Record<string, number>)[field] = formFields[field] ?? 0
                }
                await PlayerStatService.updateStat(id, updates)
                onStatsChange(stats.map(s => s.id === id ? { ...s, ...updates } : s))
            } else {
                const newStat: Omit<PlayerStat, 'id'> = {
                    ...blankStatFields(),
                    player_id: formPlayerId,
                    game_id: gameId,
                }
                for (const { field } of inputFields) {
                    ;(newStat as unknown as Record<string, number>)[field] = formFields[field] ?? 0
                }
                const created = await PlayerStatService.createStat(newStat)
                if (created) onStatsChange([...stats, created])
            }

            closeForm()
        } catch (err) {
            console.error('Failed to save player stat:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await PlayerStatService.deleteStat(id)
            onStatsChange(stats.filter(s => s.id !== id))
        } catch (err) {
            console.error('Failed to delete stat:', err)
        }
    }

    const playerName = (playerId: string) => {
        const p = roster.find(r => r.id === playerId)
        return p ? `${p.name} #${p.season.jersey_number ?? ''}` : 'Unknown'
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as StatCategory)}
                        className="h-9 w-44 text-sm"
                    >
                        {Object.keys(statCategories).map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </Select>

                    <Button
                        type="button"
                        size="sm"
                        onClick={openAddForm}
                        className="text-xs font-semibold"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Stats
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-primary/20 bg-background/50">
                                        <th className="px-3 py-2 text-left text-xs font-semibold text-text/60 whitespace-nowrap">Player</th>
                                        {columns.map(col => (
                                            <th key={col.field} className="px-2 py-2 text-center text-xs font-semibold text-text/60 whitespace-nowrap">
                                                {col.label}
                                            </th>
                                        ))}
                                        <th className="px-2 py-2 text-center text-xs font-semibold text-text/60 whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categoryStats.length > 0 ? (
                                        categoryStats.map((stat) => (
                                            <tr key={stat.id} className="border-b border-primary/10 hover:bg-primary/5">
                                                <td className="px-3 py-2 font-medium text-text">
                                                    {playerName(stat.player_id)}
                                                </td>
                                                {columns.map(col => (
                                                    <td key={col.field} className="px-2 py-2 text-center text-text/80">
                                                        {computeStatValue(stat as unknown as Record<string, unknown>, col.field)}
                                                    </td>
                                                ))}
                                                <td className="px-2 py-2 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditForm(stat)}
                                                            className="rounded p-1 text-text/50 hover:bg-primary/10 hover:text-primary"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(stat.id)}
                                                            className="rounded p-1 text-text/50 hover:bg-red-500/10 hover:text-red-600"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={columns.length + 2}
                                                className="px-3 py-6 text-center text-sm text-text/50"
                                            >
                                                No {selectedCategory.toLowerCase()} stats yet
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Modal
                isOpen={showForm}
                onClose={closeForm}
                title={`Add/Edit ${selectedCategory} Stats`}
                maxWidth="max-w-3xl"
            >
                <div className="space-y-4">
                    <div>
                        <Label className="text-xs">Player</Label>
                        <Select
                            value={formPlayerId}
                            onChange={(e) => setFormPlayerId(e.target.value)}
                            disabled={!!editingId}
                            className="mt-1 h-9 text-sm"
                        >
                            <option value="">Select Player</option>
                            {roster.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} – {p.position} #{p.season.jersey_number ?? ''}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {inputFields.map(({ label, field }) => (
                            <div key={field}>
                                <Label className="text-xs">{label}</Label>
                                <Input
                                    type="number"
                                    value={formFields[field] ?? ''}
                                    onChange={(e) =>
                                        setFormFields(prev => ({
                                            ...prev,
                                            [field]: e.target.value === '' ? 0 : Number(e.target.value),
                                        }))
                                    }
                                    className="mt-1 h-8"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="save"
                            size="sm"
                            onClick={handleSave}
                            disabled={saving || !formPlayerId}
                            className="text-xs font-semibold"
                        >
                            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Stats'}
                        </Button>
                        <Button
                            type="button"
                            variant="cancel"
                            size="sm"
                            onClick={closeForm}
                            className="text-xs"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
