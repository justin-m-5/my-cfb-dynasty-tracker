// components/dynasty/sections/transfers.tsx

'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

import { YearRecordService } from '@/dal/features/year-records'
import { TransferService, type Transfer } from '@/dal/features/transfers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TransferList } from './transfers/transfer-list'
import { TransferForm } from './transfers/transfer-form'

interface TransfersProps {
    dynastyId: string
}

export function Transfers({ dynastyId }: TransfersProps) {
    const [transfers, setTransfers] = useState<Transfer[]>([])
    const [yearRecordId, setYearRecordId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<Transfer | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const yr = await YearRecordService.getCurrentYearRecord(dynastyId)
                if (yr) {
                    setYearRecordId(yr.id)
                    const data = await TransferService.getTransfers(dynastyId, yr.id)
                    setTransfers(data)
                }
            } catch (err) {
                console.error('Failed to load transfers:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [dynastyId])

    const handleSave = async (form: Partial<Transfer>) => {
        if (!yearRecordId) return
        setSaving(true)
        try {
            if (editing?.id) {
                await TransferService.updateTransfer(editing.id, form)
                setTransfers(prev => prev.map(t => t.id === editing.id ? { ...t, ...form } as Transfer : t))
            } else {
                const created = await TransferService.createTransfer({
                    dynasty_id: dynastyId,
                    year_record_id: yearRecordId,
                    player_name: form.player_name ?? '',
                    position: form.position ?? '',
                    stars: form.stars ?? null,
                    transfer_direction: form.transfer_direction ?? 'From',
                    school: form.school ?? '',
                    dev_trait: form.dev_trait ?? 'Normal',
                    height: form.height ?? null,
                    weight: form.weight ?? null,
                })
                if (created) setTransfers(prev => [...prev, created])
            }
            setShowForm(false)
            setEditing(null)
        } catch (err) {
            console.error('Failed to save transfer:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await TransferService.deleteTransfer(id)
            setTransfers(prev => prev.filter(t => t.id !== id))
        } catch (err) {
            console.error('Failed to delete transfer:', err)
        }
    }

    const handleEdit = (transfer: Transfer) => {
        setEditing(transfer)
        setShowForm(true)
    }

    const handleCancel = () => {
        setShowForm(false)
        setEditing(null)
    }

    if (loading) {
        return <div className="text-sm text-text/60">Loading transfers...</div>
    }

    return (
        <div className="space-y-4">
            {showForm && (
                <TransferForm
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
                            Transfer Portal ({transfers.length})
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
                                Add Transfer
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <TransferList
                        transfers={transfers}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
