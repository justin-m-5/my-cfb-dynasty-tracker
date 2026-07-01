'use client'

import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

import { RecruitService, type Recruit } from '@/dal/features/recruits'
import { RecruitForm } from '@/components/forms/recruit-form'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { starsColor, starsDisplay } from '@/lib/recruit-config'

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
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const orderedRecruits = useMemo(() => sortRecruits(recruits), [recruits])

    const handleAdd = async (form: Partial<Recruit>) => {
        if (saving) return
        setSaving(true)

        try {
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

            if (created) {
                onChange(sortRecruits([...recruits, created]))
                setIsModalOpen(false)
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
        <>
            <div className="overflow-hidden rounded-2xl border border-primary/15 bg-background/80">
                <div className="border-b border-primary/10 px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h3 className="text-sm font-semibold text-text">Recruits</h3>
                            <p className="text-[10px] text-text/55">{recruits.length} incoming freshmen tracked</p>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setIsModalOpen(true)}
                            className="text-xs font-semibold"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add Recruit
                        </Button>
                    </div>
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Recruit"
                maxWidth="max-w-4xl"
            >
                <RecruitForm
                    onSave={handleAdd}
                    onCancel={() => setIsModalOpen(false)}
                    saving={saving}
                    embedded
                />
            </Modal>
        </>
    )
}
