// components/dynasty/sections/season-history/year-picker-header.tsx

import { useMemo } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import { Select } from '@/components/ui/select'
import { DetailCard } from '@/components/ui/detail-card'
import { LogoImage } from '@/components/ui/logo-image'
import { conferenceLogoByName, getSchoolLogoCandidates } from '@/lib/logos'
import type { YearRecord } from '@/dal/features/year-records'

interface YearPickerHeaderProps {
    yearRecords: YearRecord[]
    selectedYear: string
    selectedYearRecord: YearRecord | null
    isAllTime: boolean
    onYearChange: (year: string) => void
}

export function YearPickerHeader({
    yearRecords,
    selectedYear,
    selectedYearRecord,
    isAllTime,
    onYearChange,
}: YearPickerHeaderProps) {
    const parseRecord = (recordStr: string): { wins: number; losses: number } => {
        const match = recordStr.match(/(\d+)-(\d+)/)
        if (!match) return { wins: 0, losses: 0 }
        return { wins: parseInt(match[1], 10), losses: parseInt(match[2], 10) }
    }

    const allTimeStats = useMemo(() => {
        let totalWins = 0
        let totalLosses = 0
        let totalChampionships = 0
        let totalBowlWins = 0
        let totalConfTitles = 0
        
        yearRecords.forEach(yr => {
            const { wins, losses } = parseRecord(yr.overall_record)
            totalWins += wins
            totalLosses += losses
            
            if (yr.nat_champ && yr.nat_champ !== 'N/A' && yr.nat_champ !== '') totalChampionships++
            if (yr.bowl_result === 'W') totalBowlWins++
            if (yr.conference_finish === '1st' || yr.conference_finish === 'Champion') totalConfTitles++
        })
        
        return {
            record: `${totalWins}-${totalLosses}`,
            championships: totalChampionships,
            bowls: totalBowlWins,
            confTitles: totalConfTitles,
            seasons: yearRecords.length,
        }
    }, [yearRecords])

    const yearStats = useMemo(() => {
        if (!selectedYearRecord) return null
        
        const { wins, losses } = parseRecord(selectedYearRecord.overall_record)
        const championships = selectedYearRecord.nat_champ && selectedYearRecord.nat_champ !== 'N/A' && selectedYearRecord.nat_champ !== '' ? 1 : 0
        const bowlWins = selectedYearRecord.bowl_result === 'W' ? 1 : 0
        const confTitles = selectedYearRecord.conference_finish === '1st' || selectedYearRecord.conference_finish === 'Champion' ? 1 : 0
        
        return {
            record: `${wins}-${losses}`,
            championships,
            bowls: bowlWins,
            confTitles,
        }
    }, [selectedYearRecord])

    const conferenceLogo = selectedYearRecord?.conference 
        ? conferenceLogoByName[selectedYearRecord.conference] ?? null 
        : null

    const schoolLogos = selectedYearRecord 
        ? getSchoolLogoCandidates(selectedYearRecord.school_name, selectedYearRecord.school_nickname ?? '')
        : []

    return (
        <div className="space-y-3">
            {/* Year Picker with Logo */}
            <div className="flex items-center gap-3">
                {!isAllTime && selectedYearRecord && (
                    <LogoImage
                        candidates={schoolLogos}
                        alt={selectedYearRecord.school_name}
                        size={48}
                    />
                )}
                
                <div className="relative flex-1 max-w-xs">
                    <Select
                        value={selectedYear}
                        onChange={(e) => onYearChange(e.target.value)}
                        className="h-10 text-base font-semibold pr-8 appearance-none"
                    >
                        <option value="all-time">All-Time Career Stats</option>
                        {yearRecords.map((record) => (
                            <option key={record.id} value={record.id}>
                                {record.year} — {record.school_name}
                            </option>
                        ))}
                    </Select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text/50 pointer-events-none" />
                </div>

                {!isAllTime && selectedYearRecord && conferenceLogo && (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-text/70">
                        <Image
                            src={conferenceLogo}
                            alt={selectedYearRecord.conference ?? ''}
                            width={20}
                            height={20}
                            className="rounded"
                            unoptimized
                        />
                        <span>{selectedYearRecord.conference}</span>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            {isAllTime ? (
                <div className="grid grid-cols-5 gap-3">
                    <DetailCard
                        label="Seasons"
                        value={allTimeStats.seasons.toString()}
                        color="var(--primary)"
                    />
                    <DetailCard
                        label="Record"
                        value={allTimeStats.record}
                        color="var(--blue-600)"
                    />
                    <DetailCard
                        label="Nat'l Titles"
                        value={allTimeStats.championships.toString()}
                        color="var(--amber-600)"
                    />
                    <DetailCard
                        label="Conf Titles"
                        value={allTimeStats.confTitles.toString()}
                        color="var(--purple-600)"
                    />
                    <DetailCard
                        label="Bowl Wins"
                        value={allTimeStats.bowls.toString()}
                        color="var(--green-600)"
                    />
                </div>
            ) : yearStats ? (
                <div className="grid grid-cols-4 gap-3">
                    <DetailCard
                        label="Season Record"
                        value={yearStats.record}
                        color="var(--blue-600)"
                    />
                    <DetailCard
                        label="Nat'l Titles"
                        value={yearStats.championships.toString()}
                        color="var(--amber-600)"
                    />
                    <DetailCard
                        label="Conf Titles"
                        value={yearStats.confTitles.toString()}
                        color="var(--purple-600)"
                    />
                    <DetailCard
                        label="Bowl Wins"
                        value={yearStats.bowls.toString()}
                        color="var(--green-600)"
                    />
                </div>
            ) : null}
        </div>
    )
}
