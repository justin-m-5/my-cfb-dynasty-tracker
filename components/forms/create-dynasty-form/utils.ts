// components/forms/create-dynasty-form/utils.ts

import { devTraitColors, devTraits, positionGroups, positions, recruitPositionGroups, years, type DevTrait } from '@/lib/config/player-config'
import { getSchoolLogoCandidates } from '@/lib/teams/logos'
import type { FbsTeam } from '@/lib/teams/fbs-teams'
import type { PlayerDraft, RosterEntry, RosterPositionGroup } from './types'

export const INITIAL_YEAR = 2026
export const INITIAL_SELECTED_GROUP: RosterPositionGroup = 'Offense'
export const INITIAL_SELECTED_POSITION = positionGroups[INITIAL_SELECTED_GROUP][0] ?? positions[0]
export const WIZARD_STEPS = ['Dynasty Info', 'Roster', 'Review'] as const
export const ROSTER_GROUP_KEYS = Object.keys(positionGroups) as RosterPositionGroup[]
export const ROSTER_YEAR_ORDER = ['FR', 'SO', 'JR', 'SR', 'FR (RS)', 'SO (RS)', 'JR (RS)', 'SR (RS)'] as const
export const ROSTER_DEV_TRAITS = [...devTraits, 'X-Factor'] as const
export const VALID_ROSTER_YEARS = new Set<string>(years)

let rosterEntryCounter = 0

export function getTeamLogoCandidates(team: FbsTeam): string[] {
    return Array.from(
        new Set([
            team.logo,
            ...getSchoolLogoCandidates(team.name, team.nickName),
        ].filter(Boolean))
    )
}

export function createRosterEntryDraft(defaults: Partial<PlayerDraft> = {}): PlayerDraft {
    return {
        name: '',
        position: '',
        rating: '',
        year: '',
        jerseyNumber: '',
        devTrait: 'Normal',
        height: '',
        weight: '',
        isRedshirted: false,
        ...defaults,
    }
}

export function createBlankRosterEntry(defaults: Partial<PlayerDraft> = {}): RosterEntry {
    rosterEntryCounter += 1

    return {
        id: `roster-entry-${rosterEntryCounter}`,
        ...createRosterEntryDraft(defaults),
    }
}

export function clampNumberString(value: string, min: number, max: number) {
    const trimmed = value.trim()
    if (!trimmed) return ''

    const parsed = Number.parseInt(trimmed, 10)
    if (!Number.isFinite(parsed)) return ''

    return String(Math.max(min, Math.min(max, parsed)))
}

export function getRosterGroupForPosition(position: string): RosterPositionGroup {
    return ROSTER_GROUP_KEYS.find((group) => recruitPositionGroups[group].includes(position)) ?? 'Other'
}

export function syncRedshirtYear(year: string, isRedshirted: boolean) {
    if (!year) return ''

    const baseYear = year.replace(' (RS)', '')
    if (!isRedshirted) {
        return baseYear
    }

    const redshirtYear = `${baseYear} (RS)`
    return VALID_ROSTER_YEARS.has(redshirtYear) ? redshirtYear : year
}

export function getTraitClasses(devTrait: string | null) {
    if (!devTrait || devTrait === 'Normal') {
        return 'bg-primary/5 text-text/55'
    }

    return devTraitColors[devTrait as DevTrait] ?? 'bg-primary/10 text-text/70'
}

export function parseOptionalNumber(value: string): number | null {
    if (!value.trim()) {
        return null
    }

    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }

    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String((error as { message: unknown }).message)
    }

    return 'Something went wrong. Please try again.'
}
