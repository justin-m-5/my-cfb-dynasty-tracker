// components/dynasty/sections/transfers/transfer-list.tsx

'use client'

import type { Transfer } from '@/dal/features/transfers'
import { TransferRow } from './transfer-row'

interface TransferListProps {
    transfers: Transfer[]
    onEdit: (transfer: Transfer) => void
    onDelete: (id: string) => void
}

export function TransferList({ transfers, onEdit, onDelete }: TransferListProps) {
    if (transfers.length === 0) {
        return (
            <p className="text-sm text-text/60 py-4 text-center">
                No transfers yet. Add your first transfer above.
            </p>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-text/50 border-b border-primary/15">
                <span className="w-7 shrink-0 text-center">★</span>
                <span className="flex-1 min-w-0">Player</span>
                <span className="w-10 shrink-0 text-center">Dir.</span>
                <span className="w-24 shrink-0 hidden sm:block">School</span>
                <span className="w-12 shrink-0" />
            </div>

            {/* Rows */}
            {transfers.map(transfer => (
                <TransferRow
                    key={transfer.id}
                    transfer={transfer}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    )
}
