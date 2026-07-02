// components/forms/create-dynasty-form/types.ts

import type { positionGroups } from '@/lib/config/player-config'

export type WizardStep = 0 | 1 | 2
export type RosterPositionGroup = keyof typeof positionGroups

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
    imageFile: File | null
    imagePreview: string | null
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
