// components/dynasty/sections/season-history/year-picker-header.tsx

import Image from 'next/image'
import { Select } from '@/components/ui/form/select'
import { LogoImage } from '@/components/ui/display/logo-image'
import { conferenceLogoByName, getSchoolLogoCandidates, getTeamLogo } from '@/lib/teams/logos'
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
    const conferenceLogo = selectedYearRecord?.conference 
        ? conferenceLogoByName[selectedYearRecord.conference] ?? null 
        : null

    const schoolLogos = selectedYearRecord 
        ? Array.from(
            new Set([
                getTeamLogo(selectedYearRecord.school_name),
                ...getSchoolLogoCandidates(selectedYearRecord.school_name, selectedYearRecord.school_nickname ?? ''),
            ].filter(Boolean))
        )
        : []

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Logo */}
            {!isAllTime && selectedYearRecord && (
                <div className="shrink-0">
                    <LogoImage
                        candidates={schoolLogos}
                        alt={selectedYearRecord.school_name}
                        size={56}
                    />
                </div>
            )}
            
            {/* Year Picker */}
            <div className="flex-1 max-w-md">
                <Select
                    value={selectedYear}
                    onChange={(e) => onYearChange(e.target.value)}
                    className="h-10 text-base font-semibold"
                >
                    <option value="all-time">All-Time Career Stats</option>
                    {yearRecords.map((record) => (
                        <option key={record.id} value={record.id}>
                            {record.year} — {record.school_name}
                        </option>
                    ))}
                </Select>
            </div>

            {/* Conference Badge */}
            {!isAllTime && selectedYearRecord && conferenceLogo && (
                <div className="flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2">
                    <Image
                        src={conferenceLogo}
                        alt={selectedYearRecord.conference ?? ''}
                        width={24}
                        height={24}
                        className="rounded bg-white dark:bg-white object-contain p-0.5"
                        unoptimized
                    />
                    <span className="text-sm font-semibold text-text">{selectedYearRecord.conference}</span>
                </div>
            )}
        </div>
    )
}
