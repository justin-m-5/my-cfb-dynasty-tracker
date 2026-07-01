// components/dynasty/sections/advance-season/compact-transfers.tsx

'use client'

import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'

import { TransferService, type Transfer } from '@/dal/features/transfers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { RecruitPositionOptions } from '@/components/ui/position-options'
import { TeamSearch } from '@/components/dynasty/sections/top25/team-search'
import { fbsTeams } from '@/lib/fbs-teams'
import { cn } from '@/lib/utils'

interface CompactTransfersProps {
    dynastyId: string
    yearRecordId: string
    transfers: Transfer[]
    onChange: (transfers: Transfer[]) => void
}

type TransferDirection = Transfer['transfer_direction']
type FilterTab = 'All' | 'In' | 'Out'

function sortTransfers(items: Transfer[]) {
    return [...items].sort((a, b) => {
        if (a.transfer_direction !== b.transfer_direction) {
            return a.transfer_direction.localeCompare(b.transfer_direction)
        }
        return a.player_name.localeCompare(b.player_name)
    })
}

export function CompactTransfers({ dynastyId, yearRecordId, transfers, onChange }: CompactTransfersProps) {
    const [form, setForm] = useState({
        player_name: '',
        position: '',
        school: '',
        transfer_direction: 'From' as TransferDirection,
    })
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [filter, setFilter] = useState<FilterTab>('All')

    const orderedTransfers = useMemo(() => sortTransfers(transfers), [transfers])
    const incomingCount = transfers.filter((t) => t.transfer_direction === 'From').length
    const outgoingCount = transfers.filter((t) => t.transfer_direction === 'To').length

    const filteredTransfers = useMemo(() => {
        if (filter === 'In') return orderedTransfers.filter((t) => t.transfer_direction === 'From')
        if (filter === 'Out') return orderedTransfers.filter((t) => t.transfer_direction === 'To')
        return orderedTransfers
    }, [orderedTransfers, filter])

    const update = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const handleAdd = async () => {
        if (saving || !form.player_name.trim() || !form.position || !form.school.trim()) return
        setSaving(true)

        try {
            const created = await TransferService.createTransfer({
                dynasty_id: dynastyId,
                year_record_id: yearRecordId,
                player_name: form.player_name.trim(),
                position: form.position,
                stars: null,
                transfer_direction: form.transfer_direction,
                school: form.school.trim(),
                dev_trait: 'Normal',
                height: null,
                weight: null,
            })

            if (created) {
                onChange(sortTransfers([...transfers, created]))
                setForm({
                    player_name: '',
                    position: '',
                    school: '',
                    transfer_direction: form.transfer_direction,
                })
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

    const filterTabs: { key: FilterTab; label: string }[] = [
        { key: 'All', label: `All (${transfers.length})` },
        { key: 'In', label: `In (${incomingCount})` },
        { key: 'Out', label: `Out (${outgoingCount})` },
    ]

    return (
        <div className="overflow-hidden rounded-2xl border border-primary/15 bg-background/80">
            <div className="border-b border-primary/10 px-3 py-2">
                <h3 className="text-sm font-semibold text-text">Transfers</h3>
                <p className="text-[10px] text-text/55">{incomingCount} in • {outgoingCount} out</p>
            </div>

            {/* Add form */}
            <div className="grid gap-2 border-b border-primary/10 p-2 md:grid-cols-[minmax(0,1.5fr)_96px_80px_minmax(0,1.2fr)_auto]">
                <Input
                    value={form.player_name}
                    onChange={(event) => update('player_name', event.target.value)}
                    placeholder="Player name"
                    className="h-8 text-base sm:text-xs"
                />
                <Select
                    value={form.position}
                    onChange={(event) => update('position', event.target.value)}
                    className="h-8 text-base sm:text-xs"
                >
                    <option value="">Position</option>
                    <RecruitPositionOptions />
                </Select>
                <Select
                    value={form.transfer_direction}
                    onChange={(event) => update('transfer_direction', event.target.value as TransferDirection)}
                    className="h-8 text-base sm:text-xs"
                >
                    <option value="From">In</option>
                    <option value="To">Out</option>
                </Select>
                <TeamSearch
                    value={form.school}
                    teams={fbsTeams}
                    onChange={(name) => update('school', name)}
                    inputClassName="h-8 text-base sm:text-xs"
                />
                <Button
                    size="sm"
                    variant="save"
                    onClick={handleAdd}
                    disabled={saving || !form.player_name.trim() || !form.position || !form.school.trim()}
                    className="h-8 text-base sm:text-xs font-semibold"
                >
                    {saving ? '...' : 'Add'}
                </Button>
            </div>

            {/* Filter tabs */}
            <div className="flex border-b border-primary/10">
                {filterTabs.map(({ key, label }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setFilter(key)}
                        className={cn(
                            'flex-1 px-3 py-1.5 text-xs font-medium transition-colors',
                            filter === key
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-text/50 hover:text-text/80'
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* List */}
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
                            <span className="hidden text-text/60 md:block">{transfer.position}</span>
                            <span className="hidden truncate text-text/60 md:block">{transfer.school}</span>
                            <span className={`text-[10px] font-semibold md:text-right ${isIncoming ? 'text-green-600' : 'text-red-500'}`}>
                                {isIncoming ? 'In' : 'Out'}
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
                    <div className="px-3 py-6 text-center text-xs text-text/50">No transfers added yet.</div>
                )}
            </div>
        </div>
    )
}
