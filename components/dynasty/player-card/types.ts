export type PlayerCardTab = 'Career Stats' | 'Game Logs' | 'Awards' | 'Player Info'

export type StatKey =
    | 'attempts'
    | 'completions'
    | 'pass_yards'
    | 'pass_td'
    | 'pass_int'
    | 'long'
    | 'carries'
    | 'rush_yards'
    | 'rush_td'
    | 'fumbles'
    | 'yac'
    | 'receptions'
    | 'rec_yards'
    | 'rec_td'
    | 'rac'
    | 'solo'
    | 'assists'
    | 'tackles'
    | 'tfl'
    | 'sacks'
    | 'def_int'
    | 'forced_fumbles'
    | 'def_td'
    | 'fg_made'
    | 'fg_attempted'
    | 'xp_made'
    | 'xp_attempted'
    | 'punts'
    | 'punt_yards'
    | 'touchbacks'
    | 'kr_yards'
    | 'kr_td'
    | 'pr_yards'
    | 'pr_td'
    | 'kr_long'
    | 'pr_long'

export type StatTotals = Record<StatKey, number>

export interface YearlyStats extends StatTotals {
    year: number
}

export interface StatColumn {
    label: string
    render: (row: StatTotals) => number | string
}

export interface StatCategoryConfig {
    key: string
    label: string
    show: (row: StatTotals) => boolean
    columns: StatColumn[]
}

export interface SchoolColors {
    primary: string
    secondary: string
}

export interface PlayerCardProps {
    playerId: string
    dynastyId: string
    isOpen: boolean
    onClose: () => void
    schoolColors: SchoolColors
    schoolName?: string
}
