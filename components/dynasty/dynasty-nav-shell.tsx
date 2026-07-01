// components/dynasty/dynasty-nav-shell.tsx

'use client'

import { usePathname } from 'next/navigation'
import { SidebarNav, type SidebarNavItem } from '@/components/ui/sidebar-nav'

const segments = [
    // yearly things
    { name: 'Team Home', segment: '' },
    { name: 'Schedule', segment: 'schedule' },
    { name: 'Top 25', segment: 'top-25' },
    { name: 'Roster', segment: 'roster' },
    { name: 'Recruiting', segment: 'recruiting' },
    { name: 'Transfers', segment: 'transfers' },
    { name: 'Player Stats', segment: 'player-stats' },
    { name: 'Player Awards', segment: 'player-awards' },
    // career things
    { name: 'Season History', segment: 'season-history' },
]

interface DynastyNavShellProps {
    dynastyId: string
}

export function DynastyNavShell({ dynastyId }: DynastyNavShellProps) {
    const pathname = usePathname()
    const basePath = `/dashboard/dynasty/${dynastyId}`

    const activeSegment = pathname.replace(basePath, '').replace(/^\//, '') || ''

    const items: SidebarNavItem[] = segments.map(s => ({
        name: s.name,
        key: s.segment,
        href: s.segment ? `${basePath}/${s.segment}` : basePath,
    }))

    return <SidebarNav items={items} active={activeSegment} />
}
