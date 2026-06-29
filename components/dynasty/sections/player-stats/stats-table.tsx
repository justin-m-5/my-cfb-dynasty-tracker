// components/dynasty/sections/player-stats/stats-table.tsx

'use client'

import { categoryColumns, computeStat, type StatCategory } from '@/lib/stat-categories'
import type { PlayerStat } from '@/dal/features/player-stats'

interface AggregatedStat {
    player_name: string
    position: string
    [key: string]: string | number
}

interface StatsTableProps {
    stats: (PlayerStat & { player_name: string; position: string })[]
    category: StatCategory
}

// Aggregate per-game stats into totals per player
function aggregateStats(stats: (PlayerStat & { player_name: string; position: string })[]): AggregatedStat[] {
    const map = new Map<string, AggregatedStat>()

    for (const row of stats) {
        const key = row.player_id
        if (!map.has(key)) {
            map.set(key, {
                player_name: row.player_name,
                position: row.position,
                attempts: 0, completions: 0, pass_yards: 0, pass_td: 0, pass_int: 0, long: 0,
                carries: 0, rush_yards: 0, rush_td: 0, fumbles: 0, yac: 0,
                receptions: 0, rec_yards: 0, rec_td: 0, rac: 0,
                solo: 0, assists: 0, tackles: 0, tfl: 0, sacks: 0, def_int: 0, forced_fumbles: 0, def_td: 0,
                fg_made: 0, fg_attempted: 0, xp_made: 0, xp_attempted: 0,
                punts: 0, punt_yards: 0, touchbacks: 0,
                kr_yards: 0, kr_td: 0, pr_yards: 0, pr_td: 0, kr_long: 0, pr_long: 0,
            } as unknown as AggregatedStat)
        }
        const agg = map.get(key)!
        const numericKeys = Object.keys(agg).filter(k => k !== 'player_name' && k !== 'position')
        for (const k of numericKeys) {
            const cur = Number(agg[k]) || 0
            const val = Number((row as unknown as Record<string, number>)[k]) || 0
            if (k === 'long' || k === 'kr_long' || k === 'pr_long') {
                agg[k] = Math.max(cur, val)
            } else {
                agg[k] = cur + val
            }
        }
    }

    return Array.from(map.values())
}

const num = (s: AggregatedStat, k: string) => Number(s[k]) || 0

// Filter to only players with relevant stats for the category
function filterByCategory(stats: AggregatedStat[], category: StatCategory): AggregatedStat[] {
    switch (category) {
        case 'Passing': return stats.filter(s => num(s, 'attempts') > 0)
        case 'Rushing': return stats.filter(s => num(s, 'carries') > 0)
        case 'Receiving': return stats.filter(s => num(s, 'receptions') > 0)
        case 'Defense': return stats.filter(s => num(s, 'solo') + num(s, 'assists') > 0)
        case 'Kicking': return stats.filter(s => num(s, 'fg_attempted') > 0 || num(s, 'xp_attempted') > 0)
        case 'Punting': return stats.filter(s => num(s, 'punts') > 0)
        case 'Returns': return stats.filter(s => num(s, 'kr_yards') > 0 || num(s, 'pr_yards') > 0)
        default: return stats
    }
}

// Sort by the primary yardage/stat column for each category
function sortByCategory(stats: AggregatedStat[], category: StatCategory): AggregatedStat[] {
    const sortKey: Record<StatCategory, string> = {
        Passing: 'pass_yards',
        Rushing: 'rush_yards',
        Receiving: 'rec_yards',
        Defense: 'solo',
        Kicking: 'fg_made',
        Punting: 'punt_yards',
        Returns: 'kr_yards',
    }
    const key = sortKey[category]
    return [...stats].sort((a, b) => num(b, key) - num(a, key))
}

export function StatsTable({ stats, category }: StatsTableProps) {
    const columns = categoryColumns[category]
    const aggregated = aggregateStats(stats)
    const filtered = filterByCategory(aggregated, category)
    const sorted = sortByCategory(filtered, category)

    if (sorted.length === 0) {
        return (
            <p className="text-sm text-text/60 py-4 text-center">
                No {category.toLowerCase()} stats recorded this season.
            </p>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
                <thead>
                    <tr className="border-b border-primary/15">
                        <th className="py-1 px-1.5 text-left font-semibold text-text/50 uppercase tracking-wide">Player</th>
                        {columns.map(col => (
                            <th key={col.key} className="py-1 px-1.5 text-center font-semibold text-text/50 uppercase tracking-wide">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((row, i) => (
                        <tr key={i} className="border-b border-primary/10 last:border-b-0 hover:bg-primary/5">
                            <td className="py-1.5 px-1.5 text-left">
                                <span className="text-xs font-semibold text-text">{row.player_name}</span>
                                <span className="text-text/50 ml-1">{row.position}</span>
                            </td>
                            {columns.map(col => (
                                <td key={col.key} className="py-1.5 px-1.5 text-center text-xs text-text/80 tabular-nums">
                                    {col.computed ? computeStat(col.key, row) : (row[col.key] ?? 0)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
