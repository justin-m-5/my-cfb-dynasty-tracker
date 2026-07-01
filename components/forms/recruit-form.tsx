// components/forms/recruit-form.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PositionOptions } from '@/components/ui/position-options'
import { positions } from '@/lib/player-config'
import { devTraits } from '@/lib/player-config'
import { usStates } from '@/lib/recruit-config'
import type { Recruit } from '@/dal/features/recruits'

interface RecruitFormProps {
    initial?: Partial<Recruit>
    onSave: (recruit: Partial<Recruit>) => Promise<void>
    onCancel: () => void
    saving: boolean
}

export function RecruitForm({ initial, onSave, onCancel, saving }: RecruitFormProps) {
    const [form, setForm] = useState<Partial<Recruit>>({
        name: initial?.name ?? '',
        position: initial?.position ?? '',
        stars: initial?.stars ?? null,
        dev_trait: initial?.dev_trait ?? 'Normal',
        state: initial?.state ?? '',
        national_rank: initial?.national_rank ?? null,
        state_rank: initial?.state_rank ?? null,
        position_rank: initial?.position_rank ?? null,
        height: initial?.height ?? null,
        weight: initial?.weight ?? null,
    })

    const update = (field: string, value: unknown) => setForm(prev => ({ ...prev, [field]: value }))

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">{initial?.id ? 'Edit Recruit' : 'Add Recruit'}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {/* Name */}
                    <div className="col-span-2 sm:col-span-1">
                        <Label className="text-xs">Name *</Label>
                        <Input
                            value={form.name ?? ''}
                            onChange={(e) => update('name', e.target.value)}
                            placeholder="Player name"
                            className="mt-1 h-8"
                        />
                    </div>

                    {/* Position */}
                    <div>
                        <Label className="text-xs">Position *</Label>
                        <Select
                            value={form.position ?? ''}
                            onChange={(e) => update('position', e.target.value)}
                            className="mt-1 h-8"
                        >
                            <option value="">Select</option>
                            <PositionOptions />
                        </Select>
                    </div>

                    {/* Stars */}
                    <div>
                        <Label className="text-xs">Stars</Label>
                        <Select
                            value={form.stars?.toString() ?? ''}
                            onChange={(e) => update('stars', e.target.value ? Number(e.target.value) : null)}
                            className="mt-1 h-8"
                        >
                            <option value="">—</option>
                            {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{s} ★</option>)}
                        </Select>
                    </div>

                    {/* State */}
                    <div>
                        <Label className="text-xs">State</Label>
                        <Select
                            value={form.state ?? ''}
                            onChange={(e) => update('state', e.target.value)}
                            className="mt-1 h-8"
                        >
                            <option value="">—</option>
                            {usStates.map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </div>

                    {/* Dev Trait */}
                    <div>
                        <Label className="text-xs">Dev Trait</Label>
                        <Select
                            value={form.dev_trait ?? 'Normal'}
                            onChange={(e) => update('dev_trait', e.target.value)}
                            className="mt-1 h-8"
                        >
                            {devTraits.map(t => <option key={t} value={t}>{t}</option>)}
                        </Select>
                    </div>

                    {/* National Rank */}
                    <div>
                        <Label className="text-xs">Nat. Rank</Label>
                        <Input
                            type="number"
                            min={1}
                            value={form.national_rank ?? ''}
                            onChange={(e) => update('national_rank', e.target.value ? Number(e.target.value) : null)}
                            placeholder="#"
                            className="mt-1 h-8"
                        />
                    </div>

                    {/* State Rank */}
                    <div>
                        <Label className="text-xs">State Rank</Label>
                        <Input
                            type="number"
                            min={1}
                            value={form.state_rank ?? ''}
                            onChange={(e) => update('state_rank', e.target.value ? Number(e.target.value) : null)}
                            placeholder="#"
                            className="mt-1 h-8"
                        />
                    </div>

                    {/* Position Rank */}
                    <div>
                        <Label className="text-xs">Pos. Rank</Label>
                        <Input
                            type="number"
                            min={1}
                            value={form.position_rank ?? ''}
                            onChange={(e) => update('position_rank', e.target.value ? Number(e.target.value) : null)}
                            placeholder="#"
                            className="mt-1 h-8"
                        />
                    </div>

                    {/* Height */}
                    <div>
                        <Label className="text-xs">Height</Label>
                        <Input
                            value={form.height ?? ''}
                            onChange={(e) => update('height', e.target.value || null)}
                            placeholder={`6'2"`}
                            className="mt-1 h-8"
                        />
                    </div>

                    {/* Weight */}
                    <div>
                        <Label className="text-xs">Weight</Label>
                        <Input
                            type="number"
                            min={100}
                            max={400}
                            value={form.weight ?? ''}
                            onChange={(e) => update('weight', e.target.value ? Number(e.target.value) : null)}
                            placeholder="lbs"
                            className="mt-1 h-8"
                        />
                    </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                    <Button
                        variant="save"
                        size="sm"
                        onClick={() => onSave(form)}
                        disabled={saving || !form.name || !form.position}
                        className="text-xs font-semibold"
                    >
                        {saving ? 'Saving...' : initial?.id ? 'Save Changes' : 'Add Recruit'}
                    </Button>
                    <Button variant="cancel" size="sm" onClick={onCancel} className="text-xs">
                        Cancel
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
