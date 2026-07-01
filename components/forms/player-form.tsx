// components/forms/player-form.tsx

'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, X } from 'lucide-react'
import { Button } from '@/components/ui/display/button'
import { Input } from '@/components/ui/form/input'
import { Select } from '@/components/ui/form/select'
import { Label } from '@/components/ui/form/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card'
import { PositionOptions } from '@/components/ui/form/position-options'
import { years, devTraits } from '@/lib/config/player-config'
import type { RosterPlayer } from '@/dal/features/players'

// Combined form data for both player identity + season fields
export interface PlayerFormData {
    // Identity
    name: string
    position: string
    height: string | null
    weight: number | null
    // Season
    dev_trait: string | null
    year: string | null
    rating: number | null
    jersey_number: number | null
    is_redshirted: boolean
    notes: string | null
    // Image (file to upload, handled separately by parent)
    imageFile?: File | null
    removeImage?: boolean
}

interface PlayerFormProps {
    initial?: Partial<RosterPlayer>
    onSave: (data: PlayerFormData) => Promise<void>
    onCancel: () => void
    saving: boolean
}

export function PlayerForm({ initial, onSave, onCancel, saving }: PlayerFormProps) {
    const fileRef = useRef<HTMLInputElement>(null)
    const [form, setForm] = useState<PlayerFormData>({
        name: initial?.name ?? '',
        position: initial?.position ?? '',
        height: initial?.height ?? null,
        weight: initial?.weight ?? null,
        dev_trait: initial?.season?.dev_trait ?? 'Normal',
        year: initial?.season?.year ?? null,
        rating: initial?.season?.rating ?? null,
        jersey_number: initial?.season?.jersey_number ?? null,
        is_redshirted: initial?.season?.is_redshirted ?? false,
        notes: initial?.season?.notes ?? '',
        imageFile: null,
        removeImage: false,
    })
    const [preview, setPreview] = useState<string | null>(initial?.avatar_url ?? null)

    const update = (field: string, value: unknown) => setForm(prev => ({ ...prev, [field]: value }))

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 4 * 1024 * 1024) {
            alert('Image must be under 4MB')
            return
        }
        setForm(prev => ({ ...prev, imageFile: file, removeImage: false }))
        setPreview(URL.createObjectURL(file))
    }

    const handleRemoveImage = () => {
        setForm(prev => ({ ...prev, imageFile: null, removeImage: true }))
        setPreview(null)
        if (fileRef.current) fileRef.current.value = ''
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">{initial?.id ? 'Edit Player' : 'Add Player'}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {/* Headshot */}
                    <div className="col-span-2 sm:col-span-3 flex items-center gap-3">
                        <div className="relative h-14 w-14 shrink-0 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden">
                            {preview ? (
                                <>
                                    <Image src={preview} alt="Headshot" width={56} height={56} className="h-full w-full object-cover" unoptimized />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -right-0.5 -top-0.5 rounded-full bg-red-500 p-0.5 text-white shadow-sm"
                                    >
                                        <X className="h-2.5 w-2.5" />
                                    </button>
                                </>
                            ) : (
                                <Camera className="h-5 w-5 text-text/30" />
                            )}
                        </div>
                        <div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => fileRef.current?.click()}
                                className="text-xs"
                            >
                                {preview ? 'Change Photo' : 'Add Photo'}
                            </Button>
                            <p className="mt-0.5 text-[10px] text-text/40">Optional headshot</p>
                        </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                        <Label className="text-xs">Name *</Label>
                        <Input
                            value={form.name ?? ''}
                            onChange={(e) => update('name', e.target.value)}
                            placeholder="Player name"
                            className="mt-1 h-8"
                        />
                    </div>
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
                    <div>
                        <Label className="text-xs">Jersey #</Label>
                        <Input
                            type="number"
                            min={0}
                            max={99}
                            value={form.jersey_number ?? ''}
                            onChange={(e) => update('jersey_number', e.target.value ? Number(e.target.value) : null)}
                            className="mt-1 h-8"
                        />
                    </div>
                    <div>
                        <Label className="text-xs">Year</Label>
                        <Select
                            value={form.year ?? ''}
                            onChange={(e) => update('year', e.target.value || null)}
                            className="mt-1 h-8"
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
                            className="mt-1 h-8"
                        />
                    </div>
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
                    <div>
                        <Label className="text-xs">Height</Label>
                        <Input
                            value={form.height ?? ''}
                            onChange={(e) => update('height', e.target.value || null)}
                            placeholder={`6'2"`}
                            className="mt-1 h-8"
                        />
                    </div>
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
                    <div className="col-span-2 sm:col-span-3">
                        <Label className="text-xs">Notes</Label>
                        <Input
                            value={form.notes ?? ''}
                            onChange={(e) => update('notes', e.target.value)}
                            placeholder="Optional notes"
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
                        {saving ? 'Saving...' : initial?.id ? 'Save Changes' : 'Add Player'}
                    </Button>
                    <Button variant="cancel" size="sm" onClick={onCancel} className="text-xs">
                        Cancel
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
