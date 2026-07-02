// components/forms/create-dynasty-form/dynasty-info-step.tsx

import Image from 'next/image'

import { Input } from '@/components/ui/form/input'
import { Label } from '@/components/ui/form/label'
import { LogoImage } from '@/components/ui/display/logo-image'
import { Select } from '@/components/ui/form/select'
import { pipelinesByRegion } from '@/lib/config/pipelines'
import type { FbsTeam } from '@/lib/teams/fbs-teams'
import { INITIAL_YEAR } from './utils'

interface DynastyInfoStepProps {
    dynastyName: string
    setDynastyName: (value: string) => void
    coachName: string
    setCoachName: (value: string) => void
    currentYear: number
    setCurrentYear: (value: number) => void
    conference: string
    setConference: (value: string) => void
    teamId: string
    setTeamId: (value: string) => void
    almaMater: string
    setAlmaMater: (value: string) => void
    pipeline: string
    setPipeline: (value: string) => void
    conferences: string[]
    teamsByConference: Array<{ conference: string; teams: FbsTeam[] }>
    filteredTeams: FbsTeam[]
    selectedTeam: FbsTeam | null
    conferenceLogo: string | null
    schoolLogoCandidates: string[]
}

export function DynastyInfoStep({
    dynastyName,
    setDynastyName,
    coachName,
    setCoachName,
    currentYear,
    setCurrentYear,
    conference,
    setConference,
    teamId,
    setTeamId,
    almaMater,
    setAlmaMater,
    pipeline,
    setPipeline,
    conferences,
    teamsByConference,
    filteredTeams,
    selectedTeam,
    conferenceLogo,
    schoolLogoCandidates,
}: DynastyInfoStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-text">Step 1 · Dynasty Info</h2>
                <p className="text-sm text-text/70">Choose your school, coach, and starting setup.</p>
            </div>

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
                        min={INITIAL_YEAR}
                        max={2100}
                        onChange={(event) => setCurrentYear(Number(event.target.value) || INITIAL_YEAR)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="conference">Conference</Label>
                    <Select
                        id="conference"
                        value={conference}
                        onChange={(event) => {
                            setConference(event.target.value)
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
                                {group.pipelines.map((entry) => (
                                    <option key={entry} value={entry}>{entry}</option>
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
                        {teamsByConference.map((group) => (
                            <optgroup key={group.conference} label={group.conference}>
                                {group.teams.map((team) => (
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
                                className="h-14 w-14 rounded-md border bg-white object-contain p-1 dark:bg-white"
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
        </div>
    )
}
