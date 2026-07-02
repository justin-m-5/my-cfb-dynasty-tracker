import type { recruitPositionGroups } from '@/lib/config/player-config'

export type WizardStep = 0 | 1 | 2
export type RosterPositionGroup = keyof typeof recruitPositionGroups

export type RosterEntry = {
    id: string
    name: string
    position: string
    rating: string
    year: string
    jerseyNumber: string
    devTrait: string
    height: string
    weight: string
    isRedshirted: boolean
}

export type PreparedRosterEntry = {
    id: string
    name: string
    position: string
    rating: number | null
    year: string | null
    jerseyNumber: number | null
    devTrait: string | null
    height: string | null
    weight: number | null
    isRedshirted: boolean
}

export type PlayerDraft = Omit<RosterEntry, 'id'>
