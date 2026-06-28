// components/dashboard/dynasty-list.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'

import { Button, buttonStyles } from '@/components/ui/button'
import { LogoImage } from '@/components/ui/logo-image'
import { conferenceLogoByName, getSchoolLogoCandidates } from '@/lib/logos'
import type { DynastySummary } from '@/dal/features/dynasty'

interface DynastyListProps {
    dynasties: DynastySummary[]
    onDelete: (id: string) => Promise<void>
}

export function DynastyList({ dynasties, onDelete }: DynastyListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmId, setConfirmId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        setDeletingId(id)
        try {
            await onDelete(id)
        } finally {
            setDeletingId(null)
            setConfirmId(null)
        }
    }

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
                    const isConfirming = confirmId === dynasty.id
                    const isDeleting = deletingId === dynasty.id

                    return (
                        <div
                            key={dynasty.id}
                            className="group relative rounded-xl border border-primary/20 bg-background/70 transition-all hover:border-primary/40 hover:shadow-md"
                        >
                            <Link
                                href={`/dashboard/dynasty/${dynasty.id}`}
                                className="block p-5"
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

                            {/* Delete area */}
                            <div className="flex justify-end border-t border-primary/10 px-5 py-3">
                                {isConfirming ? (
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs text-red-500 font-medium">Delete this dynasty?</span>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="delete"
                                                className="text-xs font-semibold"
                                                disabled={isDeleting}
                                                onClick={() => handleDelete(dynasty.id)}
                                            >
                                                {isDeleting ? 'Deleting...' : 'Confirm'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                bg="var(--secondary)"
                                                text="white"
                                                className="text-xs"
                                                onClick={() => setConfirmId(null)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        variant="delete"
                                        size="sm"
                                        onClick={() => setConfirmId(dynasty.id)}
                                        className="ml-auto text-xs"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
