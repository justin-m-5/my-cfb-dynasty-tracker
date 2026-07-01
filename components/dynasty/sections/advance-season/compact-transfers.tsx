'use client'

import { useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

import { TransferService, type Transfer } from '@/dal/features/transfers'
import { TransferForm } from '@/components/forms/transfer-form'
import { Button } from '@/components/ui/display/button'
import { FilterTabs } from '@/components/ui/layout/filter-tabs'
import { Modal } from '@/components/ui/layout/modal'

interface CompactTransfersProps {
    dynastyId: string
    yearRecordId: string
    transfers: Transfer[]
    onChange: (transfers: Transfer[]) => void
}

type TransferDirection = Transfer['transfer_direction']
type TransferFilter = 'All' | TransferDirection

function sortTransfers(items: Transfer[]) {
    return [...items].sort((a, b) => {
        if (a.transfer_direction !== b.transfer_direction) {
            return a.transfer_direction.localeCompare(b.transfer_direction)
        }
        return a.player_name.localeCompare(b.player_name)
    })
}

export function CompactTransfers({ dynastyId, yearRecordId, transfers, onChange }: CompactTransfersProps) {
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [filter, setFilter] = useState<TransferFilter>('All')

    const orderedTransfers = useMemo(() => sortTransfers(transfers), [transfers])
    const filteredTransfers = useMemo(() => {
        if (filter === 'All') {
            return orderedTransfers
        }

        return orderedTransfers.filter((transfer) => transfer.transfer_direction === filter)
    }, [filter, orderedTransfers])
    const incomingCount = transfers.filter((transfer) => transfer.transfer_direction === 'From').length
    const outgoingCount = transfers.filter((transfer) => transfer.transfer_direction === 'To').length

    const handleAdd = async (form: Partial<Transfer>) => {
        if (saving) return
        setSaving(true)

        try {
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

            if (created) {
                onChange(sortTransfers([...transfers, created]))
                setIsModalOpen(false)
            }
        } catch (err) {
            console.error('Failed to add transfer:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            await TransferService.deleteTransfer(id)
            onChange(transfers.filter((transfer) => transfer.id !== id))
        } catch (err) {
            console.error('Failed to delete transfer:', err)
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
                            <h3 className="text-sm font-semibold text-text">Transfers</h3>
                            <p className="text-[10px] text-text/55">{incomingCount} in • {outgoingCount} out</p>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setIsModalOpen(true)}
                            className="text-xs font-semibold"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add Transfer
                        </Button>
                    </div>
                    <div className="mt-2">
                        <FilterTabs
                            tabs={[
                                { key: 'All' as const, label: 'All' },
                                { key: 'From' as const, label: 'In' },
                                { key: 'To' as const, label: 'Out' },
                            ]}
                            active={filter}
                            onChange={setFilter}
                        />
                    </div>
                </div>

                <div>
                    {filteredTransfers.length > 0 ? filteredTransfers.map((transfer) => {
                        const isIncoming = transfer.transfer_direction === 'From'

                        return (
                            <div
                                key={transfer.id}
                                className="grid gap-2 border-b border-primary/10 px-2 py-2 text-xs last:border-b-0 hover:bg-primary/5 md:grid-cols-[minmax(0,1.5fr)_96px_minmax(0,1.2fr)_60px_32px] md:items-center"
                            >
                                <div className="min-w-0">
                                    <p className="truncate font-semibold text-text">{transfer.player_name}</p>
                                    <p className="text-[10px] text-text/50 md:hidden">{transfer.position} • {transfer.school}</p>
                                </div>
                                <span className="text-[10px] text-text/60 md:text-xs">{transfer.position}</span>
                                <span className="truncate text-[10px] text-text/60 md:text-xs">{transfer.school}</span>
                                <span className={`text-[10px] font-semibold md:text-right ${isIncoming ? 'text-green-600' : 'text-red-500'}`}>
                                    {transfer.transfer_direction}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(transfer.id)}
                                    disabled={deletingId === transfer.id}
                                    className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                                    aria-label={`Delete ${transfer.player_name}`}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )
                    }) : (
                        <div className="px-3 py-6 text-center text-xs text-text/50">
                            {filter === 'All'
                                ? 'No transfers added yet.'
                                : `No ${filter === 'From' ? 'incoming' : 'outgoing'} transfers in this view.`}
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Transfer"
                maxWidth="max-w-4xl"
            >
                <TransferForm
                    onSave={handleAdd}
                    onCancel={() => setIsModalOpen(false)}
                    saving={saving}
                    embedded
                />
            </Modal>
        </>
    )
}
