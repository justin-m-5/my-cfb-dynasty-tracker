// components/dynasty/player-card/career-stats.tsx

'use client'

import { useMemo } from 'react'

import type { CareerPlayerStat } from '@/dal/features/player-stats'

import { aggregateCareerRows, statCategoryConfigs } from './stat-config'
import type { StatCategoryConfig, StatTotals, YearlyStats } from './types'

interface CareerStatsTabProps {
    careerStats: CareerPlayerStat[]
}

function CareerStatsSection({ config, yearlyRows, careerTotals }: { config: StatCategoryConfig; yearlyRows: YearlyStats[]; careerTotals: StatTotals }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-primary/15 bg-background/70">
            <div className="border-b border-primary/10 px-4 py-3">
                <h3 className="text-sm font-semibold text-text">{config.label}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                    <thead>
                        <tr className="border-b border-primary/10 bg-primary/5 text-text/60">
                            <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide">Year</th>
                            {config.columns.map((column) => (
                                <th key={column.label} className="px-3 py-2 text-center font-semibold uppercase tracking-wide whitespace-nowrap">
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {yearlyRows.map((row) => (
                            <tr key={`${config.key}-${row.year}`} className="border-b border-primary/10 transition-colors last:border-b-0 hover:bg-primary/5">
                                <td className="px-3 py-2 font-medium text-text">{row.year || '—'}</td>
                                {config.columns.map((column) => (
                                    <td key={column.label} className="px-3 py-2 text-center tabular-nums text-text/80 whitespace-nowrap">
                                        {column.render(row)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        <tr className="bg-primary/10 font-semibold text-text">
                            <td className="px-3 py-2">Career</td>
                            {config.columns.map((column) => (
                                <td key={column.label} className="px-3 py-2 text-center tabular-nums whitespace-nowrap">
                                    {column.render(careerTotals)}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export function CareerStatsTab({ careerStats }: CareerStatsTabProps) {
    const { yearlyRows, careerTotals } = useMemo(() => aggregateCareerRows(careerStats), [careerStats])
    const visibleStatSections = useMemo(
        () => statCategoryConfigs.filter((config) => config.show(careerTotals)),
        [careerTotals]
    )

    if (visibleStatSections.length === 0) {
        return (
            <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-10 text-center text-sm text-text/60">
                No career stats recorded yet.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {visibleStatSections.map((config) => (
                <CareerStatsSection
                    key={config.key}
                    config={config}
                    yearlyRows={yearlyRows.filter((row) => config.show(row))}
                    careerTotals={careerTotals}
                />
            ))}
        </div>
    )
}
