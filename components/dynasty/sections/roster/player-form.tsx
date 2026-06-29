// components/dynasty/sections/roster/player-form.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { positions, years, devTraits } from '@/lib/player-config'
import type { Player } from '@/dal/features/players'

interface PlayerFormProps {
    initial?: Partial<Player>
    onSave: (player: Partial<Player>) => Promise<void>
    onCancel: () => void
    saving: boolean
}

export function PlayerForm({ initial, onSave, onCancel, saving }: PlayerFormProps) {
    const [form, setForm] = useState<Partial<Player>>({
        name: initial?.name ?? '',
        position: initial?.position ?? '',
        year: initial?.year ?? null,
        rating: initial?.rating ?? null,
        jersey_number: initial?.jersey_number ?? null,
        dev_trait: initial?.dev_trait ?? 'Normal',
        notes: initial?.notes ?? '',
        is_redshirted: initial?.is_redshirted ?? false,
    })

    const update = (field: string, value: unknown) => setForm(prev => ({ ...prev, [field]: value }))

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">{initial?.id ? 'Edit Player' : 'Add Player'}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="col-span-2 sm:col-span-1">
                        <Label className="text-xs">Name *</Label>
                        <Input
                            value={form.name ?? ''}
                            onChange={(e) => update('name', e.target.value)}
                            placeholder="Player name"
                            className="mt-1 h-8 text-sm"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Position *</Label>
                        <Select
                            value={form.position ?? ''}
                            onChange={(e) => update('position', e.target.value)}
                            className="mt-1 h-8 text-sm"
                        >
                            <option value="">Select</option>
                            {positions.map(p => <option key={p} value={p}>{p}</option>)}
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs">Jersey #</Label>
                        <Input
                            type="number"
                            min={0}
                            max={99}
                            value={form.jersey_number ?? ''}
                            onChange={(e) => update('jersey_number', e.target.value ? Number(e.target.value) : null)}
                            className="mt-1 h-8 text-sm"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Year</Label>
                        <Select
                            value={form.year ?? ''}
                            onChange={(e) => update('year', e.target.value || null)}
                            className="mt-1 h-8 text-sm"
                        >
                            <option value="">—</option>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </Select>
                    </div>
                    <div>
                        <Label className="text-xs">Rating</Label>
                        <Input
                            type="number"
                            min={40}
                            max={99}
                            value={form.rating ?? ''}
                            onChange={(e) => update('rating', e.target.value ? Number(e.target.value) : null)}
                            className="mt-1 h-8 text-sm"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Dev Trait</Label>
                        <Select
                            value={form.dev_trait ?? 'Normal'}
                            onChange={(e) => update('dev_trait', e.target.value)}
                            className="mt-1 h-8 text-sm"
                        >
                            {devTraits.map(t => <option key={t} value={t}>{t}</option>)}
                        </Select>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                        <Label className="text-xs">Notes</Label>
                        <Input
                            value={form.notes ?? ''}
                            onChange={(e) => update('notes', e.target.value)}
                            placeholder="Optional notes"
                            className="mt-1 h-8 text-sm"
                        />
                    </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <Button
                        bg="var(--green-600)"
                        text="white"
                        size="sm"
                        onClick={() => onSave(form)}
                        disabled={saving || !form.name || !form.position}
                        className="text-xs font-semibold"
                    >
                        {saving ? 'Saving...' : initial?.id ? 'Save Changes' : 'Add Player'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs">
                        Cancel
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
