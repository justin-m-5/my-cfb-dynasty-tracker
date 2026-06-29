// components/forms/transfer-form.tsx

'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { positions, devTraits } from '@/lib/player-config'
import { fbsTeams } from '@/lib/fbs-teams'
import type { Transfer } from '@/dal/features/transfers'

interface TransferFormProps {
    initial?: Partial<Transfer>
    onSave: (transfer: Partial<Transfer>) => Promise<void>
    onCancel: () => void
    saving: boolean
}

export function TransferForm({ initial, onSave, onCancel, saving }: TransferFormProps) {
    const [form, setForm] = useState<Partial<Transfer>>({
        player_name: initial?.player_name ?? '',
        position: initial?.position ?? '',
        stars: initial?.stars ?? null,
        transfer_direction: initial?.transfer_direction ?? 'From',
        school: initial?.school ?? '',
        dev_trait: initial?.dev_trait ?? 'Normal',
        height: initial?.height ?? null,
        weight: initial?.weight ?? null,
    })

    const update = (field: string, value: unknown) => setForm(prev => ({ ...prev, [field]: value }))

    const schoolOptions = useMemo(() => {
        return [...fbsTeams].sort((a, b) => a.name.localeCompare(b.name))
    }, [])

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">{initial?.id ? 'Edit Transfer' : 'Add Transfer'}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {/* Name */}
                    <div className="col-span-2 sm:col-span-1">
                        <Label className="text-xs">Name *</Label>
                        <Input
                            value={form.player_name ?? ''}
                            onChange={(e) => update('player_name', e.target.value)}
                            placeholder="Player name"
                            className="mt-1 h-8 text-sm"
                        />
                    </div>

                    {/* Position */}
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

                    {/* Stars */}
                    <div>
                        <Label className="text-xs">Stars</Label>
                        <Select
                            value={form.stars?.toString() ?? ''}
                            onChange={(e) => update('stars', e.target.value ? Number(e.target.value) : null)}
                            className="mt-1 h-8 text-sm"
                        >
                            <option value="">—</option>
                            {[5, 4, 3, 2, 1].map(s => <option key={s} value={s}>{s} ★</option>)}
                        </Select>
                    </div>

                    {/* Direction */}
                    <div>
                        <Label className="text-xs">Direction *</Label>
                        <Select
                            value={form.transfer_direction ?? 'From'}
                            onChange={(e) => update('transfer_direction', e.target.value)}
                            className="mt-1 h-8 text-sm"
                        >
                            <option value="From">From (incoming)</option>
                            <option value="To">To (outgoing)</option>
                        </Select>
                    </div>

                    {/* School */}
                    <div className="col-span-2 sm:col-span-1">
                        <Label className="text-xs">School *</Label>
                        <Select
                            value={form.school ?? ''}
                            onChange={(e) => update('school', e.target.value)}
                            className="mt-1 h-8 text-sm"
                        >
                            <option value="">Select school</option>
                            {schoolOptions.map(t => (
                                <option key={t.name} value={t.name}>
                                    {t.name} ({t.conference})
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Dev Trait */}
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

                    {/* Height */}
                    <div>
                        <Label className="text-xs">Height</Label>
                        <Input
                            value={form.height ?? ''}
                            onChange={(e) => update('height', e.target.value || null)}
                            placeholder={`6'2"`}
                            className="mt-1 h-8 text-sm"
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
                        disabled={saving || !form.player_name || !form.position || !form.school}
                        className="text-xs font-semibold"
                    >
                        {saving ? 'Saving...' : initial?.id ? 'Save Changes' : 'Add Transfer'}
                    </Button>
                    <Button bg="var(--orange-400)" text="white" size="sm" onClick={onCancel} className="text-xs">
                        Cancel
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
