// components/dynasty/dynasty-nav-shell.tsx

'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
    { name: 'Team Home', segment: '' },
    { name: 'Schedule', segment: 'schedule' },
    { name: 'Top 25', segment: 'top-25' },
    { name: 'Roster', segment: 'roster' },
    { name: 'Recruiting', segment: 'recruiting' },
    { name: 'Transfers', segment: 'transfers' },
    { name: 'Player Stats', segment: 'player-stats' },
    { name: 'Player Awards', segment: 'player-awards' },
    { name: 'Season History', segment: 'season-history' },
    { name: 'Trophy Case', segment: 'trophy-case' },
    { name: 'Social Media', segment: 'social-media' },
    { name: 'Tools', segment: 'tools' },
]

interface DynastyNavShellProps {
    dynastyId: string
}

export function DynastyNavShell({ dynastyId }: DynastyNavShellProps) {
    const pathname = usePathname()

    const basePath = `/dashboard/dynasty/${dynastyId}`

    const activeSegment = (() => {
        const after = pathname.replace(basePath, '').replace(/^\//, '')
        return after || ''
    })()

    return (
        <nav className="w-full rounded-xl border border-primary/20 bg-background/70">
            <div className="px-4 sm:px-6">
                <div className="overflow-x-auto py-3">
                    <div className="flex min-w-max gap-1">
                        {navItems.map((item) => {
                            const isActive = activeSegment === item.segment
                            const href = item.segment
                                ? `${basePath}/${item.segment}`
                                : basePath

                            return (
                                <Fragment key={item.segment}>
                                    <Link
                                        href={href}
                                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-primary text-white'
                                                : 'text-text/70 hover:bg-primary/10 hover:text-text'
                                        }`}
                                    >
                                        {item.name}
                                    </Link>
                                </Fragment>
                            )
                        })}
                    </div>
                </div>
            </div>
        </nav>
    )
}
