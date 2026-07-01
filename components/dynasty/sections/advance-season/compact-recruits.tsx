// components/dynasty/sections/advance-season/compact-recruits.tsx

'use client'

import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'

import { RecruitService, type Recruit } from '@/dal/features/recruits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { PositionOptions } from '@/components/ui/position-options'
import { starsColor, starsDisplay, usStates } from '@/lib/recruit-config'

interface CompactRecruitsProps {
    dynastyId: string
    yearRecordId: string
    recruits: Recruit[]
    onChange: (recruits: Recruit[]) => void
}

function sortRecruits(items: Recruit[]) {
    return [...items].sort((a, b) => {
        const starDiff = (b.stars ?? 0) - (a.stars ?? 0)
        if (starDiff !== 0) return starDiff
        return a.name.localeCompare(b.name)
    })
}

export function CompactRecruits({ dynastyId, yearRecordId, recruits, onChange }: CompactRecruitsProps) {
    const [form, setForm] = useState({
        name: '',
        position: '',
        stars: '3',
        state: '',
    })
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const orderedRecruits = useMemo(() => sortRecruits(recruits), [recruits])

    const update = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const handleAdd = async () => {
        if (saving || !form.name.trim() || !form.position) return
        setSaving(true)

        try {
            const created = await RecruitService.createRecruit({
                dynasty_id: dynastyId,
                year_record_id: yearRecordId,
                name: form.name.trim(),
                position: form.position,
                stars: form.stars ? Number(form.stars) : null,
                dev_trait: 'Normal',
                state: form.state || null,
                national_rank: null,
                state_rank: null,
                position_rank: null,
                height: null,
                weight: null,
            })

            if (created) {
                onChange(sortRecruits([...recruits, created]))
                setForm({
                    name: '',
                    position: '',
                    stars: '3',
                    state: '',
                })
            }
        } catch (err) {
            console.error('Failed to add recruit:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            await RecruitService.deleteRecruit(id)
            onChange(recruits.filter((recruit) => recruit.id !== id))
        } catch (err) {
            console.error('Failed to delete recruit:', err)
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-primary/15 bg-background/80">
            <div className="border-b border-primary/10 px-3 py-2">
                <h3 className="text-sm font-semibold text-text">Recruits</h3>
                <p className="text-[10px] text-text/55">{recruits.length} incoming freshmen tracked</p>
            </div>

            <div className="grid gap-2 border-b border-primary/10 p-2 md:grid-cols-[minmax(0,1.4fr)_96px_88px_96px_auto]">
                <Input
                    value={form.name}
                    onChange={(event) => update('name', event.target.value)}
                    placeholder="Player name"
                    className="h-8 text-base sm:text-xs"
                />
                <Select
                    value={form.position}
                    onChange={(event) => update('position', event.target.value)}
                    className="h-8 text-base sm:text-xs"
                >
                    <option value="">Position</option>
                    <PositionOptions />
                </Select>
                <Select
                    value={form.stars}
                    onChange={(event) => update('stars', event.target.value)}
                    className="h-8 text-base sm:text-xs"
                >
                    {[5, 4, 3, 2, 1].map((stars) => (
                        <option key={stars} value={stars}>{stars} ★</option>
                    ))}
                </Select>
                <Select
                    value={form.state}
                    onChange={(event) => update('state', event.target.value)}
                    className="h-8 text-base sm:text-xs"
                >
                    <option value="">State</option>
                    {usStates.map((state) => (
                        <option key={state} value={state}>{state}</option>
                    ))}
                </Select>
                <Button
                    size="sm"
                    variant="save"
                    onClick={handleAdd}
                    disabled={saving || !form.name.trim() || !form.position}
                    className="h-8 text-base sm:text-xs font-semibold"
                >
                    {saving ? 'Adding...' : 'Add'}
                </Button>
            </div>

            <div>
                {orderedRecruits.length > 0 ? orderedRecruits.map((recruit) => (
                    <div
                        key={recruit.id}
                        className="grid gap-2 border-b border-primary/10 px-2 py-2 text-xs last:border-b-0 hover:bg-primary/5 md:grid-cols-[minmax(0,1.4fr)_96px_88px_96px_32px] md:items-center"
                    >
                        <div className="min-w-0">
                            <p className="truncate font-semibold text-text">{recruit.name}</p>
                            <p className="text-[10px] text-text/50 md:hidden">{recruit.position} • {recruit.state ?? '—'} • {starsDisplay(recruit.stars)}</p>
                        </div>
                        <span className="text-[10px] text-text/60 md:text-xs">{recruit.position}</span>
                        <span className={`text-[10px] font-semibold md:text-xs ${starsColor(recruit.stars)}`}>
                            {starsDisplay(recruit.stars)}
                        </span>
                        <span className="text-[10px] text-text/60 md:text-xs">{recruit.state ?? '—'}</span>
                        <button
                            type="button"
                            onClick={() => handleDelete(recruit.id)}
                            disabled={deletingId === recruit.id}
                            className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                            aria-label={`Delete ${recruit.name}`}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )) : (
                    <div className="px-3 py-6 text-center text-xs text-text/50">No recruits added yet.</div>
                )}
            </div>
        </div>
    )
}
