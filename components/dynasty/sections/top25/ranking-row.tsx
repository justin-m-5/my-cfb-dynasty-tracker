// components/dynasty/sections/top25/ranking-row.tsx

import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, GripVertical, Minus } from 'lucide-react'

import type { RankedTeam } from '@/dal/features/top25'
import type { FbsTeam } from '@/lib/teams/fbs-teams'
import { fbsTeams } from '@/lib/teams/fbs-teams'
import { getTeamLogo } from '@/lib/teams/logos'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/display/button'
import { LogoImage } from '@/components/ui/display/logo-image'
import { TeamSearch } from '@/components/ui/display/team-search'

interface RankingRowProps {
    index: number
    rank: number
    team: RankedTeam
    previousRankings: RankedTeam[]
    unrankedTeams: FbsTeam[]
    columnStart: number
    columnEnd: number
    isDragging: boolean
    isDropTarget: boolean
    onTeamChange: (index: number, name: string) => void
    onReorder: (fromIndex: number, toIndex: number) => void
    onDragStart: (index: number) => void
    onDragOver: (index: number) => void
    onDragEnd: () => void
    onDrop: (index: number) => void
}

export function RankingRow({
    index,
    rank,
    team,
    previousRankings,
    unrankedTeams,
    columnStart,
    columnEnd,
    isDragging,
    isDropTarget,
    onTeamChange,
    onReorder,
    onDragStart,
    onDragOver,
    onDragEnd,
    onDrop,
}: RankingRowProps) {
    const currentTeam = fbsTeams.find(candidate => candidate.name === team.name)
    const availableTeams = currentTeam ? [currentTeam, ...unrankedTeams] : unrankedTeams
    const logo = team.name ? getTeamLogo(team.name) : ''
    const canMoveUp = index > columnStart
    const canMoveDown = index < columnEnd - 1

    const renderChange = () => {
        if (!team.name || previousRankings.length === 0) {
            return <Minus className="h-3.5 w-3.5 text-text/30" />
        }

        const previousIndex = previousRankings.findIndex(previousTeam => previousTeam.name === team.name)
        if (previousIndex === -1) {
            return <span className="text-[10px] font-bold text-green-600">NEW</span>
        }

        const diff = previousIndex - (rank - 1)
        if (diff > 0) {
            return (
                <span className="flex items-center text-xs font-semibold text-green-600">
                    <ArrowUp className="h-3 w-3" />
                    {diff}
                </span>
            )
        }

        if (diff < 0) {
            return (
                <span className="flex items-center text-xs font-semibold text-red-500">
                    <ArrowDown className="h-3 w-3" />
                    {Math.abs(diff)}
                </span>
            )
        }

        return <Minus className="h-3.5 w-3.5 text-text/30" />
    }

    return (
        <div
            className={cn(
                'relative flex items-start gap-2 rounded-lg border-b border-primary/10 px-2 py-2 transition-colors last:border-b-0 sm:items-center',
                'hover:bg-primary/5',
                isDragging && 'opacity-60',
                isDropTarget && 'bg-primary/10 ring-1 ring-primary/20'
            )}
            onDragOver={(event) => {
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
                onDragOver(index)
            }}
            onDrop={(event) => {
                event.preventDefault()
                onDrop(index)
            }}
        >
            <button
                type="button"
                draggable
                aria-label={`Drag rank ${rank}`}
                className="flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-md border border-primary/15 bg-background/80 text-text/50 transition-colors hover:text-text active:cursor-grabbing"
                onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = 'move'
                    event.dataTransfer.setData('text/plain', String(index))
                    onDragStart(index)
                }}
                onDragEnd={onDragEnd}
            >
                <GripVertical className="h-4 w-4" />
            </button>

            <span className="w-6 shrink-0 pt-2 text-right text-sm font-bold text-text/80 sm:pt-0">{rank}</span>

            <div className="flex w-7 shrink-0 justify-center pt-1 sm:pt-0">
                {logo ? <LogoImage candidates={[logo]} alt={team.name} size={24} /> : null}
            </div>

            <div className="min-w-0 flex-1">
                <TeamSearch
                    value={team.name}
                    teams={availableTeams}
                    onChange={(name) => onTeamChange(index, name)}
                />
            </div>

            <div className="flex shrink-0 flex-col items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center">
                    {renderChange()}
                </div>
                <div className="flex gap-1 sm:hidden">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => canMoveUp && onReorder(index, index - 1)}
                        disabled={!canMoveUp}
                        className="h-8 w-8 border-primary/15 bg-background/80 text-text"
                        aria-label={`Move rank ${rank} up`}
                    >
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => canMoveDown && onReorder(index, index + 1)}
                        disabled={!canMoveDown}
                        className="h-8 w-8 border-primary/15 bg-background/80 text-text"
                        aria-label={`Move rank ${rank} down`}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
