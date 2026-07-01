// components/dashboard/dynasty.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Trophy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LogoImage } from '@/components/ui/logo-image'
import { conferenceLogoByName, getSchoolLogoCandidates, getTeamLogo } from '@/lib/logos'
import type { DynastySummary } from '@/dal/features/dynasty'

interface DynastyProps {
    dynasty: DynastySummary
    onDelete: (id: string) => Promise<void>
}

export function Dynasty({ dynasty, onDelete }: DynastyProps) {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await onDelete(dynasty.id)
        } finally {
            setIsDeleting(false)
            setIsConfirmingDelete(false)
        }
    }

    const conferenceLogo = dynasty.conference ? conferenceLogoByName[dynasty.conference] ?? null : null
    const schoolLogos = Array.from(
        new Set([
            getTeamLogo(dynasty.school_name),
            ...getSchoolLogoCandidates(dynasty.school_name, dynasty.school_nickname),
        ].filter(Boolean))
    )

    return (
        <div className="group relative rounded-xl border border-primary/20 bg-background/70 transition-all hover:border-primary/40 hover:shadow-md">
            
            {/* Replaced the <Link> wrapper with a standard <div> */}
            <div className="block p-5">
                <div className="mb-3 flex items-center gap-3">
                    <LogoImage candidates={schoolLogos} alt={dynasty.school_name} size={40} />
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-text group-hover:text-primary">{dynasty.name}</p>
                        <p className="truncate text-sm text-text/80">
                            {dynasty.school_name}
                            {dynasty.school_nickname ? ` ${dynasty.school_nickname}` : ''}
                        </p>
                    </div>
                </div>

                <p className="mt-2 text-sm text-text/80">Coach {dynasty.coach_name}</p>

                <div className="flex items-center gap-2 text-xs text-text/60">
                    {conferenceLogo ? (
                        <Image
                            src={conferenceLogo}
                            alt={dynasty.conference ?? ''}
                            width={24}
                            height={24}
                            className="rounded object-contain bg-white dark:bg-white"
                            unoptimized
                        />
                    ) : null}
                    <span>{dynasty.conference ?? 'Independent'}</span>
                    <span>•</span>
                    <span>Year {dynasty.current_year}</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-xs text-text/70">
                    <span>
                        {dynasty.total_wins}W - {dynasty.total_losses}L
                    </span>
                    <span className="inline-flex items-center gap-1"><Trophy className="h-3 w-3" />{dynasty.championships}</span>
                    <span>Seasons: {dynasty.seasons_played}</span>
                </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-primary/10 px-5 py-3">
                {isConfirmingDelete ? (
                    <div className="flex w-full items-center justify-between gap-2">
                        <span className="text-xs font-medium text-red-500">Delete this dynasty?</span>
                        <div className="flex gap-2">
                            <Button size="sm" variant="delete" className="text-xs font-semibold" disabled={isDeleting} onClick={handleDelete}>
                                {isDeleting ? 'Deleting...' : 'Confirm'}
                            </Button>
                            <Button
                                size="sm"
                                bg="var(--secondary)"
                                text="white"
                                className="text-xs"
                                onClick={() => setIsConfirmingDelete(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* New View Button */}
                        <Link href={`/dashboard/dynasty/${dynasty.id}`}>
                            <Button size="sm" variant="default" className="text-xs">
                                View Dynasty
                            </Button>
                        </Link>
                        
                        {/* Existing Delete Button */}
                        <Button variant="delete" size="sm" onClick={() => setIsConfirmingDelete(true)} className="text-xs">
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}