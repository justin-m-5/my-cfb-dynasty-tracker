// components/dynasty/sections/transfers/transfer-row.tsx

import { Pencil, Trash2 } from 'lucide-react'
import { starsDisplay, starsColor } from '@/lib/config/recruit-config'
import type { Transfer } from '@/dal/features/transfers'

interface TransferRowProps {
    transfer: Transfer
    onEdit: (transfer: Transfer) => void
    onDelete: (id: string) => void
}

export function TransferRow({ transfer, onEdit, onDelete }: TransferRowProps) {
    const dirColor = transfer.transfer_direction === 'From'
        ? 'text-green-600'
        : 'text-red-500'

    return (
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-primary/10 last:border-b-0 hover:bg-primary/5 transition-colors">
            {/* Stars */}
            <span className={`w-7 shrink-0 text-center text-[10px] font-bold ${starsColor(transfer.stars)}`}>
                {starsDisplay(transfer.stars)}
            </span>

            {/* Name + Position */}
            <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-text block truncate">{transfer.player_name}</span>
                <span className="text-[10px] text-text/50">{transfer.position}</span>
            </div>

            {/* Direction */}
            <span className={`w-10 shrink-0 text-center text-[10px] font-semibold ${dirColor}`}>
                {transfer.transfer_direction}
            </span>

            {/* School */}
            <span className="w-24 shrink-0 text-[10px] text-text/70 truncate hidden sm:block">
                {transfer.school}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-0.5 w-12 shrink-0 justify-end">
                <button
                    onClick={() => onEdit(transfer)}
                    className="p-1 rounded hover:bg-primary/10 transition-colors"
                >
                    <Pencil className="h-3.5 w-3.5 text-text/50" />
                </button>
                <button
                    onClick={() => onDelete(transfer.id)}
                    className="p-1 rounded hover:bg-red-500/10 transition-colors"
                >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </button>
            </div>
        </div>
    )
}
