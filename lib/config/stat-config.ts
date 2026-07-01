// lib/stat-config.ts

export type StatCategory = 'Passing' | 'Rushing' | 'Receiving' | 'Defense' | 'Kicking' | 'Punting' | 'Returns'

// Fields the user fills in per category (maps to player_stats columns)
export const statCategories: Record<StatCategory, { label: string; field: string }[]> = {
    Passing: [
        { label: 'Completions', field: 'completions' },
        { label: 'Attempts', field: 'attempts' },
        { label: 'Pass Yards', field: 'pass_yards' },
        { label: 'Pass TD', field: 'pass_td' },
        { label: 'INT', field: 'pass_int' },
        { label: 'Long', field: 'long' },
    ],
    Rushing: [
        { label: 'Carries', field: 'carries' },
        { label: 'Rush Yards', field: 'rush_yards' },
        { label: 'Rush TD', field: 'rush_td' },
        { label: 'Fumbles', field: 'fumbles' },
        { label: 'Long', field: 'long' },
    ],
    Receiving: [
        { label: 'Receptions', field: 'receptions' },
        { label: 'Rec Yards', field: 'rec_yards' },
        { label: 'Rec TD', field: 'rec_td' },
        { label: 'YAC', field: 'yac' },
        { label: 'Long', field: 'long' },
    ],
    Defense: [
        { label: 'Solo', field: 'solo' },
        { label: 'Assists', field: 'assists' },
        { label: 'TFL', field: 'tfl' },
        { label: 'Sacks', field: 'sacks' },
        { label: 'INT', field: 'def_int' },
        { label: 'FF', field: 'forced_fumbles' },
        { label: 'Def TD', field: 'def_td' },
    ],
    Kicking: [
        { label: 'FG Made', field: 'fg_made' },
        { label: 'FG Att', field: 'fg_attempted' },
        { label: 'XP Made', field: 'xp_made' },
        { label: 'XP Att', field: 'xp_attempted' },
    ],
    Punting: [
        { label: 'Punts', field: 'punts' },
        { label: 'Punt Yards', field: 'punt_yards' },
        { label: 'Touchbacks', field: 'touchbacks' },
    ],
    Returns: [
        { label: 'KR Yards', field: 'kr_yards' },
        { label: 'KR TD', field: 'kr_td' },
        { label: 'KR Long', field: 'kr_long' },
        { label: 'PR Yards', field: 'pr_yards' },
        { label: 'PR TD', field: 'pr_td' },
        { label: 'PR Long', field: 'pr_long' },
    ],
}

// Display columns for the table view (includes computed columns)
export const displayColumns: Record<StatCategory, { label: string; field: string; computed?: boolean }[]> = {
    Passing: [
        { label: 'Comp', field: 'completions' },
        { label: 'Att', field: 'attempts' },
        { label: 'Comp %', field: 'comp_pct', computed: true },
        { label: 'Yards', field: 'pass_yards' },
        { label: 'TD', field: 'pass_td' },
        { label: 'INT', field: 'pass_int' },
        { label: 'Long', field: 'long' },
    ],
    Rushing: [
        { label: 'Carries', field: 'carries' },
        { label: 'Yards', field: 'rush_yards' },
        { label: 'AVG', field: 'rush_avg', computed: true },
        { label: 'TD', field: 'rush_td' },
        { label: 'Fum', field: 'fumbles' },
        { label: 'Long', field: 'long' },
    ],
    Receiving: [
        { label: 'Rec', field: 'receptions' },
        { label: 'Yards', field: 'rec_yards' },
        { label: 'AVG', field: 'rec_avg', computed: true },
        { label: 'TD', field: 'rec_td' },
        { label: 'YAC', field: 'yac' },
        { label: 'Long', field: 'long' },
    ],
    Defense: [
        { label: 'Solo', field: 'solo' },
        { label: 'Ast', field: 'assists' },
        { label: 'TFL', field: 'tfl' },
        { label: 'Sacks', field: 'sacks' },
        { label: 'INT', field: 'def_int' },
        { label: 'FF', field: 'forced_fumbles' },
        { label: 'TD', field: 'def_td' },
    ],
    Kicking: [
        { label: 'FGM', field: 'fg_made' },
        { label: 'FGA', field: 'fg_attempted' },
        { label: 'FG %', field: 'fg_pct', computed: true },
        { label: 'XPM', field: 'xp_made' },
        { label: 'XPA', field: 'xp_attempted' },
        { label: 'XP %', field: 'xp_pct', computed: true },
    ],
    Punting: [
        { label: 'Punts', field: 'punts' },
        { label: 'Yards', field: 'punt_yards' },
        { label: 'AVG', field: 'punt_avg', computed: true },
        { label: 'TB', field: 'touchbacks' },
    ],
    Returns: [
        { label: 'KR Yds', field: 'kr_yards' },
        { label: 'KR TD', field: 'kr_td' },
        { label: 'KR Long', field: 'kr_long' },
        { label: 'PR Yds', field: 'pr_yards' },
        { label: 'PR TD', field: 'pr_td' },
        { label: 'PR Long', field: 'pr_long' },
    ],
}

// Compute derived values
export function computeStatValue(stat: Record<string, unknown>, field: string): string {
    const num = (key: string) => Number(stat[key] || 0)

    switch (field) {
        case 'comp_pct': {
            const att = num('attempts')
            return att > 0 ? ((num('completions') / att) * 100).toFixed(1) : '—'
        }
        case 'rush_avg': {
            const car = num('carries')
            return car > 0 ? (num('rush_yards') / car).toFixed(1) : '—'
        }
        case 'rec_avg': {
            const rec = num('receptions')
            return rec > 0 ? (num('rec_yards') / rec).toFixed(1) : '—'
        }
        case 'fg_pct': {
            const att = num('fg_attempted')
            return att > 0 ? ((num('fg_made') / att) * 100).toFixed(1) : '—'
        }
        case 'xp_pct': {
            const att = num('xp_attempted')
            return att > 0 ? ((num('xp_made') / att) * 100).toFixed(1) : '—'
        }
        case 'punt_avg': {
            const p = num('punts')
            return p > 0 ? (num('punt_yards') / p).toFixed(1) : '—'
        }
        default: {
            const val = stat[field]
            return val === 0 ? '0' : val ? String(val) : '—'
        }
    }
}
