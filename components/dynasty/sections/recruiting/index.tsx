// components/dynasty/sections/recruiting.tsx

'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

import { YearRecordService } from '@/dal/features/year-records'
import { RecruitService, type Recruit } from '@/dal/features/recruits'
import { Button } from '@/components/ui/display/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card'
import { RecruitList } from './recruit-list'
import { RecruitForm } from '../../../forms/recruit-form'

interface RecruitingProps {
    dynastyId: string
}

export function Recruiting({ dynastyId }: RecruitingProps) {
    const [recruits, setRecruits] = useState<Recruit[]>([])
    const [yearRecordId, setYearRecordId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<Recruit | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const yr = await YearRecordService.getCurrentYearRecord(dynastyId)
                if (yr) {
                    setYearRecordId(yr.id)
                    const data = await RecruitService.getRecruits(dynastyId, yr.id)
                    setRecruits(data)
                }
            } catch (err) {
                console.error('Failed to load recruits:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [dynastyId])

    const handleSave = async (form: Partial<Recruit>) => {
        if (!yearRecordId) return
        setSaving(true)
        try {
            if (editing?.id) {
                await RecruitService.updateRecruit(editing.id, form)
                setRecruits(prev => prev.map(r => r.id === editing.id ? { ...r, ...form } as Recruit : r))
            } else {
                const created = await RecruitService.createRecruit({
                    dynasty_id: dynastyId,
                    year_record_id: yearRecordId,
                    name: form.name ?? '',
                    position: form.position ?? '',
                    stars: form.stars ?? null,
                    dev_trait: form.dev_trait ?? 'Normal',
                    state: form.state ?? null,
                    national_rank: form.national_rank ?? null,
                    state_rank: form.state_rank ?? null,
                    position_rank: form.position_rank ?? null,
                    height: form.height ?? null,
                    weight: form.weight ?? null,
                })
                if (created) setRecruits(prev => [...prev, created])
            }
            setShowForm(false)
            setEditing(null)
        } catch (err) {
            console.error('Failed to save recruit:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await RecruitService.deleteRecruit(id)
            setRecruits(prev => prev.filter(r => r.id !== id))
        } catch (err) {
            console.error('Failed to delete recruit:', err)
        }
    }

    const handleEdit = (recruit: Recruit) => {
        setEditing(recruit)
        setShowForm(true)
    }

    const handleCancel = () => {
        setShowForm(false)
        setEditing(null)
    }

    if (loading) {
        return <div className="text-sm text-text/60">Loading recruiting...</div>
    }

    return (
        <div className="space-y-4 pt-10">
            {showForm && (
                <RecruitForm
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
                            Recruiting Class ({recruits.length})
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
                                Add Recruit
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <RecruitList
                        recruits={recruits}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
