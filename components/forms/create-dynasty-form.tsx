'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { type FormEvent, useMemo, useState } from 'react'

import { Button } from '@/components/ui/display/button'
import { LogoImage } from '@/components/ui/display/logo-image'
import { Input } from '@/components/ui/form/input'
import { Label } from '@/components/ui/form/label'
import { PositionOptions } from '@/components/ui/form/position-options'
import { Select } from '@/components/ui/form/select'
import { Card, CardContent, CardFooter } from '@/components/ui/layout/card'
import { DynastyService } from '@/dal/features/dynasty'
import { PlayerService } from '@/dal/features/players'
import { RosterTemplateService, normalizeYear } from '@/dal/features/roster-templates'
import { YearRecordService } from '@/dal/features/year-records'
import { devTraits, positions, years } from '@/lib/config/player-config'
import { pipelinesByRegion } from '@/lib/config/pipelines'
import { conferenceLogoByName, getSchoolLogoCandidates } from '@/lib/teams/logos'
import { fbsTeams, type FbsTeam } from '@/lib/teams/fbs-teams'

type WizardStep = 0 | 1 | 2

type RosterEntry = {
    id: string
    name: string
    position: string
    rating: string
    year: string
    jerseyNumber: string
    devTrait: string
}

type PreparedRosterEntry = {
    id: string
    name: string
    position: string
    rating: number | null
    year: string | null
    jerseyNumber: number | null
    devTrait: string | null
}

const INITIAL_YEAR = 2026
const INITIAL_ROSTER_ROWS = 5
const WIZARD_STEPS = ['Dynasty Info', 'Roster', 'Review'] as const
const ROSTER_YEAR_ORDER = ['FR', 'SO', 'JR', 'SR', 'FR (RS)', 'SO (RS)', 'JR (RS)', 'SR (RS)'] as const
const ROSTER_DEV_TRAITS = [...devTraits, 'X-Factor']
const VALID_ROSTER_YEARS = new Set<string>(years)

let rosterEntryCounter = 0

function getTeamLogoCandidates(team: FbsTeam): string[] {
    return Array.from(
        new Set([
            team.logo,
            ...getSchoolLogoCandidates(team.name, team.nickName),
        ].filter(Boolean))
    )
}

function createBlankRosterEntry(): RosterEntry {
    rosterEntryCounter += 1

    return {
        id: `roster-entry-${rosterEntryCounter}`,
        name: '',
        position: '',
        rating: '',
        year: '',
        jerseyNumber: '',
        devTrait: 'Normal',
    }
}

function createBlankRosterEntries(count: number): RosterEntry[] {
    return Array.from({ length: count }, () => createBlankRosterEntry())
}

function parseOptionalNumber(value: string): number | null {
    if (!value.trim()) {
        return null
    }

    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }

    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String((error as { message: unknown }).message)
    }

    return 'Something went wrong. Please try again.'
}

