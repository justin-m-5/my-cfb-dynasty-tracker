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
            <CardContent className="space-y-4 py-4">
                <div className="flex items-center gap-3">
                    <LogoImage candidates={schoolLogos} alt={dynasty.school_name} size={52} />
                    <div>
                        <h1 className="text-lg font-bold text-text">{dynasty.current_year} Season</h1>
                        <div className="flex items-center gap-2 text-sm text-text/70">
                            {conferenceLogo && (
                                <Image
                                    src={conferenceLogo}
                                    alt={dynasty.conference ?? ''}
                                    width={24}
                                    height={24}
                                    className="rounded object-contain"
                                    unoptimized
                                />
                            )}
                            <span>
                                {dynasty.school_name}
                                {dynasty.school_nickname ? ` ${dynasty.school_nickname}` : ''}
                            </span>
                        </div>
                    </div>
                </div>

                <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <InfoRow label="School" value={`${dynasty.school_name}${dynasty.school_nickname ? ` ${dynasty.school_nickname}` : ''}`} />
                    <InfoRow label="Conference" value={dynasty.conference ?? 'Independent'} />
                    <InfoRow label="Coach" value={dynasty.coach_name} />
                    <InfoRow label="Current Year" value={String(dynasty.current_year)} />
                    {dynasty.alma_mater && <InfoRow label="Alma Mater" value={dynasty.alma_mater} />}
                    {dynasty.pipeline && <InfoRow label="Pipeline" value={dynasty.pipeline} />}
                </dl>
            </CardContent>
        </Card>
    )
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="font-medium text-text/60">{label}</dt>
            <dd className="text-text">{value}</dd>
        </div>
    )
}
