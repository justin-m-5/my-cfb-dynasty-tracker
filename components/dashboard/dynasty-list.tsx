// components/dashboard/dynasty-list.tsx

'use client'

import Link from 'next/link'

import { buttonStyles } from '@/lib/button-utils'
import type { DynastySummary } from '@/dal/features/dynasty'
import { Dynasty } from './dynasty'

interface DynastyListProps {
    dynasties: DynastySummary[]
    onDelete: (id: string) => Promise<void>
}

export function DynastyList({ dynasties, onDelete }: DynastyListProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-text">Your Dynasties</h2>
                <Link
                    href="/dashboard/create-dynasty"
                    {...buttonStyles({ size: 'sm', bg: 'var(--primary)', text: 'white', className: 'font-semibold' })}
                >
                    New Dynasty
                </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dynasties.map((dynasty) => (
                    <Dynasty key={dynasty.id} dynasty={dynasty} onDelete={onDelete} />
                ))}
            </div>
        </div>
    )
}