export function CreateDynastyForm() {
    const router = useRouter()

    const [currentStep, setCurrentStep] = useState<WizardStep>(0)
    const [dynastyName, setDynastyName] = useState('')
    const [coachName, setCoachName] = useState('')
    const [currentYear, setCurrentYear] = useState(INITIAL_YEAR)
    const [conference, setConference] = useState('')
    const [teamId, setTeamId] = useState('')
    const [almaMater, setAlmaMater] = useState('')
    const [pipeline, setPipeline] = useState('')
    const [rosterEntries, setRosterEntries] = useState<RosterEntry[]>(() => createBlankRosterEntries(INITIAL_ROSTER_ROWS))
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const conferences = useMemo(
        () => [...new Set(fbsTeams.map((team) => team.conference))].sort((a, b) => a.localeCompare(b)),
        []
    )

    const teamsByConference = useMemo(
        () => conferences.map((conf) => ({
            conference: conf,
            teams: fbsTeams.filter((team) => team.conference === conf).sort((a, b) => a.name.localeCompare(b.name)),
        })),
        [conferences]
    )

    const filteredTeams = useMemo(
        () => teamsByConference.find((group) => group.conference === conference)?.teams ?? [],
        [conference, teamsByConference]
    )

    const selectedTeam = useMemo(
        () => filteredTeams.find((team) => team.id === teamId) ?? null,
        [filteredTeams, teamId]
    )

    const conferenceLogo = conference ? conferenceLogoByName[conference] ?? null : null
    const schoolLogoCandidates = selectedTeam ? getTeamLogoCandidates(selectedTeam) : []

    const preparedRosterEntries = useMemo<PreparedRosterEntry[]>(() => {
        return rosterEntries.flatMap((entry) => {
            const name = entry.name.trim()

            if (!name) {
                return []
            }

            return [{
                id: entry.id,
                name,
                position: entry.position,
                rating: parseOptionalNumber(entry.rating),
                year: entry.year || null,
                jerseyNumber: parseOptionalNumber(entry.jerseyNumber),
                devTrait: entry.devTrait || null,
            }]
        })
    }, [rosterEntries])

    const namedRosterCount = preparedRosterEntries.length
    const rosterEntriesMissingPosition = preparedRosterEntries.filter((entry) => !entry.position)

    const groupedRosterEntries = useMemo(() => {
        const grouped = new Map<string, PreparedRosterEntry[]>()

        preparedRosterEntries.forEach((entry) => {
            const key = entry.position || 'Unassigned'
            const existing = grouped.get(key) ?? []
            existing.push(entry)
            grouped.set(key, existing)
        })

        return Array.from(grouped.entries())
            .sort(([a], [b]) => {
                const aIndex = positions.indexOf(a as (typeof positions)[number])
                const bIndex = positions.indexOf(b as (typeof positions)[number])
                const safeA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex
                const safeB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex

                return safeA - safeB || a.localeCompare(b)
            })
            .map(([position, players]) => ({
                position,
                players: [...players].sort((a, b) => a.name.localeCompare(b.name)),
            }))
    }, [preparedRosterEntries])

    const summarySchoolName = selectedTeam
        ? [selectedTeam.name, selectedTeam.nickName].filter(Boolean).join(' ')
        : 'No school selected'
    const summaryConferenceName = selectedTeam?.conference ?? conference

    const updateRosterEntry = (id: string, field: keyof Omit<RosterEntry, 'id'>, value: string) => {
        setRosterEntries((currentEntries) => currentEntries.map((entry) => (
            entry.id === id ? { ...entry, [field]: value } : entry
        )))
    }

    const addRosterRows = (count: number) => {
        setRosterEntries((currentEntries) => [...currentEntries, ...createBlankRosterEntries(count)])
    }

    const removeRosterEntry = (id: string) => {
        setRosterEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== id))
    }

    const importRosterFromTemplate = async () => {
        if (!selectedTeam) return

        setIsImporting(true)
        setError(null)
        try {
            const templates = await RosterTemplateService.getBySchool(selectedTeam.name)

            if (templates.length === 0) {
                setError(`No roster data found for ${selectedTeam.name}. You can add players manually.`)
                return
            }

            const imported: RosterEntry[] = templates.map((template) => {
                rosterEntryCounter += 1
                return {
                    id: `roster-entry-${rosterEntryCounter}`,
                    name: template.name,
                    position: template.position,
                    rating: template.overall?.toString() ?? '',
                    year: normalizeYear(template.year, template.redshirt_status) ?? '',
                    jerseyNumber: '',
                    devTrait: template.dev_trait ?? 'Normal',
                }
            })

            setRosterEntries(imported)
        } catch (err) {
            console.error('Failed to import roster:', err)
            setError('Failed to load roster data. Try again or add players manually.')
        } finally {
            setIsImporting(false)
        }
    }

    const validateStepOne = () => {
        if (!dynastyName.trim() || !coachName.trim()) {
            setError('Dynasty name and coach name are required.')
            return false
        }

        if (!selectedTeam) {
            setError('Select a conference and team before continuing.')
            return false
        }

        setError(null)
        return true
    }

    const goToNextStep = () => {
        if (currentStep === 0 && !validateStepOne()) {
            return
        }

        setError(null)
        setCurrentStep((step) => Math.min(step + 1, 2) as WizardStep)
    }

    const goToPreviousStep = () => {
        setError(null)
        setCurrentStep((step) => Math.max(step - 1, 0) as WizardStep)
    }

    const handleCreateDynasty = async () => {
        if (!validateStepOne()) {
            setCurrentStep(0)
            return
        }

        if (rosterEntriesMissingPosition.length > 0) {
            setError('Each roster row with a player name also needs a position before you create the dynasty.')
            setCurrentStep(1)
            return
        }

        if (!selectedTeam) {
            setError('Select a conference and team before creating a dynasty.')
            setCurrentStep(0)
            return
        }

        setError(null)
        setIsSubmitting(true)

        try {
            const dynasty = await DynastyService.createDynasty({
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
                secondaryColor: selectedTeam.colors.secondary,
                accentColor: selectedTeam.colors.accent ?? null,
            })

            if (!dynasty?.id) {
                throw new Error('Dynasty created, but no dynasty ID was returned.')
            }

            const yr = await YearRecordService.getCurrentYearRecord(dynasty.id)

            if (!yr?.id) {
                throw new Error('Dynasty created, but the initial year record could not be loaded.')
            }

            const playersToCreate = preparedRosterEntries.filter((entry) => entry.position)

            const creationResults = await Promise.allSettled(
                playersToCreate.map((entry) => (
                    PlayerService.createPlayer(
                        {
                            dynasty_id: dynasty.id,
                            name: entry.name,
                            position: entry.position,
                        },
                        {
                            year_record_id: yr.id,
                            dynasty_id: dynasty.id,
                            year: entry.year || null,
                            rating: entry.rating,
                            jersey_number: entry.jerseyNumber,
                            dev_trait: entry.devTrait || null,
                        }
                    ).then((player) => {
                        if (!player) {
                            throw new Error('Player creation returned no record.')
                        }

                        return player
                    })
                ))
            )

            creationResults.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.error(`Failed to create roster player \"${playersToCreate[index]?.name}\":`, result.reason)
                }
            })

            router.push('/dashboard')
            router.refresh()
        } catch (submitError: unknown) {
            console.error('Create dynasty error:', submitError)
            setError(getErrorMessage(submitError))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (currentStep < 2) {
            goToNextStep()
            return
        }

        await handleCreateDynasty()
    }

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardContent className="space-y-6 p-8">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {WIZARD_STEPS.map((stepLabel, index) => {
                            const stepStatus = index === currentStep
                                ? 'active'
                                : index < currentStep
                                    ? 'complete'
                                    : 'upcoming'

                            return (
                                <div key={stepLabel} className="flex min-w-0 flex-1 items-center gap-2">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div
                                            className={[
                                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                                                stepStatus === 'active' && 'bg-primary text-white',
                                                stepStatus === 'complete' && 'bg-primary/20 text-primary',
                                                stepStatus === 'upcoming' && 'bg-primary/5 text-text/50',
                                            ].filter(Boolean).join(' ')}
                                        >
                                            {index + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-xs text-text/60 sm:text-sm">{index + 1}. {stepLabel}</p>
                                        </div>
                                    </div>
                                    {index < WIZARD_STEPS.length - 1 && (
                                        <div className={[
                                            'hidden h-px flex-1 sm:block',
                                            index < currentStep ? 'bg-primary/30' : 'bg-primary/10',
                                        ].join(' ')} />
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {currentStep === 0 && (
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
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-text">Step 2 · Initial Roster Builder</h2>
                                    <p className="text-sm text-text/70">Add as many starter rows as you want. Blank-name rows are ignored when you create the dynasty.</p>
                                </div>
                                <div className="text-sm font-medium text-text">
                                    {namedRosterCount} players added
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button type="button" variant="outline" size="sm" className="font-semibold" onClick={() => addRosterRows(5)}>
                                    Add Row
                                </Button>
                                <Button type="button" variant="outline" size="sm" className="font-semibold" onClick={() => addRosterRows(10)}>
                                    Add 10 Rows
                                </Button>
                                {selectedTeam && (
                                    <Button
                                        type="button"
                                        bg="var(--primary)"
                                        text="white"
                                        size="sm"
                                        className="font-semibold"
                                        onClick={importRosterFromTemplate}
                                        disabled={isImporting}
                                    >
                                        {isImporting ? 'Importing...' : `Import ${selectedTeam.name} Roster`}
                                    </Button>
                                )}
                            </div>

                            <div className="max-h-128 space-y-3 overflow-y-auto pr-1">
                                <div className="sticky top-0 z-10 hidden grid-cols-[minmax(0,2fr)_110px_80px_120px_90px_130px_44px] gap-2 rounded-xl border border-primary/10 bg-background/95 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text/60 backdrop-blur sm:grid">
                                    <span>Name</span>
                                    <span>Position</span>
                                    <span>OVR</span>
                                    <span>Year</span>
                                    <span>Jersey #</span>
                                    <span>Dev Trait</span>
                                    <span className="text-right">Remove</span>
                                </div>

                                {rosterEntries.map((entry, index) => (
                                    <div
                                        key={entry.id}
                                        className="rounded-xl border border-primary/15 bg-background/70 p-3 sm:grid sm:grid-cols-[minmax(0,2fr)_110px_80px_120px_90px_130px_44px] sm:items-end sm:gap-2 sm:rounded-none sm:border-x-0 sm:border-b-0 sm:border-t sm:bg-transparent sm:px-3 sm:py-3"
                                    >
                                        <div className="mb-3 flex items-center justify-between sm:hidden">
                                            <p className="text-sm font-semibold text-text">Player {index + 1}</p>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 px-0 text-text/70"
                                                onClick={() => removeRosterEntry(entry.id)}
                                                aria-label={`Remove player row ${index + 1}`}
                                            >
                                                ×
                                            </Button>
                                        </div>

                                        <div className="grid gap-3 sm:contents">
                                            <div className="space-y-1">
                                                <Label htmlFor={`player-name-${entry.id}`} className="text-xs sm:hidden">Name *</Label>
                                                <Input
                                                    id={`player-name-${entry.id}`}
                                                    value={entry.name}
                                                    onChange={(event) => updateRosterEntry(entry.id, 'name', event.target.value)}
                                                    placeholder="Player name"
                                                    className="h-8 text-sm"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label htmlFor={`player-position-${entry.id}`} className="text-xs sm:hidden">Position *</Label>
                                                <Select
                                                    id={`player-position-${entry.id}`}
                                                    value={entry.position}
                                                    onChange={(event) => updateRosterEntry(entry.id, 'position', event.target.value)}
                                                    className="h-8 text-sm"
                                                >
                                                    <option value="">Select</option>
                                                    <PositionOptions />
                                                </Select>
                                            </div>

                                            <div className="space-y-1">
                                                <Label htmlFor={`player-ovr-${entry.id}`} className="text-xs sm:hidden">OVR</Label>
                                                <Input
                                                    id={`player-ovr-${entry.id}`}
                                                    type="number"
                                                    min={0}
                                                    max={99}
                                                    value={entry.rating}
                                                    onChange={(event) => updateRosterEntry(entry.id, 'rating', event.target.value)}
                                                    className="h-8 text-sm"
                                                    placeholder="0-99"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label htmlFor={`player-year-${entry.id}`} className="text-xs sm:hidden">Year</Label>
                                                <Select
                                                    id={`player-year-${entry.id}`}
                                                    value={entry.year}
                                                    onChange={(event) => updateRosterEntry(entry.id, 'year', event.target.value)}
                                                    className="h-8 text-sm"
                                                >
                                                    <option value="">Select</option>
                                                    {ROSTER_YEAR_ORDER.filter((year) => VALID_ROSTER_YEARS.has(year)).map((year) => (
                                                        <option key={year} value={year}>{year}</option>
                                                    ))}
                                                </Select>
                                            </div>

                                            <div className="space-y-1">
                                                <Label htmlFor={`player-jersey-${entry.id}`} className="text-xs sm:hidden">Jersey #</Label>
                                                <Input
                                                    id={`player-jersey-${entry.id}`}
                                                    type="number"
                                                    min={0}
                                                    max={99}
                                                    value={entry.jerseyNumber}
                                                    onChange={(event) => updateRosterEntry(entry.id, 'jerseyNumber', event.target.value)}
                                                    className="h-8 text-sm"
                                                    placeholder="#"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label htmlFor={`player-dev-${entry.id}`} className="text-xs sm:hidden">Dev Trait</Label>
                                                <Select
                                                    id={`player-dev-${entry.id}`}
                                                    value={entry.devTrait}
                                                    onChange={(event) => updateRosterEntry(entry.id, 'devTrait', event.target.value)}
                                                    className="h-8 text-sm"
                                                >
                                                    {ROSTER_DEV_TRAITS.map((trait) => (
                                                        <option key={trait} value={trait}>{trait}</option>
                                                    ))}
                                                </Select>
                                            </div>

                                            <div className="hidden justify-end sm:flex">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 px-0 text-text/70"
                                                    onClick={() => removeRosterEntry(entry.id)}
                                                    aria-label={`Remove player row ${index + 1}`}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-text">Step 3 · Review &amp; Create</h2>
                                <p className="text-sm text-text/70">Confirm your dynasty details and optional roster import.</p>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                                <div className="space-y-4 rounded-xl border border-primary/15 bg-background/70 p-4">
                                    <div className="flex items-center gap-4">
                                        <LogoImage candidates={schoolLogoCandidates} alt={selectedTeam?.name ?? 'School logo'} size={56} />
                                        <div className="space-y-1 text-sm">
                                            <p className="text-xs uppercase tracking-wide text-text/50">School</p>
                                            <p className="font-semibold text-text">{summarySchoolName}</p>
                                            <p className="text-text/70">{summaryConferenceName || 'Conference TBD'}</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-text/50">Dynasty Name</p>
                                            <p className="font-medium text-text">{dynastyName.trim() || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-text/50">Coach</p>
                                            <p className="font-medium text-text">{coachName.trim() || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-text/50">Starting Year</p>
                                            <p className="font-medium text-text">{currentYear}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-text/50">Conference</p>
                                            <p className="font-medium text-text">{summaryConferenceName || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-text/50">Pipeline</p>
                                            <p className="font-medium text-text">{pipeline || 'None'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-text/50">Alma Mater</p>
                                            <p className="font-medium text-text">{almaMater || 'None'}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-text/50">Roster Count</p>
                                        <p className="font-semibold text-text">{namedRosterCount} players will be created</p>
                                        <p className="text-sm text-text/60">Blank roster rows are ignored.</p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-primary/15 bg-background/70 p-4">
                                    <div className="mb-4 flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-text">Roster Review</p>
                                            <p className="text-sm text-text/60">Players are grouped by position.</p>
                                        </div>
                                        {rosterEntriesMissingPosition.length > 0 && (
                                            <p className="max-w-xs text-right text-sm text-amber-600">
                                                {rosterEntriesMissingPosition.length} named player{rosterEntriesMissingPosition.length === 1 ? '' : 's'} still need a position.
                                            </p>
                                        )}
                                    </div>

                                    {groupedRosterEntries.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-primary/20 px-4 py-8 text-center text-sm text-text/60">
                                            No roster players added. You can still create the dynasty now.
                                        </div>
                                    ) : (
                                        <div className="max-h-112 space-y-4 overflow-y-auto pr-1">
                                            {groupedRosterEntries.map((group) => (
                                                <div key={group.position} className="space-y-2">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h3 className="text-sm font-semibold text-text">{group.position}</h3>
                                                        <span className="text-xs text-text/50">{group.players.length} player{group.players.length === 1 ? '' : 's'}</span>
                                                    </div>
                                                    <div className="space-y-2 rounded-lg border border-primary/10 bg-background/60 p-3">
                                                        {group.players.map((player) => (
                                                            <div key={player.id} className="flex flex-wrap items-center justify-between gap-2 text-sm text-text">
                                                                <span className="font-medium">{player.name}</span>
                                                                <span className="text-text/65">
                                                                    OVR {player.rating ?? '—'} · {player.year ?? '—'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && <p className="text-sm text-red-500">{error}</p>}
                </CardContent>

                <CardFooter className="flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        {currentStep > 0 && (
                            <Button
                                type="button"
                                variant="cancel"
                                onClick={goToPreviousStep}
                                disabled={isSubmitting}
                            >
                                Back
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="cancel"
                            onClick={() => router.push('/dashboard')}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    </div>

                    {currentStep < 2 ? (
                        <Button type="submit" variant="save" className="w-full font-bold sm:w-auto" disabled={isSubmitting}>
                            Next
                        </Button>
                    ) : (
                        <Button type="submit" variant="save" className="w-full font-bold sm:w-auto" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Dynasty'}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </form>
    )
}
