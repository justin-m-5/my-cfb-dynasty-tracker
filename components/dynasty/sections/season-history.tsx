'use client'

import { useEffect, useMemo, useState } from 'react'

import { YearRecordService, type YearRecord } from '@/dal/features/year-records'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { SidebarNav, type SidebarNavItem } from '@/components/ui/sidebar-nav'

import { AllTimeOverview } from './season-history/all-time-overview'
import { YearAwards } from './season-history/year-awards'
import { YearOverview } from './season-history/year-overview'
import { YearSchedule } from './season-history/year-schedule'
import { YearStats } from './season-history/year-stats'
import { YearTop25 } from './season-history/year-top25'

type HistoryTab = 'overview' | 'schedule' | 'top25' | 'stats' | 'awards'
type YearSelection = 'all-time' | string

const tabItems: SidebarNavItem[] = [
    { name: 'Overview', key: 'overview' },
    { name: 'Schedule', key: 'schedule' },
    { name: 'Top 25', key: 'top25' },
    { name: 'Stats', key: 'stats' },
    { name: 'Awards', key: 'awards' },
]

interface SeasonHistoryProps {
    dynastyId: string
}

function HistoryPlaceholder({ title, message }: { title: string; message: string }) {
    return (
        <Card className="border-primary/15">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-text/65">{message}</p>
            </CardContent>
        </Card>
    )
}

export function SeasonHistory({ dynastyId }: SeasonHistoryProps) {
    const [yearRecords, setYearRecords] = useState<YearRecord[]>([])
    const [selectedYear, setSelectedYear] = useState<YearSelection>('all-time')
    const [activeTab, setActiveTab] = useState<HistoryTab>('overview')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const records = await YearRecordService.getYearRecords(dynastyId)
                setYearRecords(records)
                setSelectedYear(records[0]?.id ?? 'all-time')
            } catch (error) {
                console.error('Failed to load season history:', error)
                setYearRecords([])
                setSelectedYear('all-time')
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [dynastyId])

    const selectedYearRecord = useMemo(
        () => yearRecords.find((record) => record.id === selectedYear) ?? null,
        [selectedYear, yearRecords]
    )

    const isAllTime = selectedYear === 'all-time'
    const selectionLabel = isAllTime
        ? `All ${yearRecords.length || 0} seasons`
        : selectedYearRecord
            ? `${selectedYearRecord.year} ${selectedYearRecord.school_name}`
            : 'Season history'

    if (loading) {
        return <div className="text-sm text-text/60">Loading season history...</div>
    }

    if (yearRecords.length === 0) {
        return (
            <Card className="border-primary/15">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Season History</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-text/65">Add a completed season to start building your dynasty history.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <Card className="border-primary/15">
                <CardContent className="space-y-3 pt-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-text">Season History</h2>
                            <p className="text-xs text-text/60">{selectionLabel}</p>
                        </div>
                        <div className="w-full sm:max-w-44">
                            <label htmlFor="season-history-year" className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-text/50">
                                Season
                            </label>
                            <Select
                                id="season-history-year"
                                value={selectedYear}
                                onChange={(event) => setSelectedYear(event.target.value as YearSelection)}
                                className="h-9 bg-background/80 text-sm"
                            >
                                <option value="all-time">All-Time</option>
                                {yearRecords.map((record) => (
                                    <option key={record.id} value={record.id}>
                                        {record.year}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>
                    <SidebarNav items={tabItems} active={activeTab} onChange={(key) => setActiveTab(key as HistoryTab)} />
                </CardContent>
            </Card>

            {activeTab === 'overview' && (
                isAllTime ? <AllTimeOverview yearRecords={yearRecords} /> : selectedYearRecord ? <YearOverview yearRecord={selectedYearRecord} /> : null
            )}

            {activeTab === 'schedule' && (
                isAllTime ? (
                    <HistoryPlaceholder
                        title="Season Schedule"
                        message="Select a single season to review weekly opponents, locations, and results."
                    />
                ) : selectedYearRecord ? (
                    <YearSchedule dynastyId={dynastyId} yearRecord={selectedYearRecord} />
                ) : null
            )}

            {activeTab === 'top25' && (
                isAllTime ? (
                    <HistoryPlaceholder
                        title="Final Top 25"
                        message="Select a single season to view the final saved poll for that year."
                    />
                ) : selectedYearRecord ? (
                    <YearTop25 dynastyId={dynastyId} yearRecord={selectedYearRecord} />
                ) : null
            )}

            {activeTab === 'stats' && (
                <YearStats
                    dynastyId={dynastyId}
                    yearRecords={yearRecords}
                    yearRecordId={selectedYearRecord?.id}
                    isAllTime={isAllTime}
                />
            )}

            {activeTab === 'awards' && (
                <YearAwards
                    dynastyId={dynastyId}
                    yearRecords={yearRecords}
                    yearRecord={selectedYearRecord}
                    isAllTime={isAllTime}
                />
            )}
        </div>
    )
}
