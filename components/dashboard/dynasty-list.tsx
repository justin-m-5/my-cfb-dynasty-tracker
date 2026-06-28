// components/dashboard/dynasty-list.tsx

import Link from 'next/link'

import { buttonStyles } from '@/components/ui/button'
import type { DynastySummary } from '@/dal/features/dynasty'

interface DynastyListProps {
    dynasties: DynastySummary[]
}

export function DynastyList({ dynasties }: DynastyListProps) {
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
                    <Link
                        key={dynasty.id}
                        href={`/dashboard/dynasty/${dynasty.id}`}
                        className="group rounded-xl border border-primary/20 bg-background/70 p-5 transition-all hover:border-primary/40 hover:shadow-md"
                    >
                        <div className="mb-3 flex items-center gap-3">
                            <span
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: dynasty.primary_color ?? 'var(--primary)' }}
                            />
                            <p className="font-bold text-text group-hover:text-primary">
                                {dynasty.name}
                            </p>
                        </div>

                        <p className="text-sm text-text/80">
                            {dynasty.school_name}
                            {dynasty.school_nickname ? ` ${dynasty.school_nickname}` : ''}
                        </p>

                        <p className="mt-1 text-xs text-text/60">
                            {dynasty.conference ?? 'Independent'} • Year {dynasty.current_year}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-text/70">
                            <span>{dynasty.total_wins}W – {dynasty.total_losses}L</span>
                            <span>🏆 {dynasty.championships}</span>
                            <span>Seasons: {dynasty.seasons_played}</span>
                        </div>

                        <p className="mt-2 text-xs text-text/50">
                            Coach {dynasty.coach_name}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    )
}
