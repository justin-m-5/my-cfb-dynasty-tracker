'use client'

import { useMemo, useState } from 'react'

import type { CareerPlayerStat } from '@/dal/features/player-stats'
import { cn } from '@/lib/utils'

import { aggregateCareerRows, createEmptyTotals, getContrastTextColor, statCategoryConfigs } from './stat-config'
import type { SchoolColors, StatCategoryConfig, StatTotals } from './types'

interface GameLogsTabProps {
    careerStats: CareerPlayerStat[]
    schoolColors: SchoolColors
}

function GameLogsSection({ config, rows, seasonTotals }: { config: StatCategoryConfig; rows: CareerPlayerStat[]; seasonTotals: StatTotals }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-primary/15 bg-background/70">
            <div className="border-b border-primary/10 px-4 py-3">
                <h3 className="text-sm font-semibold text-text">{config.label}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                    <thead>
                        <tr className="border-b border-primary/10 bg-primary/5 text-text/60">
                            <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide">Week</th>
                            {config.columns.map((column) => (
                                <th key={column.label} className="px-3 py-2 text-center font-semibold uppercase tracking-wide whitespace-nowrap">
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={`${config.key}-${row.id}`} className="border-b border-primary/10 transition-colors last:border-b-0 hover:bg-primary/5">
                                <td className="px-3 py-2 font-medium text-text">{row.game_week || '—'}</td>
                                {config.columns.map((column) => (
                                    <td key={column.label} className="px-3 py-2 text-center tabular-nums text-text/80 whitespace-nowrap">
                                        {column.render(row)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        <tr className="bg-primary/10 font-semibold text-text">
                            <td className="px-3 py-2">Season Total</td>
                            {config.columns.map((column) => (
                                <td key={column.label} className="px-3 py-2 text-center tabular-nums whitespace-nowrap">
                                    {column.render(seasonTotals)}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export function GameLogsTab({ careerStats, schoolColors }: GameLogsTabProps) {
    const availableYears = useMemo(
        () => Array.from(new Set(careerStats.map((stat) => stat.game_year || 0))).sort((a, b) => a - b),
        [careerStats]
    )
    const [selectedYear, setSelectedYear] = useState<number | null>(null)
    const activeYear = selectedYear != null && availableYears.includes(selectedYear)
        ? selectedYear
        : availableYears[availableYears.length - 1] ?? null

    const selectedYearRows = useMemo(
        () => careerStats
            .filter((stat) => stat.game_year === activeYear)
            .sort((a, b) => (a.game_week || 0) - (b.game_week || 0)),
        [activeYear, careerStats]
    )
    const seasonTotals = useMemo(
        () => (selectedYearRows.length > 0 ? aggregateCareerRows(selectedYearRows).careerTotals : createEmptyTotals()),
        [selectedYearRows]
    )
    const visibleSections = useMemo(
        () => statCategoryConfigs.filter((config) => config.show(seasonTotals)),
        [seasonTotals]
    )
    const activeTextColor = getContrastTextColor(schoolColors.primary, '#ffffff')

    if (availableYears.length === 0) {
        return (
            <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-10 text-center text-sm text-text/60">
                No game logs recorded yet.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 rounded-2xl border border-primary/15 bg-background/70 p-3">
                {availableYears.map((year) => {
                    const isActive = year === activeYear
                    return (
                        <button
                            key={year}
                            type="button"
                            onClick={() => setSelectedYear(year)}
                            className={cn(
                                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                                isActive
                                    ? 'border-transparent shadow-sm'
                                    : 'border-primary/10 bg-background text-text/70 hover:bg-primary/5 hover:text-text'
                            )}
                            style={isActive ? { backgroundColor: schoolColors.primary, color: activeTextColor } : undefined}
                        >
                            {year || '—'}
                        </button>
                    )
                })}
            </div>

            {visibleSections.length === 0 ? (
                <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-10 text-center text-sm text-text/60">
                    No game logs recorded for this season.
                </div>
            ) : (
                visibleSections.map((config) => {
                    const rows = selectedYearRows.filter((row) => config.show(row))
                    return <GameLogsSection key={config.key} config={config} rows={rows} seasonTotals={seasonTotals} />
                })
            )}
        </div>
    )
}
