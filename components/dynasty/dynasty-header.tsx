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
                <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">

                    {/* LEFT: Logo + Season */}
                    <div className="flex shrink-0 items-center gap-3 sm:w-24 sm:flex-col">
                        <LogoImage
                            candidates={schoolLogos}
                            alt={dynasty.school_name}
                            size={64}
                            className="sm:order-2"
                        />
                        <span className="text-xs font-bold uppercase tracking-wider text-primary sm:order-1 sm:mb-2">
                            {dynasty.current_year} Season
                        </span>
                    </div>

                    {/* RIGHT: Team info */}
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">

                        {/* ROW 1: Coach, School, Conference */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h1 className="text-xl font-bold text-text sm:text-2xl">
                                {dynasty.coach_name}
                            </h1>

                            <span className="text-base font-medium text-text/80 sm:text-lg">
                                {dynasty.school_name} {dynasty.school_nickname}
                            </span>

                            <div className="flex items-center gap-1.5 text-sm text-text/70">
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
                        </div>

                        {/* ROW 2: Alma Mater, Pipeline */}
                        <div className="flex flex-wrap gap-x-6 gap-y-1">
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
            <dt className="text-xs font-bold uppercase text-text/50">
                {label}:
            </dt>

            <dd className="text-sm font-semibold text-text">
                {value}
            </dd>
        </div>
    )
}
