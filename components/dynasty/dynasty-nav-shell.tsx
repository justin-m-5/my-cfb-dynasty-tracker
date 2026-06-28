// components/dynasty/dynasty-nav-shell.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

import { DynastyService, type Dynasty } from '@/dal/features/dynasty'
import { LogoImage } from '@/components/ui/logo-image'
import { conferenceLogoByName, getSchoolLogoCandidates } from '@/lib/logos'

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
    const [dynasty, setDynasty] = useState<Dynasty | null>(null)

    useEffect(() => {
        DynastyService.getDynastyById(dynastyId).then(setDynasty)
    }, [dynastyId])

    const basePath = `/dashboard/dynasty/${dynastyId}`

    const activeSegment = (() => {
        const after = pathname.replace(basePath, '').replace(/^\//, '')
        return after || ''
    })()

    const conferenceLogo = dynasty?.conference
        ? conferenceLogoByName[dynasty.conference] ?? null
        : null
    const schoolLogos = dynasty
        ? getSchoolLogoCandidates(dynasty.school_name, dynasty.school_nickname)
        : []

    return (
        <nav className="w-full rounded-xl border border-primary/20 bg-background/70">
            <div className="px-4 sm:px-6">
                {/* Top Row — Team Info */}
                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                        {dynasty && (
                            <LogoImage candidates={schoolLogos} alt={dynasty.school_name} size={48} />
                        )}
                        <div>
                            <h1 className="text-lg font-bold text-text">
                                {dynasty?.current_year} Season
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-text/70">
                                {conferenceLogo && (
                                    <Image
                                        src={conferenceLogo}
                                        alt={dynasty?.conference ?? ''}
                                        width={18}
                                        height={18}
                                        className="rounded object-contain"
                                        unoptimized
                                    />
                                )}
                                <span>{dynasty?.school_name}{dynasty?.school_nickname ? ` ${dynasty.school_nickname}` : ''}</span>
                            </div>
                        </div>
                    </div>

                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-text/60 hover:text-primary"
                    >
                        ← Dashboard
                    </Link>
                </div>

                {/* Bottom Row — Nav Tabs */}
                <div className="overflow-x-auto pb-2">
                    <div className="flex min-w-max gap-1">
                        {navItems.map((item) => {
                            const isActive = activeSegment === item.segment
                            const href = item.segment
                                ? `${basePath}/${item.segment}`
                                : basePath

                            return (
                                <Link
                                    key={item.segment}
                                    href={href}
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-primary text-white'
                                            : 'text-text/70 hover:bg-primary/10 hover:text-text'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        </nav>
    )
}
