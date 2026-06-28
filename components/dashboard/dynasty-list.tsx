// components/dashboard/dynasty-list.tsx

import Link from 'next/link'

import { buttonStyles } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DynastySummary } from '@/dal/features/dynasty'

interface DynastyListProps {
    dynasties: DynastySummary[]
}

export function DynastyList({ dynasties }: DynastyListProps) {
    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-xl">Your Dynasties</CardTitle>
                <Link
                    href="/dashboard/create-dynasty"
                    {...buttonStyles({ size: 'sm', bg: 'var(--primary)', text: 'white', className: 'font-semibold' })}
                >
                    New Dynasty
                </Link>
                </div>
            </CardHeader>

            <CardContent>
                <ul className="space-y-3">
                    {dynasties.map((dynasty) => (
                        <li key={dynasty.id} className="rounded-xl border border-primary/20 bg-background/70 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-text">{dynasty.name}</p>
                                    <p className="text-sm text-text/80">
                                        {dynasty.school_name}
                                        {dynasty.school_nickname ? ` ${dynasty.school_nickname}` : ''}
                                        {' • Year '}
                                        {dynasty.current_year}
                                    </p>
                                </div>
                                <Link
                                    href={`/dashboard/dynasty/${dynasty.id}`}
                                    {...buttonStyles({ size: 'sm', bg: 'var(--accent)', text: 'white' })}
                                >
                                    Open
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}
