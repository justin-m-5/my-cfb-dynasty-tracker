'use client'

import { Star, X } from 'lucide-react'

import type { CareerSeason, Player } from '@/dal/features/players'
import { Button } from '@/components/ui/button'
import { CardHeader as UiCardHeader } from '@/components/ui/card'
import { PlayerAvatar } from '@/components/ui/player-avatar'
import { cn } from '@/lib/utils'

import type { SchoolColors } from './types'

interface PlayerCardHeaderProps {
    player: Player | null
    currentSeason: CareerSeason | null
    schoolColors: SchoolColors
    headerTextColor: string
    traitColor: string
    onClose: () => void
}

export function PlayerCardHeader({ player, currentSeason, schoolColors, headerTextColor, traitColor, onClose }: PlayerCardHeaderProps) {
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
                    <PlayerAvatar src={player?.avatar_url} alt={player?.name ?? 'Player'} size={72} className="border-white/25 bg-white/10" />
                    <div className="min-w-0 space-y-2">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="truncate text-xl font-semibold sm:text-2xl">{player?.name ?? 'Loading player...'}</h2>
                                {currentSeason?.rating != null && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-black/15 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
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
                                <span className={cn('rounded-full px-2.5 py-1 font-semibold', traitColor)}>
                                    {currentSeason.dev_trait}
                                </span>
                            )}
                            {currentSeason?.record_year != null && currentSeason.record_year > 0 && (
                                <span className="rounded-full px-2.5 py-1 font-medium backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                                    Season {currentSeason.record_year}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onClose}
                    className="border-white/25 bg-black/10 text-xs font-semibold hover:bg-black/20"
                    style={{ color: headerTextColor }}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close player card</span>
                </Button>
            </div>
        </UiCardHeader>
    )
}
