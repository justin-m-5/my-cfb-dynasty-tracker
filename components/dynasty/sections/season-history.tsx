// components/dynasty/sections/season-history.tsx

'use client'

import { useEffect, useMemo, useState } from 'react'

import { YearRecordService, type YearRecord } from '@/dal/features/year-records'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MiniTabNav } from '@/components/ui/mini-tab-nav'

import { AllTimeOverview } from './season-history/all-time-overview'
import { YearAwards } from './season-history/year-awards'
import { YearOverview } from './season-history/year-overview'
import { YearSchedule } from './season-history/year-schedule'
import { YearStats } from './season-history/year-stats'
import { YearTop25 } from './season-history/year-top25'
import { YearPickerHeader } from './season-history/year-picker-header'

type HistoryTab = 'overview' | 'schedule' | 'top25' | 'stats' | 'awards'
type YearSelection = 'all-time' | string

const tabs: { name: string; key: HistoryTab }[] = [
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
        <div className="space-y-5 pt-10">
            {/* Year Picker Header with Stats */}
            <YearPickerHeader
                yearRecords={yearRecords}
                selectedYear={selectedYear}
                selectedYearRecord={selectedYearRecord}
                isAllTime={isAllTime}
                onYearChange={(year) => setSelectedYear(year as YearSelection)}
            />

            {/* Tabs — vertical on mobile, horizontal on desktop */}
            <MiniTabNav
                tabs={tabs.map(t => t.name)}
                active={tabs.find(t => t.key === activeTab)?.name ?? tabs[0].name}
                onChange={(name) => {
                    const match = tabs.find(t => t.name === name)
                    if (match) setActiveTab(match.key)
                }}
            />

            {/* Tab content */}
            {activeTab === 'overview' && (
                isAllTime ? <AllTimeOverview yearRecords={yearRecords} /> : selectedYearRecord ? <YearOverview yearRecord={selectedYearRecord} /> : null
            )}

            {activeTab === 'schedule' && (
                isAllTime ? (
                    <HistoryPlaceholder title="Schedule" message="Select a season to view game results." />
                ) : selectedYearRecord ? (
                    <YearSchedule dynastyId={dynastyId} yearRecord={selectedYearRecord} />
                ) : null
            )}

            {activeTab === 'top25' && (
                isAllTime ? (
                    <HistoryPlaceholder title="Top 25" message="Select a season to view the final poll." />
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
