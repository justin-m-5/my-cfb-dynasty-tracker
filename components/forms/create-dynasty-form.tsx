'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useMemo, useState } from 'react'

import { Button } from '@/components/ui/display/button'
import { Card, CardContent, CardFooter } from '@/components/ui/layout/card'
import { DynastyService } from '@/dal/features/dynasty'
import { PlayerService } from '@/dal/features/players'
import { RosterTemplateService, normalizeYear } from '@/dal/features/roster-templates'
import { YearRecordService } from '@/dal/features/year-records'
import { positions } from '@/lib/config/player-config'
import { conferenceLogoByName } from '@/lib/teams/logos'
import { fbsTeams } from '@/lib/teams/fbs-teams'

import { DynastyInfoStep } from './create-dynasty-form/dynasty-info-step'
import { PlayerEditModal } from './create-dynasty-form/player-edit-modal'
import { ReviewStep } from './create-dynasty-form/review-step'
import { RosterStep } from './create-dynasty-form/roster-step'
import type { PlayerDraft, PreparedRosterEntry, RosterEntry, RosterEntryField, RosterPositionGroup, WizardStep } from './create-dynasty-form/types'
import {
    createBlankRosterEntry,
    createRosterEntryDraft,
    clampNumberString,
    getErrorMessage,
    getRosterGroupForPosition,
    getTeamLogoCandidates,
    INITIAL_SELECTED_GROUP,
    INITIAL_SELECTED_POSITION,
    INITIAL_YEAR,
    parseOptionalNumber,
    syncRedshirtYear,
    WIZARD_STEPS,
} from './create-dynasty-form/utils'

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
    const [rosterEntries, setRosterEntries] = useState<RosterEntry[]>([])
    const [selectedGroup, setSelectedGroup] = useState<RosterPositionGroup>(INITIAL_SELECTED_GROUP)
    const [selectedPosition, setSelectedPosition] = useState<string>(INITIAL_SELECTED_POSITION)
    const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false)
    const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null)
    const [playerDraft, setPlayerDraft] = useState<PlayerDraft>(() => createRosterEntryDraft({ position: INITIAL_SELECTED_POSITION }))
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
                height: entry.height.trim() || null,
                weight: parseOptionalNumber(entry.weight),
                isRedshirted: entry.isRedshirted,
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

    const updatePlayerDraft = <K extends RosterEntryField>(field: K, value: PlayerDraft[K]) => {
        setPlayerDraft((currentDraft) => ({ ...currentDraft, [field]: value } as PlayerDraft))
    }

    const openAddPlayerModal = () => {
        setEditingPlayerId(null)
        setPlayerDraft(createRosterEntryDraft({ position: selectedPosition }))
        setIsPlayerModalOpen(true)
        setError(null)
    }

    const openEditPlayerModal = (entry: RosterEntry) => {
        setEditingPlayerId(entry.id)
        setPlayerDraft({
            name: entry.name,
            position: entry.position,
            rating: entry.rating,
            year: entry.year,
            jerseyNumber: entry.jerseyNumber,
            devTrait: entry.devTrait,
            height: entry.height,
            weight: entry.weight,
            isRedshirted: entry.isRedshirted,
        })
        setIsPlayerModalOpen(true)
        setError(null)
    }

    const closePlayerModal = () => {
        setEditingPlayerId(null)
        setPlayerDraft(createRosterEntryDraft())
        setIsPlayerModalOpen(false)
        setError(null)
    }

    const savePlayerDraft = () => {
        const trimmedName = playerDraft.name.trim()

        if (!trimmedName) {
            setError('Player name is required before saving.')
            return
        }

        if (!playerDraft.position) {
            setError('Choose a position before saving the player.')
            return
        }

        const normalizedEntry: PlayerDraft = {
            ...playerDraft,
            name: trimmedName,
            rating: clampNumberString(playerDraft.rating, 0, 99),
            jerseyNumber: clampNumberString(playerDraft.jerseyNumber, 0, 99),
            height: playerDraft.height.trim(),
            weight: playerDraft.weight.trim(),
            year: syncRedshirtYear(playerDraft.year, playerDraft.isRedshirted),
        }

        if (editingPlayerId) {
            setRosterEntries((currentEntries) => currentEntries.map((entry) => (
                entry.id === editingPlayerId ? { ...entry, ...normalizedEntry } : entry
            )))
        } else {
            setRosterEntries((currentEntries) => [...currentEntries, createBlankRosterEntry(normalizedEntry)])
        }

        const nextGroup = getRosterGroupForPosition(normalizedEntry.position)
        setSelectedGroup(nextGroup)
        setSelectedPosition(normalizedEntry.position)
        closePlayerModal()
    }

    const removeRosterEntry = (id: string) => {
        setRosterEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== id))

        if (editingPlayerId === id) {
            closePlayerModal()
        }
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
                const normalizedYear = normalizeYear(template.year, template.redshirt_status) ?? ''
                const isRedshirted = normalizedYear.includes('(RS)')
                    || Boolean(template.redshirt_status?.toLowerCase().includes('redshirt'))

                return createBlankRosterEntry({
                    name: template.name,
                    position: template.position,
                    rating: template.overall?.toString() ?? '',
                    year: normalizedYear,
                    jerseyNumber: '',
                    devTrait: template.dev_trait ?? 'Normal',
                    height: template.height ?? '',
                    weight: template.weight?.toString() ?? '',
                    isRedshirted,
                })
            })

            setRosterEntries(imported)

            const firstImportedPosition = imported.find((entry) => entry.position)?.position
            if (firstImportedPosition) {
                setSelectedGroup(getRosterGroupForPosition(firstImportedPosition))
                setSelectedPosition(firstImportedPosition)
            }
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
                            height: entry.height,
                            weight: entry.weight,
                        },
                        {
                            year_record_id: yr.id,
                            dynasty_id: dynasty.id,
                            year: entry.year || null,
                            rating: entry.rating,
                            jersey_number: entry.jerseyNumber,
                            is_redshirted: entry.isRedshirted,
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
                    console.error(`Failed to create roster player "${playersToCreate[index]?.name}":`, result.reason)
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
                        <DynastyInfoStep
                            dynastyName={dynastyName}
                            setDynastyName={setDynastyName}
                            coachName={coachName}
                            setCoachName={setCoachName}
                            currentYear={currentYear}
                            setCurrentYear={setCurrentYear}
                            conference={conference}
                            setConference={(value) => { setConference(value); setTeamId('') }}
                            teamId={teamId}
                            setTeamId={setTeamId}
                            almaMater={almaMater}
                            setAlmaMater={setAlmaMater}
                            pipeline={pipeline}
                            setPipeline={setPipeline}
                            conferences={conferences}
                            teamsByConference={teamsByConference}
                            filteredTeams={filteredTeams}
                            selectedTeam={selectedTeam}
                            conferenceLogo={conferenceLogo}
                            schoolLogoCandidates={schoolLogoCandidates}
                        />
                    )}

                    {currentStep === 1 && (
                        <RosterStep
                            rosterEntries={rosterEntries}
                            selectedTeam={selectedTeam}
                            isImporting={isImporting}
                            namedRosterCount={namedRosterCount}
                            selectedGroup={selectedGroup}
                            setSelectedGroup={setSelectedGroup}
                            selectedPosition={selectedPosition}
                            setSelectedPosition={setSelectedPosition}
                            onImport={importRosterFromTemplate}
                            onAddPlayer={openAddPlayerModal}
                            onEditPlayer={openEditPlayerModal}
                            onRemovePlayer={removeRosterEntry}
                            onUpdateEntry={updateRosterEntry}
                        />
                    )}

                    {currentStep === 2 && (
                        <ReviewStep
                            dynastyName={dynastyName}
                            coachName={coachName}
                            currentYear={currentYear}
                            summarySchoolName={summarySchoolName}
                            summaryConferenceName={summaryConferenceName}
                            pipeline={pipeline}
                            almaMater={almaMater}
                            schoolLogoCandidates={schoolLogoCandidates}
                            namedRosterCount={namedRosterCount}
                            rosterEntriesMissingPosition={rosterEntriesMissingPosition}
                            groupedRosterEntries={groupedRosterEntries}
                        />
                    )}

                    <PlayerEditModal
                        isOpen={isPlayerModalOpen}
                        editingPlayerId={editingPlayerId}
                        playerDraft={playerDraft}
                        onUpdateDraft={updatePlayerDraft}
                        onSave={savePlayerDraft}
                        onClose={closePlayerModal}
                    />

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
