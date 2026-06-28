// components/forms/create-dynasty-form.tsx

'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { DynastyService } from '@/dal/features/dynasty'
import { fbsTeams, type FbsTeam } from '@/lib/fbs-teams'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

const conferenceLogoByName: Record<string, string> = {
    SEC: '/logos/conferences/SEC_logo_300x300.png',
    ACC: '/logos/conferences/ACC_logo_300x300.png',
    MWC: '/logos/conferences/MWC_logo_300x300.png',
    'Big 12': '/logos/conferences/Big_12_logo_300x300.png',
    'Pac-12': '/logos/conferences/Pac-12_logo-300x300.png',
    AAC: '/logos/conferences/AAC_logo_300x300.png',
    MAC: '/logos/conferences/MAC_logo_300x300.png',
    'Sun Belt': '/logos/conferences/Sun_Belt_logo_300x300.png',
    'Big Ten': '/logos/conferences/Big_Ten_logo_300x300.png',
    'C-USA': '/logos/conferences/CUSA_logo_300x300.png',
    Independents: '/logos/conferences/Independents_logo_300x300.png',
}

function toLogoToken(value: string) {
    return value.replace(/\(([^)]+)\)/g, '$1').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

function getSchoolLogoCandidates(team: FbsTeam): string[] {
    const school = toLogoToken(team.name)
    const nick = toLogoToken(team.nickName)

    return [
        `/logos/${school}_${nick}_logo_300x300.png`,
        `/logos/${school}_${nick}_Logo_300x300.png`,
        `/logos/${school}_${nick}_300x300.png`,
    ]
}

function LogoImage({ candidates, alt }: { candidates: string[]; alt: string }) {
    const [index, setIndex] = useState(0)

    if (candidates.length === 0 || index >= candidates.length) {
        return (
            <div className="flex h-14 w-14 items-center justify-center rounded-md border bg-background text-xs text-text/70">
                N/A
            </div>
        )
    }

    return (
        <Image
            src={candidates[index]}
            alt={alt}
            width={56}
            height={56}
            className="h-14 w-14 rounded-md border bg-background object-contain p-1"
            onError={() => setIndex((prev) => prev + 1)}
            unoptimized
        />
    )
}

