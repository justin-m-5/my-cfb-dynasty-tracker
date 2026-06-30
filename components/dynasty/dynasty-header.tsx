// components/dynasty/dynasty-header.tsx

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

import { DynastyService, type Dynasty } from '@/dal/features/dynasty'
import { LogoImage } from '@/components/ui/logo-image'
import { Card, CardContent } from '@/components/ui/card'
import { conferenceLogoByName, getSchoolLogoCandidates } from '@/lib/logos'

interface DynastyHeaderProps {
    dynastyId: string
}

export function DynastyHeader({ dynastyId }: DynastyHeaderProps) {
    const [dynasty, setDynasty] = useState<Dynasty | null>(null)

    useEffect(() => {
        DynastyService.getDynastyById(dynastyId).then(setDynasty)
    }, [dynastyId])

    if (!dynasty) {
        return (
            <Card>
                <CardContent className="py-4 text-sm text-text/60">Loading team info...</CardContent>
            </Card>
        )
    }

    const conferenceLogo = dynasty.conference ? conferenceLogoByName[dynasty.conference] ?? null : null
    const schoolLogos = getSchoolLogoCandidates(dynasty.school_name, dynasty.school_nickname)

    return (
        <Card className="my-4">
            <CardContent className="py-4">
                <div className="flex gap-4 sm:gap-6">

                    {/* LEFT: Logo column (always on left) */}
                    <div className="flex w-20 shrink-0 flex-col items-center gap-2 sm:w-24">
                        <span 
                            className="font-bold uppercase tracking-wider text-primary"
                            style={{ fontSize: 'var(--text-dynasty-label)' }}
                        >
                            {dynasty.current_year} Season
                        </span>
                        <LogoImage
                            candidates={schoolLogos}
                            alt={dynasty.school_name}
                            size={64}
                        />
                    </div>

                    {/* RIGHT: Info rows stacked */}
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 sm:gap-2">

                        {/* Row 1: Coach name */}
                        <h1 
                            className="font-bold text-text"
                            style={{ fontSize: 'var(--text-dynasty-coach)' }}
                        >
                            {dynasty.coach_name}
                        </h1>

                        {/* Row 2: School name + nickname */}
                        <div 
                            className="font-medium text-text/90"
                            style={{ fontSize: 'var(--text-dynasty-school)' }}
                        >
                            {dynasty.school_name} {dynasty.school_nickname}
                        </div>

                        {/* Row 3: Conference */}
                        <div 
                            className="flex items-center gap-1.5 text-text/70"
                            style={{ fontSize: 'var(--text-dynasty-meta)' }}
                        >
                            {conferenceLogo && (
                                <Image
                                    src={conferenceLogo}
                                    alt=""
                                    width={16}
                                    height={16}
                                    className="rounded"
                                    unoptimized
                                />
                            )}
                            <span>{dynasty.conference ?? "Independent"}</span>
                        </div>

                        {/* Row 4: Alma Mater & Pipeline (wraps on mobile) */}
                        {(dynasty.alma_mater || dynasty.pipeline) && (
                            <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-4">
                                {dynasty.alma_mater && (
                                    <InfoRow
                                        label="Alma Mater"
                                        value={dynasty.alma_mater}
                                    />
                                )}

                                {dynasty.pipeline && (
                                    <InfoRow
                                        label="Pipeline"
                                        value={dynasty.pipeline}
                                    />
                                )}
                            </div>
                        )}

                    </div>

                </div>
            </CardContent>
        </Card>
    )
}

function InfoRow({
    label,
    value,
}: {
    label: string
    value: string
}) {
    return (
        <div className="flex items-center gap-1 whitespace-nowrap">
            <dt 
                className="font-bold uppercase text-text/50"
                style={{ fontSize: 'var(--text-dynasty-label)' }}
            >
                {label}:
            </dt>

            <dd 
                className="font-semibold text-text"
                style={{ fontSize: 'var(--text-dynasty-meta)' }}
            >
                {value}
            </dd>
        </div>
    )
}
