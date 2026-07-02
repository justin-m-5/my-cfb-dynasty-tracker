import Image from 'next/image'
import { useMemo } from 'react'

import { Button } from '@/components/ui/display/button'
import { Input } from '@/components/ui/form/input'
import { Label } from '@/components/ui/form/label'
import { Select } from '@/components/ui/form/select'
import { FilterTabs } from '@/components/ui/layout/filter-tabs'
import { positionGroups } from '@/lib/config/player-config'
import type { FbsTeam } from '@/lib/teams/fbs-teams'
import type { RosterEntry, RosterPositionGroup } from './types'
import {
    ROSTER_DEV_TRAITS,
    ROSTER_GROUP_KEYS,
    clampNumberString,
    getTraitClasses,
    parseOptionalNumber,
} from './utils'

interface RosterStepProps {
    rosterEntries: RosterEntry[]
    selectedTeam: FbsTeam | null
    isImporting: boolean
    namedRosterCount: number
    selectedGroup: RosterPositionGroup
    setSelectedGroup: (group: RosterPositionGroup) => void
    selectedPosition: string
    setSelectedPosition: (position: string) => void
    onImport: () => void
    onAddPlayer: () => void
    onEditPlayer: (entry: RosterEntry) => void
    onRemovePlayer: (id: string) => void
    onUpdateEntry: (id: string, field: keyof Omit<RosterEntry, 'id'>, value: string) => void
    onSetPlayerImage: (id: string, file: File) => void
}

export function RosterStep({
    rosterEntries,
    selectedTeam,
    isImporting,
    namedRosterCount,
    selectedGroup,
    setSelectedGroup,
    selectedPosition,
    setSelectedPosition,
    onImport,
    onAddPlayer,
    onEditPlayer,
    onRemovePlayer,
    onUpdateEntry,
    onSetPlayerImage,
}: RosterStepProps) {
    const rosterGroupTabs = useMemo(() => ROSTER_GROUP_KEYS.map((group) => ({ key: group, label: group })), [])

    const positionOptions = useMemo(() => (positionGroups[selectedGroup] ?? []).map((position) => ({
        position,
        count: rosterEntries.filter((entry) => entry.position === position && entry.name.trim()).length,
    })), [rosterEntries, selectedGroup])

    const selectedPositionEntries = useMemo(() => (rosterEntries.filter((entry) => entry.position === selectedPosition).sort((a, b) => {
        const ratingDiff = (parseOptionalNumber(b.rating) ?? -1) - (parseOptionalNumber(a.rating) ?? -1)
        if (ratingDiff !== 0) return ratingDiff
        
        return a.name.localeCompare(b.name)
    })), [rosterEntries, selectedPosition])

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-text">Step 2 · Initial Roster Builder</h2>
                    <p className="text-sm text-text/70">Build your roster by position group, then fine-tune each player from the card view.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {selectedTeam && (
                        <Button
                            type="button"
                            bg="var(--primary)"
                            text="white"
                            size="sm"
                            className="font-semibold"
                            onClick={onImport}
                            disabled={isImporting}
                        >
                            {isImporting ? 'Importing...' : `Import ${selectedTeam.name} Roster`}
                        </Button>
                    )}
                    <Button type="button" variant="outline" size="sm" className="font-semibold" onClick={onAddPlayer}>
                        Add Player
                    </Button>
                    <div className="rounded-md border border-primary/15 bg-background/70 px-3 py-2 text-sm font-medium text-text">
                        {namedRosterCount} player{namedRosterCount === 1 ? '' : 's'}
                    </div>
                </div>
            </div>

            <FilterTabs
                tabs={rosterGroupTabs}
                active={selectedGroup}
                onChange={(group) => {
                    setSelectedGroup(group)
                    setSelectedPosition(positionGroups[group][0] ?? '')
                }}
            />

            <Select
                value={selectedPosition}
                onChange={(event) => setSelectedPosition(event.target.value)}
                className="h-9 text-sm"
                aria-label="Select roster position"
            >
                {positionOptions.map((option) => (
                    <option key={option.position} value={option.position}>
                        {option.position} ({option.count} {option.count === 1 ? 'player' : 'players'})
                    </option>
                ))}
            </Select>

            <div className="grid gap-3 py-3 md:grid-cols-2 xl:grid-cols-3">
                {selectedPositionEntries.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-primary/20 bg-background/40 px-4 py-10 text-center text-sm text-text/60 md:col-span-2 xl:col-span-3">
                        No {selectedPosition || 'selected'} players yet. Add one manually or import your school roster.
                    </div>
                ) : (
                    selectedPositionEntries.map((entry) => {
                        const details = [entry.position, entry.year || '—', entry.jerseyNumber ? `#${entry.jerseyNumber}` : null ].filter(Boolean).join(' • ')

                        const initials = entry.name
                            .split(' ')
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()

                        return (
                            <div key={entry.id} className="rounded-xl border border-primary/10 bg-background/70 p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <label
                                            htmlFor={`avatar-${entry.id}`}
                                            className="group relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
                                        >
                                            {entry.imagePreview ? (
                                                <Image
                                                    src={entry.imagePreview}
                                                    alt={entry.name}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                initials || '?'
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[9px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                                                {entry.imagePreview ? '✎' : '+'}
                                            </div>
                                        </label>
                                        <input
                                            id={`avatar-${entry.id}`}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) onSetPlayerImage(entry.id, file)
                                            }}
                                        />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-text">{entry.name}</p>
                                            <p className="text-[10px] text-text/55">{details}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-bold text-text">{entry.rating || '—'}</p>
                                            <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${getTraitClasses(entry.devTrait)}`}>
                                                {entry.devTrait || 'Normal'}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 px-0 text-text/60"
                                            onClick={() => onRemovePlayer(entry.id)}
                                            aria-label={`Remove ${entry.name}`}
                                        >
                                            x
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <Label htmlFor={`player-ovr-${entry.id}`} className="text-xs">OVR</Label>
                                        <Input
                                            id={`player-ovr-${entry.id}`}
                                            type="number"
                                            min={0}
                                            max={99}
                                            value={entry.rating}
                                            onChange={(event) => onUpdateEntry(entry.id, 'rating', clampNumberString(event.target.value, 0, 99))}
                                            className="h-9 text-sm"
                                            placeholder="0-99"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label htmlFor={`player-dev-${entry.id}`} className="text-xs">Dev Trait</Label>
                                        <Select
                                            id={`player-dev-${entry.id}`}
                                            value={entry.devTrait}
                                            onChange={(event) => onUpdateEntry(entry.id, 'devTrait', event.target.value)}
                                            className="h-9 text-sm"
                                        >
                                            {ROSTER_DEV_TRAITS.map((trait) => (
                                                <option key={trait} value={trait}>{trait}</option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-3">
                                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-text/50">
                                        {entry.height && <span>HT {entry.height}</span>}
                                        {entry.weight && <span>WT {entry.weight}</span>}
                                        {entry.isRedshirted && (
                                            <span className="inline-flex rounded-full bg-primary/5 px-2 py-1 font-semibold text-text/65">
                                                Redshirt
                                            </span>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-xs font-semibold"
                                        onClick={() => onEditPlayer(entry)}
                                    >
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
