// components/ui/team-search.tsx

'use client'

import { useId, useMemo, useState } from 'react'

import type { FbsTeam } from '@/lib/fbs-teams'
import { getTeamLogo } from '@/lib/logos'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { LogoImage } from '@/components/ui/logo-image'

interface TeamSearchProps {
    value: string
    teams: FbsTeam[]
    onChange: (name: string) => void
    inputClassName?: string
}

function matchesTeam(team: FbsTeam, query: string) {
    const normalizedQuery = query.toLowerCase()
    return [team.name, team.abbrev, team.nickName].some(field => field.toLowerCase().includes(normalizedQuery))
}

function startsWithMatch(team: FbsTeam, query: string) {
    const normalizedQuery = query.toLowerCase()
    return [team.name, team.abbrev, team.nickName].some(field => field.toLowerCase().startsWith(normalizedQuery))
}

export function TeamSearch({ value, teams, onChange, inputClassName }: TeamSearchProps) {
    const [inputValue, setInputValue] = useState(value)
    const [isOpen, setIsOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const listboxId = useId()

    const sortedTeams = useMemo(
        () => [...teams].sort((a, b) => a.name.localeCompare(b.name)),
        [teams]
    )

    const query = inputValue.trim().toLowerCase()
    const suggestions = useMemo(() => {
        if (!query) return sortedTeams

        return sortedTeams
            .filter(team => matchesTeam(team, query))
            .sort((a, b) => {
                const aStarts = startsWithMatch(a, query)
                const bStarts = startsWithMatch(b, query)
                if (aStarts !== bStarts) return aStarts ? -1 : 1
                return a.name.localeCompare(b.name)
            })
    }, [query, sortedTeams])

    const selectTeam = (teamName: string) => {
        setInputValue(teamName)
        onChange(teamName)
        setIsOpen(false)
        setActiveIndex(-1)
    }

    return (
        <div className="relative z-10">
            <Input
                value={isOpen ? inputValue : value}
                placeholder="Search teams..."
                role="combobox"
                aria-expanded={isOpen}
                aria-controls={listboxId}
                aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
                onFocus={() => {
                    setInputValue(value)
                    setIsOpen(true)
                    setActiveIndex(value ? sortedTeams.findIndex(team => team.name === value) : -1)
                }}
                onBlur={() => {
                    const trimmedValue = inputValue.trim()
                    if (!trimmedValue) {
                        setInputValue('')
                        if (value) {
                            onChange('')
                        }
                    } else if (trimmedValue !== value) {
                        setInputValue(value)
                    }
                    setIsOpen(false)
                }}
                onChange={(event) => {
                    const nextValue = event.target.value
                    setInputValue(nextValue)
                    setIsOpen(true)
                    setActiveIndex(nextValue.trim() ? 0 : -1)
                }}
                onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') {
                        event.preventDefault()
                        setIsOpen(true)
                        setActiveIndex((current) => {
                            if (suggestions.length === 0) return -1
                            return current < suggestions.length - 1 ? current + 1 : 0
                        })
                    }

                    if (event.key === 'ArrowUp') {
                        event.preventDefault()
                        setIsOpen(true)
                        setActiveIndex((current) => {
                            if (suggestions.length === 0) return -1
                            return current > 0 ? current - 1 : suggestions.length - 1
                        })
                    }

                    if (event.key === 'Enter') {
                        if (!isOpen) return
                        event.preventDefault()

                        if (activeIndex >= 0 && suggestions[activeIndex]) {
                            selectTeam(suggestions[activeIndex].name)
                            return
                        }

                        if (suggestions.length === 1) {
                            selectTeam(suggestions[0].name)
                        }
                    }

                    if (event.key === 'Escape') {
                        setInputValue(value)
                        setIsOpen(false)
                    }
                }}
                className={cn("h-10 pr-3 text-base sm:text-sm", inputClassName)}
            />

            {isOpen && (
                <div
                    id={listboxId}
                    role="listbox"
                    className="absolute inset-x-0 top-[calc(100%+0.35rem)] z-30 max-h-72 overflow-y-auto rounded-xl border border-primary/20 bg-background shadow-lg"
                >
                    {suggestions.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-text/60">No teams found.</div>
                    ) : (
                        suggestions.map((team, index) => {
                            const logo = getTeamLogo(team.name)

                            return (
                                <button
                                    key={team.name}
                                    id={`${listboxId}-option-${index}`}
                                    type="button"
                                    role="option"
                                    aria-selected={index === activeIndex}
                                    className={cn(
                                        'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-primary/5',
                                        index === activeIndex && 'bg-primary/10'
                                    )}
                                    onPointerDown={(event) => {
                                        event.preventDefault()
                                        selectTeam(team.name)
                                    }}
                                >
                                    <div className="shrink-0">
                                        <LogoImage candidates={logo ? [logo] : []} alt={team.name} size={28} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-sm font-medium text-text">{team.name}</div>
                                        <div className="truncate text-xs text-text/60">{team.abbrev} • {team.nickName}</div>
                                    </div>
                                    <div className="shrink-0 text-xs font-medium text-text/60">{team.conference}</div>
                                </button>
                            )
                        })
                    )}
                </div>
            )}
        </div>
    )
}
