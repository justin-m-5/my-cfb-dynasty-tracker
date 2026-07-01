// components/dynasty/sections/advance-season/coaching-carousel.tsx

'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/display/button'
import { Select } from '@/components/ui/form/select'
import { Label } from '@/components/ui/form/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card'
import { fbsTeams } from '@/lib/teams/fbs-teams'

export interface TeamChange {
    schoolName: string
    schoolNickName: string
    schoolAbbrev: string
    conference: string
    primaryColor: string
    secondaryColor: string
}

interface CoachingCarouselProps {
    currentSchool: string
    onSwitch: (team: TeamChange) => void
    onStay: () => void
}

export function CoachingCarousel({ currentSchool, onSwitch, onStay }: CoachingCarouselProps) {
    const [switching, setSwitching] = useState(false)
    const [selectedSchool, setSelectedSchool] = useState('')

    const schoolOptions = useMemo(() => {
        return [...fbsTeams].filter(t => t.name !== currentSchool).sort((a, b) => a.name.localeCompare(b.name))
    }, [currentSchool])

    const selectedTeam = useMemo(() => {
        return fbsTeams.find(t => t.name === selectedSchool)
    }, [selectedSchool])

    const handleConfirmSwitch = () => {
        if (!selectedTeam) return
        onSwitch({
            schoolName: selectedTeam.name,
            schoolNickName: selectedTeam.nickName,
            schoolAbbrev: selectedTeam.abbrev,
            conference: selectedTeam.conference,
            primaryColor: selectedTeam.colors.primary,
            secondaryColor: selectedTeam.colors.secondary,
        })
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Coaching Carousel</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-text/60 mb-3">
                    Are you staying at <span className="font-semibold text-text">{currentSchool}</span> or taking a new job?
                </p>

                {!switching ? (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="save"
                            size="sm"
                            onClick={onStay}
                            className="text-xs font-semibold"
                        >
                            Stay at {currentSchool}
                        </Button>
                        <Button
                            bg="var(--primary)"
                            text="white"
                            size="sm"
                            onClick={() => setSwitching(true)}
                            className="text-xs font-semibold"
                        >
                            Switch Teams
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div>
                            <Label className="text-xs">New School</Label>
                            <Select
                                value={selectedSchool}
                                onChange={(e) => setSelectedSchool(e.target.value)}
                                className="mt-1 h-8"
                            >
                                <option value="">Select new school...</option>
                                {schoolOptions.map(t => (
                                    <option key={t.name} value={t.name}>
                                        {t.name} {t.nickName} ({t.conference})
                                    </option>
                                ))}
                            </Select>
                        </div>

                        {selectedTeam && (
                            <div className="rounded-lg border border-primary/20 p-2 text-xs">
                                <p className="font-semibold">{selectedTeam.name} {selectedTeam.nickName}</p>
                                <p className="text-text/60">{selectedTeam.conference} • {selectedTeam.city}, {selectedTeam.state}</p>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <Button
                                variant="save"
                                size="sm"
                                onClick={handleConfirmSwitch}
                                disabled={!selectedTeam}
                                className="text-xs font-semibold"
                            >
                                Confirm Switch
                            </Button>
                            <Button
                                variant="cancel"
                                size="sm"
                                onClick={() => { setSwitching(false); setSelectedSchool('') }}
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
