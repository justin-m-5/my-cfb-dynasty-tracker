'use client'

import { Star } from 'lucide-react'

import type { CareerSeason, Player, PlayerOrigin } from '@/dal/features/players'

import { getContrastTextColor } from './stat-config'
import type { SchoolColors } from './types'

interface PlayerInfoTabProps {
    player: Player
    currentSeason: CareerSeason | null
    career: CareerSeason[]
    origin: PlayerOrigin | null
    schoolColors: SchoolColors
}

function InfoField({ label, value, compact = false }: { label: string; value?: string | null; compact?: boolean }) {
    return (
        <div className={compact ? 'space-y-1 rounded-xl border border-primary/10 bg-primary/5 px-3 py-2' : 'space-y-1'}>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-text/50">{label}</div>
            <div className="text-sm font-medium text-text">{value || '—'}</div>
        </div>
    )
}

export function PlayerInfoTab({ player, currentSeason, career, origin, schoolColors }: PlayerInfoTabProps) {
    const secondaryTextColor = getContrastTextColor(schoolColors.secondary, 'var(--color-text)')

    return (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="space-y-4">
                <div className="rounded-2xl border border-primary/15 bg-background/70">
                    <div className="border-b border-primary/10 px-4 py-3">
                        <h3 className="text-sm font-semibold text-text">Player Details</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 px-4 py-4 text-sm sm:grid-cols-3">
                        <InfoField label="Position" value={player.position} />
                        <InfoField label="Class" value={currentSeason?.year} />
                        <InfoField label="Jersey #" value={currentSeason?.jersey_number?.toString()} />
                        <InfoField label="Rating" value={currentSeason?.rating != null ? `${currentSeason.rating}` : null} />
                        <InfoField label="Dev Trait" value={currentSeason?.dev_trait} />
                        <InfoField label="Height" value={player.height} />
                        <InfoField label="Weight" value={player.weight != null ? `${player.weight} lbs` : null} />
                        <InfoField label="Redshirt" value={currentSeason ? (currentSeason.is_redshirted ? 'Yes' : 'No') : null} />
                        <InfoField label="Career Seasons" value={career.length ? `${career.length}` : null} />
                    </div>
                </div>

                <div className="rounded-2xl border border-primary/15 bg-background/70">
                    <div className="border-b border-primary/10 px-4 py-3">
                        <h3 className="text-sm font-semibold text-text">Notes</h3>
                    </div>
                    <div className="px-4 py-4 text-sm text-text/80">
                        {currentSeason?.notes?.trim() ? currentSeason.notes : 'No notes recorded for the current season.'}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="rounded-2xl border border-primary/15 bg-background/70">
                    <div className="border-b border-primary/10 px-4 py-3">
                        <h3 className="text-sm font-semibold text-text">Origin</h3>
                    </div>
                    {!origin ? (
                        <div className="px-4 py-6 text-sm text-text/60">No recruiting or transfer origin found.</div>
                    ) : origin.type === 'recruit' ? (
                        <div className="space-y-4 px-4 py-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: schoolColors.secondary, color: secondaryTextColor }}>
                                    <Star className="h-3.5 w-3.5" />
                                    {origin.data.stars ?? '—'} Star Recruit
                                </span>
                                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">Recruit</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                <InfoField label="State" value={origin.data.state} compact />
                                <InfoField label="Nat Rank" value={origin.data.national_rank?.toString()} compact />
                                <InfoField label="State Rank" value={origin.data.state_rank?.toString()} compact />
                                <InfoField label="Pos Rank" value={origin.data.position_rank?.toString()} compact />
                                <InfoField label="Height" value={origin.data.height} compact />
                                <InfoField label="Weight" value={origin.data.weight != null ? `${origin.data.weight} lbs` : null} compact />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 px-4 py-4 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">Transfer</span>
                                {origin.data.stars != null && (
                                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: schoolColors.secondary, color: secondaryTextColor }}>
                                        <Star className="h-3.5 w-3.5" />
                                        {origin.data.stars} Star
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                <InfoField label="School" value={origin.data.school} compact />
                                <InfoField
                                    label="Direction"
                                    value={origin.data.transfer_direction === 'From' ? 'Arrived From' : 'Transferred To'}
                                    compact
                                />
                                <InfoField label="Position" value={origin.data.position} compact />
                                <InfoField label="Height" value={origin.data.height} compact />
                                <InfoField label="Weight" value={origin.data.weight != null ? `${origin.data.weight} lbs` : null} compact />
                                <InfoField label="Dev Trait" value={origin.data.dev_trait} compact />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
