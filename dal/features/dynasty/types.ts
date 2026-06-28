// dal/features/dynasty/types.ts

export interface CreateDynastyInput {
    name: string
    currentYear: number
    coachName: string
    schoolName: string
    schoolNickName?: string | null
    schoolAbbrev?: string | null
    conference?: string | null
    almaMater?: string | null
    pipeline?: string | null
    primaryColor: string
    secondaryColor: string
    accentColor?: string | null
}

export interface SwitchTeamsInput {
    schoolName: string
    schoolNickName?: string
    schoolAbbrev?: string
    conference?: string
    primaryColor: string
    secondaryColor: string
    accentColor?: string
}

export interface DynastySummary {
    id: string
    name: string
    current_year: number
    coach_name: string
    school_name: string
    school_nickname: string | null
    school_abbrev: string | null
    conference: string | null
    primary_color: string | null
    secondary_color: string | null
    seasons_played: number
    total_wins: number
    total_losses: number
    championships: number
    last_played: string | null
}