export function CreateDynastyForm() {
    const router = useRouter()
    const [dynastyName, setDynastyName] = useState('')
    const [coachName, setCoachName] = useState('')
    const [currentYear, setCurrentYear] = useState(2026)
    const [conference, setConference] = useState('')
    const [teamId, setTeamId] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const conferences = useMemo(
        () => [...new Set(fbsTeams.map((team) => team.conference))].sort((a, b) => a.localeCompare(b)),
        []
    )

    const filteredTeams = useMemo(
        () => fbsTeams.filter((team) => team.conference === conference).sort((a, b) => a.name.localeCompare(b.name)),
        [conference]
    )

    const selectedTeam = useMemo(
        () => filteredTeams.find((team) => team.id === teamId) ?? null,
        [filteredTeams, teamId]
    )

    const conferenceLogo = conference ? conferenceLogoByName[conference] ?? null : null
    const schoolLogoCandidates = selectedTeam ? getSchoolLogoCandidates(selectedTeam) : []

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!selectedTeam) {
            setError('Select a conference and team before creating a dynasty.')
            return
        }

        if (!dynastyName.trim() || !coachName.trim()) {
            setError('Dynasty name and coach name are required.')
            return
        }

        setError(null)
        setIsSubmitting(true)

        try {
            await DynastyService.createDynasty({
                name: dynastyName.trim(),
                currentYear,
                coachName: coachName.trim(),
                schoolName: selectedTeam.name,
                schoolNickName: selectedTeam.nickName,
                schoolAbbrev: selectedTeam.abbrev,
                conference: selectedTeam.conference,
                primaryColor: selectedTeam.colors.primary,
                secondaryColor: selectedTeam.colors.secondary,
                accentColor: selectedTeam.colors.accent ?? null,
            })

            router.push('/dashboard')
            router.refresh()
        } catch (submitError: unknown) {
            const msg = submitError instanceof Error
                ? submitError.message
                : typeof submitError === 'object' && submitError !== null && 'message' in submitError
                    ? String((submitError as { message: unknown }).message)
                    : JSON.stringify(submitError)
            console.error('Create dynasty error:', submitError)
            setError(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardContent className="space-y-6 p-8">
                    <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="dynastyName">Dynasty Name</Label>
                    <Input
                        id="dynastyName"
                        value={dynastyName}
                        onChange={(event) => setDynastyName(event.target.value)}
                        placeholder="Alabama Rebuild"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="coachName">Coach Name</Label>
                    <Input
                        id="coachName"
                        value={coachName}
                        onChange={(event) => setCoachName(event.target.value)}
                        placeholder="Nick Saban Jr."
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="currentYear">Starting Year</Label>
                    <Input
                        id="currentYear"
                        type="number"
                        value={currentYear}
                        min={2026}
                        max={2100}
                        onChange={(event) => setCurrentYear(Number(event.target.value) || 2026)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="conference">Conference</Label>
                    <Select
                        id="conference"
                        value={conference}
                        onChange={(event) => {
                            const nextConference = event.target.value
                            setConference(nextConference)
                            setTeamId('')
                        }}
                        required
                    >
                        <option value="">Select conference</option>
                        {conferences.map((conf) => (
                            <option key={conf} value={conf}>
                                {conf}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="team">Team</Label>
                    <Select
                        id="team"
                        value={teamId}
                        onChange={(event) => {
                            const nextTeamId = event.target.value
                            setTeamId(nextTeamId)

                            const team = filteredTeams.find((entry) => entry.id === nextTeamId)
                            if (team && !dynastyName.trim()) {
                                setDynastyName(`${team.name} Dynasty`)
                            }
                        }}
                        disabled={!conference}
                        required
                    >
                        <option value="">Select team</option>
                        {filteredTeams.map((team) => (
                            <option key={team.id} value={team.id}>
                                {team.name} ({team.abbrev})
                            </option>
                        ))}
                    </Select>
                </div>
            </div>

                    <div className="rounded-xl border border-primary/20 bg-background/70 p-4">
                        <p className="mb-3 text-sm font-medium text-text">Preview</p>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="space-y-1 text-sm">
                                <p className="text-text/70">Conference Logo</p>
                                {conferenceLogo ? (
                                    <Image
                                        src={conferenceLogo}
                                        alt={`${conference} logo`}
                                        width={56}
                                        height={56}
                                        className="h-14 w-14 rounded-md border bg-background object-contain p-1"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex h-14 w-14 items-center justify-center rounded-md border bg-background text-xs text-text/70">
                                        N/A
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1 text-sm">
                                <p className="text-text/70">School Logo</p>
                                <LogoImage candidates={schoolLogoCandidates} alt={selectedTeam?.name ?? 'School logo'} />
                            </div>

                            {selectedTeam && (
                                <div className="space-y-1 text-sm">
                                    <p className="text-text/70">Team Colors</p>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="h-6 w-6 rounded-full border"
                                            style={{ backgroundColor: selectedTeam.colors.primary }}
                                            title={`Primary ${selectedTeam.colors.primary}`}
                                        />
                                        <span
                                            className="h-6 w-6 rounded-full border"
                                            style={{ backgroundColor: selectedTeam.colors.secondary }}
                                            title={`Secondary ${selectedTeam.colors.secondary}`}
                                        />
                                        {selectedTeam.colors.accent && (
                                            <span
                                                className="h-6 w-6 rounded-full border"
                                                style={{ backgroundColor: selectedTeam.colors.accent }}
                                                title={`Accent ${selectedTeam.colors.accent}`}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                </CardContent>

                <CardFooter className="justify-start gap-3">
                    <Button type="submit" disabled={isSubmitting} bg="primary" text="white" className="font-bold">
                        {isSubmitting ? 'Creating...' : 'Create Dynasty'}
                    </Button>
                    <Button
                        type="button"
                        bg="secondary" text="white"
                        onClick={() => router.push('/dashboard')}
                    >
                        Cancel
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
