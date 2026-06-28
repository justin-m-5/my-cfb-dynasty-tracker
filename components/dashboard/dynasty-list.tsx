// components/dashboard/dynasty-list.tsx

'use client'

import Link from 'next/link'
import Image from 'next/image'

import { buttonStyles } from '@/components/ui/button'
import { LogoImage } from '@/components/ui/logo-image'
import { conferenceLogoByName, getSchoolLogoCandidates } from '@/lib/logos'
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
                {dynasties.map((dynasty) => {
                    const conferenceLogo = dynasty.conference
                        ? conferenceLogoByName[dynasty.conference] ?? null
                        : null
                    const schoolLogos = getSchoolLogoCandidates(
                        dynasty.school_name,
                        dynasty.school_nickname
                    )

                    return (
                        <Link
                            key={dynasty.id}
                            href={`/dashboard/dynasty/${dynasty.id}`}
                            className="group rounded-xl border border-primary/20 bg-background/70 p-5 transition-all hover:border-primary/40 hover:shadow-md"
                        >
                            <div className="mb-3 flex items-center gap-3">
                                <LogoImage candidates={schoolLogos} alt={dynasty.school_name} size={40} />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-bold text-text group-hover:text-primary">
                                        {dynasty.name}
                                    </p>
                                    <p className="truncate text-sm text-text/80">
                                        {dynasty.school_name}
                                        {dynasty.school_nickname ? ` ${dynasty.school_nickname}` : ''}
                                    </p>
                                </div>
                            </div>

                            <p className="mt-2 text-sm text-text/80">
                                Coach {dynasty.coach_name}
                            </p>

                            <div className="flex items-center gap-2 text-xs text-text/60">
                                {conferenceLogo ? (
                                    <Image
                                        src={conferenceLogo}
                                        alt={dynasty.conference ?? ''}
                                        width={20}
                                        height={20}
                                        className="rounded object-contain"
                                        unoptimized
                                    />
                                ) : null}
                                <span>{dynasty.conference ?? 'Independent'}</span>
                                <span>•</span>
                                <span>Year {dynasty.current_year}</span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-3 text-xs text-text/70">
                                <span>{dynasty.total_wins}W - {dynasty.total_losses}L</span>
                                <span>🏆 {dynasty.championships}</span>
                                <span>Seasons: {dynasty.seasons_played}</span>
                            </div>

                            
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
