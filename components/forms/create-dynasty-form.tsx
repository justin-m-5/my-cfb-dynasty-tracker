// components/forms/create-dynasty-form.tsx

'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { DynastyService } from '@/dal/features/dynasty'
import { fbsTeams, type FbsTeam } from '@/lib/fbs-teams'
import { pipelinesByRegion } from '@/lib/pipelines'
import { conferenceLogoByName, getSchoolLogoCandidates } from '@/lib/logos'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { LogoImage } from '@/components/ui/logo-image'

function getTeamLogoCandidates(team: FbsTeam): string[] {
    return getSchoolLogoCandidates(team.name, team.nickName)
}

export function CreateDynastyForm() {
    const router = useRouter()
    const [dynastyName, setDynastyName] = useState('')
    const [coachName, setCoachName] = useState('')
    const [currentYear, setCurrentYear] = useState(2026)
    const [conference, setConference] = useState('')
    const [teamId, setTeamId] = useState('')
    const [almaMater, setAlmaMater] = useState('')
    const [pipeline, setPipeline] = useState('')
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
    const schoolLogoCandidates = selectedTeam ? getTeamLogoCandidates(selectedTeam) : []

    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
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
                almaMater: almaMater || null,
                pipeline: pipeline || null,
                primaryColor: selectedTeam.colors.primary,
                secondaryColor: selectedTeam.colors.secondary
            })

            router.push('/dashboard')
            router.refresh()
        } catch (submitError: unknown) {
            const msg = submitError instanceof Error ? submitError.message : typeof submitError === 'object' && submitError !== null && 'message' in submitError
            ? String((submitError as { message: unknown }).message) : JSON.stringify(submitError)
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
                    <div className="grid gap-4 sm:grid-cols-2">
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

                        <div className="space-y-2">
                            <Label htmlFor="pipeline">Pipeline</Label>
                            <Select
                                id="pipeline"
                                value={pipeline}
                                onChange={(event) => setPipeline(event.target.value)}
                            >
                                <option value="">None</option>
                                {pipelinesByRegion.map((group) => (
                                    <optgroup key={group.region} label={group.region}>
                                        {group.pipelines.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="almaMater">Alma Mater</Label>
                            <Select
                                id="almaMater"
                                value={almaMater}
                                onChange={(event) => setAlmaMater(event.target.value)}
                            >
                                <option value="">None</option>
                                {[...new Set(fbsTeams.map(t => t.conference))].sort().map((conf) => (
                                    <optgroup key={conf} label={conf}>
                                        {fbsTeams
                                            .filter(t => t.conference === conf)
                                            .sort((a, b) => a.name.localeCompare(b.name))
                                            .map((team) => (
                                                <option key={team.id} value={team.name}>
                                                    {team.name} {team.nickName}
                                                </option>
                                            ))}
                                    </optgroup>
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
                                <LogoImage candidates={schoolLogoCandidates} alt={selectedTeam?.name ?? 'School logo'} size={56} />
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
                    <Button type="submit" disabled={isSubmitting} bg="var(--green-600)" text="white" className="font-bold">
                        {isSubmitting ? 'Creating...' : 'Create Dynasty'}
                    </Button>
                    <Button
                        type="button"
                        bg="var(--secondary)" text="white"
                        onClick={() => router.push('/dashboard')}
                    >
                        Cancel
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
