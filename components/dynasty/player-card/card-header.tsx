// components/dynasty/player-card/card-header.tsx

'use client'

import { Star, X } from 'lucide-react'

import type { CareerSeason, Player } from '@/dal/features/players'
import { Button } from '@/components/ui/button'
import { CardHeader as UiCardHeader } from '@/components/ui/card'
import { LogoImage } from '@/components/ui/logo-image'
import { PlayerAvatar } from '@/components/ui/player-avatar'
import { getTeamLogo } from '@/lib/logos'
import { cn } from '@/lib/utils'

import type { SchoolColors } from './types'

// Stronger colors for on-gradient visibility
const headerTraitColors: Record<string, string> = {
    Elite: 'bg-purple-600 text-white',
    Star: 'bg-yellow-500 text-yellow-950',
    Impact: 'bg-blue-600 text-white',
    Normal: 'bg-gray-600 text-white',
}

interface PlayerCardHeaderProps {
    player: Player | null
    currentSeason: CareerSeason | null
    schoolColors: SchoolColors
    schoolName?: string
    headerTextColor: string
    traitColor?: string
    onClose: () => void
}

export function PlayerCardHeader({ player, currentSeason, schoolColors, schoolName, headerTextColor, onClose }: PlayerCardHeaderProps) {
    const logo = schoolName ? getTeamLogo(schoolName) : ''

    return (
        <UiCardHeader
            className="gap-4 border-b border-primary/10 pb-4"
            style={{
                background: `linear-gradient(135deg, ${schoolColors.primary} 0%, ${schoolColors.secondary} 100%)`,
                color: headerTextColor,
            }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    {/* Team logo */}
                    {logo && (
                        <LogoImage
                            candidates={[logo]}
                            alt={schoolName ?? 'Team'}
                            size={56}
                            className="shrink-0 border-white/30 bg-white p-1"
                        />
                    )}
                    {/* Player avatar */}
                    <PlayerAvatar src={player?.avatar_url} alt={player?.name ?? 'Player'} size={64} className="border-white/30 bg-white/15" />
                    <div className="min-w-0 space-y-2">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="truncate text-xl font-semibold sm:text-2xl">{player?.name ?? 'Loading player...'}</h2>
                                {currentSeason?.rating != null && (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/25 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                        <Star className="h-3.5 w-3.5" />
                                        {currentSeason.rating} OVR
                                    </span>
                                )}
                            </div>
                            <p className="text-sm opacity-90">
                                {currentSeason?.jersey_number != null ? `#${currentSeason.jersey_number} • ` : ''}
                                {player?.position ?? '—'}
                                {currentSeason?.year ? ` • ${currentSeason.year}` : ''}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                            {currentSeason?.dev_trait && (
                                <span className={cn('rounded-full border border-white/30 px-2.5 py-1 font-semibold shadow-sm', headerTraitColors[currentSeason.dev_trait] ?? headerTraitColors.Normal)}>
                                    {currentSeason.dev_trait}
                                </span>
                            )}
                            {currentSeason?.record_year != null && currentSeason.record_year > 0 && (
                                <span className="rounded-full border border-white/25 bg-black/25 px-2.5 py-1 font-medium text-white backdrop-blur-sm">
                                    Season {currentSeason.record_year}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="rounded-full border border-white/30 bg-black/30 text-white hover:bg-black/50"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close player card</span>
                </Button>
            </div>
        </UiCardHeader>
    )
}
