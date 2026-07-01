import type { CareerPlayerStat } from '@/dal/features/player-stats'

import type { StatCategoryConfig, StatKey, StatTotals, YearlyStats } from './types'

export const statKeys: readonly StatKey[] = [
    'attempts', 'completions', 'pass_yards', 'pass_td', 'pass_int', 'long',
    'carries', 'rush_yards', 'rush_td', 'fumbles', 'yac',
    'receptions', 'rec_yards', 'rec_td', 'rac',
    'solo', 'assists', 'tackles', 'tfl', 'sacks', 'def_int', 'forced_fumbles', 'def_td',
    'fg_made', 'fg_attempted', 'xp_made', 'xp_attempted',
    'punts', 'punt_yards', 'touchbacks',
    'kr_yards', 'kr_td', 'pr_yards', 'pr_td', 'kr_long', 'pr_long',
]

export const longFields = new Set<StatKey>(['long', 'kr_long', 'pr_long'])

export const statCategoryConfigs: StatCategoryConfig[] = [
    {
        key: 'passing',
        label: 'Passing',
        show: row => row.attempts > 0,
        columns: [
            { label: 'CMP', render: row => row.completions },
            { label: 'ATT', render: row => row.attempts },
            { label: 'YDS', render: row => row.pass_yards },
            { label: 'AVG', render: row => formatAverage(row.pass_yards, row.attempts) },
            { label: 'TD', render: row => row.pass_td },
            { label: 'INT', render: row => row.pass_int },
            { label: 'LNG', render: row => row.long },
            { label: 'QBR', render: row => formatQbr(row) },
        ],
    },
    {
        key: 'rushing',
        label: 'Rushing',
        show: row => row.carries > 0,
        columns: [
            { label: 'CAR', render: row => row.carries },
            { label: 'YDS', render: row => row.rush_yards },
            { label: 'AVG', render: row => formatAverage(row.rush_yards, row.carries) },
            { label: 'TD', render: row => row.rush_td },
            { label: 'LNG', render: row => row.long },
            { label: 'FUM', render: row => row.fumbles },
        ],
    },
    {
        key: 'receiving',
        label: 'Receiving',
        show: row => row.receptions > 0,
        columns: [
            { label: 'REC', render: row => row.receptions },
            { label: 'YDS', render: row => row.rec_yards },
            { label: 'AVG', render: row => formatAverage(row.rec_yards, row.receptions) },
            { label: 'TD', render: row => row.rec_td },
            { label: 'LNG', render: row => row.long },
        ],
    },
    {
        key: 'defense',
        label: 'Defense',
        show: row => row.solo + row.assists > 0,
        columns: [
            { label: 'TCKL', render: row => row.solo + row.assists },
            { label: 'SOLO', render: row => row.solo },
            { label: 'AST', render: row => row.assists },
            { label: 'SACK', render: row => row.sacks },
            { label: 'TFL', render: row => row.tfl },
            { label: 'INT', render: row => row.def_int },
            { label: 'FF', render: row => row.forced_fumbles },
            { label: 'TD', render: row => row.def_td },
        ],
    },
    {
        key: 'kicking',
        label: 'Kicking',
        show: row => row.fg_attempted > 0,
        columns: [
            { label: 'FGM', render: row => row.fg_made },
            { label: 'FGA', render: row => row.fg_attempted },
            { label: 'FG%', render: row => formatPercent(row.fg_made, row.fg_attempted) },
            { label: 'LNG', render: row => row.long },
            { label: 'XPM', render: row => row.xp_made },
            { label: 'XPA', render: row => row.xp_attempted },
        ],
    },
    {
        key: 'punting',
        label: 'Punting',
        show: row => row.punts > 0,
        columns: [
            { label: 'PUNTS', render: row => row.punts },
            { label: 'YDS', render: row => row.punt_yards },
            { label: 'AVG', render: row => formatAverage(row.punt_yards, row.punts) },
            { label: 'LNG', render: row => row.long },
            { label: 'TB', render: row => row.touchbacks },
        ],
    },
    {
        key: 'kick-return',
        label: 'Kick Return',
        show: row => row.kr_yards > 0,
        columns: [
            { label: 'YDS', render: row => row.kr_yards },
            { label: 'TD', render: row => row.kr_td },
            { label: 'LNG', render: row => row.kr_long },
        ],
    },
    {
        key: 'punt-return',
        label: 'Punt Return',
        show: row => row.pr_yards > 0,
        columns: [
            { label: 'YDS', render: row => row.pr_yards },
            { label: 'TD', render: row => row.pr_td },
            { label: 'LNG', render: row => row.pr_long },
        ],
    },
]

export function createEmptyTotals(): StatTotals {
    return {
        attempts: 0,
        completions: 0,
        pass_yards: 0,
        pass_td: 0,
        pass_int: 0,
        long: 0,
        carries: 0,
        rush_yards: 0,
        rush_td: 0,
        fumbles: 0,
        yac: 0,
        receptions: 0,
        rec_yards: 0,
        rec_td: 0,
        rac: 0,
        solo: 0,
        assists: 0,
        tackles: 0,
        tfl: 0,
        sacks: 0,
        def_int: 0,
        forced_fumbles: 0,
        def_td: 0,
        fg_made: 0,
        fg_attempted: 0,
        xp_made: 0,
        xp_attempted: 0,
        punts: 0,
        punt_yards: 0,
        touchbacks: 0,
        kr_yards: 0,
        kr_td: 0,
        pr_yards: 0,
        pr_td: 0,
        kr_long: 0,
        pr_long: 0,
    }
}

export function aggregateCareerRows(stats: CareerPlayerStat[]) {
    const yearlyMap = new Map<number, YearlyStats>()
    const careerTotals = createEmptyTotals()

    for (const stat of stats) {
        const year = stat.game_year || 0
        const yearly = yearlyMap.get(year) ?? { year, ...createEmptyTotals() }

        for (const key of statKeys) {
            const value = Number(stat[key] ?? 0)
            if (longFields.has(key)) {
                yearly[key] = Math.max(yearly[key], value)
                careerTotals[key] = Math.max(careerTotals[key], value)
            } else {
                yearly[key] += value
                careerTotals[key] += value
            }
        }

        yearlyMap.set(year, yearly)
    }

    const yearlyRows = Array.from(yearlyMap.values()).sort((a, b) => (a.year || 0) - (b.year || 0))

    return { yearlyRows, careerTotals }
}

export function formatAverage(total: number, attempts: number) {
    return attempts > 0 ? (total / attempts).toFixed(1) : '0.0'
}

export function formatPercent(made: number, attempted: number) {
    return attempted > 0 ? `${((made / attempted) * 100).toFixed(1)}%` : '0.0%'
}

export function formatQbr(row: StatTotals) {
    return row.attempts > 0
        ? (((8.4 * row.pass_yards) + (330 * row.pass_td) + (100 * row.completions) - (200 * row.pass_int)) / row.attempts).toFixed(1)
        : '0.0'
}

export function getContrastTextColor(color: string, fallback: string) {
    if (!color.startsWith('#')) return fallback

    const hex = color.slice(1)
    const normalized = hex.length === 3
        ? hex.split('').map(char => `${char}${char}`).join('')
        : hex

    if (normalized.length !== 6) return fallback

    const red = parseInt(normalized.slice(0, 2), 16)
    const green = parseInt(normalized.slice(2, 4), 16)
    const blue = parseInt(normalized.slice(4, 6), 16)
    const luminance = (0.299 * red) + (0.587 * green) + (0.114 * blue)

    return luminance > 170 ? '#111827' : '#ffffff'
}
