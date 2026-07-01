// lib/stat-categories.ts

export type StatCategory = 'Passing' | 'Rushing' | 'Receiving' | 'Defense' | 'Kicking' | 'Punting' | 'Returns'

export const statCategories: StatCategory[] = ['Passing', 'Rushing', 'Receiving', 'Defense', 'Kicking', 'Punting', 'Returns']

export interface StatColumn {
    label: string
    key: string
    computed?: boolean
}

export const categoryColumns: Record<StatCategory, StatColumn[]> = {
    Passing: [
        { label: 'CMP', key: 'completions' },
        { label: 'ATT', key: 'attempts' },
        { label: 'YDS', key: 'pass_yards' },
        { label: 'TD', key: 'pass_td' },
        { label: 'INT', key: 'pass_int' },
        { label: 'CMP%', key: 'comp_pct', computed: true },
        { label: 'YPA', key: 'ypa', computed: true },
        { label: 'LNG', key: 'long' },
        { label: 'RTG', key: 'rtg', computed: true },
    ],
    Rushing: [
        { label: 'CAR', key: 'carries' },
        { label: 'YDS', key: 'rush_yards' },
        { label: 'AVG', key: 'rush_avg', computed: true },
        { label: 'TD', key: 'rush_td' },
        { label: 'FUM', key: 'fumbles' },
        { label: 'YAC', key: 'yac' },
        { label: 'LNG', key: 'long' },
    ],
    Receiving: [
        { label: 'REC', key: 'receptions' },
        { label: 'YDS', key: 'rec_yards' },
        { label: 'AVG', key: 'rec_avg', computed: true },
        { label: 'TD', key: 'rec_td' },
        { label: 'RAC', key: 'rac' },
        { label: 'LNG', key: 'long' },
    ],
    Defense: [
        { label: 'SOLO', key: 'solo' },
        { label: 'AST', key: 'assists' },
        { label: 'TOT', key: 'tackles', computed: true },
        { label: 'TFL', key: 'tfl' },
        { label: 'SACK', key: 'sacks' },
        { label: 'INT', key: 'def_int' },
        { label: 'FF', key: 'forced_fumbles' },
        { label: 'TD', key: 'def_td' },
    ],
    Kicking: [
        { label: 'FGM', key: 'fg_made' },
        { label: 'FGA', key: 'fg_attempted' },
        { label: 'FG%', key: 'fg_pct', computed: true },
        { label: 'LNG', key: 'long' },
        { label: 'XPM', key: 'xp_made' },
        { label: 'XPA', key: 'xp_attempted' },
        { label: 'XP%', key: 'xp_pct', computed: true },
    ],
    Punting: [
        { label: 'PNT', key: 'punts' },
        { label: 'YDS', key: 'punt_yards' },
        { label: 'AVG', key: 'punt_avg', computed: true },
        { label: 'LNG', key: 'long' },
        { label: 'TB', key: 'touchbacks' },
    ],
    Returns: [
        { label: 'KR YDS', key: 'kr_yards' },
        { label: 'KR TD', key: 'kr_td' },
        { label: 'KR LNG', key: 'kr_long' },
        { label: 'PR YDS', key: 'pr_yards' },
        { label: 'PR TD', key: 'pr_td' },
        { label: 'PR LNG', key: 'pr_long' },
    ],
}

// Compute derived stats
export function computeStat(key: string, row: Record<string, string | number>): string | number {
    const n = (k: string) => (Number(row[k]) || 0)
    switch (key) {
        case 'comp_pct':
            return n('attempts') ? `${((n('completions') / n('attempts')) * 100).toFixed(1)}%` : '0.0%'
        case 'ypa':
            return n('attempts') ? (n('pass_yards') / n('attempts')).toFixed(1) : '0.0'
        case 'rtg': {
            const a = n('attempts')
            if (a === 0) return '0.0'
            return (((8.4 * n('pass_yards')) + (330 * n('pass_td')) + (100 * n('completions')) - (200 * n('pass_int'))) / a).toFixed(1)
        }
        case 'rush_avg':
            return n('carries') ? (n('rush_yards') / n('carries')).toFixed(1) : '0.0'
        case 'rec_avg':
            return n('receptions') ? (n('rec_yards') / n('receptions')).toFixed(1) : '0.0'
        case 'tackles':
            return n('solo') + n('assists')
        case 'fg_pct':
            return n('fg_attempted') ? `${((n('fg_made') / n('fg_attempted')) * 100).toFixed(0)}%` : '0%'
        case 'xp_pct':
            return n('xp_attempted') ? `${((n('xp_made') / n('xp_attempted')) * 100).toFixed(0)}%` : '0%'
        case 'punt_avg':
            return n('punts') ? (n('punt_yards') / n('punts')).toFixed(1) : '0.0'
        default:
            return row[key] ?? 0
    }
}
