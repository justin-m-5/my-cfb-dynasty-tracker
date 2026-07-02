import { LogoImage } from '@/components/ui/display/logo-image'
import type { PreparedRosterEntry } from './types'

interface ReviewStepProps {
    dynastyName: string
    coachName: string
    currentYear: number
    summarySchoolName: string
    summaryConferenceName: string
    pipeline: string
    almaMater: string
    schoolLogoCandidates: string[]
    namedRosterCount: number
    rosterEntriesMissingPosition: PreparedRosterEntry[]
    groupedRosterEntries: Array<{ position: string; players: PreparedRosterEntry[] }>
}

export function ReviewStep({
    dynastyName,
    coachName,
    currentYear,
    summarySchoolName,
    summaryConferenceName,
    pipeline,
    almaMater,
    schoolLogoCandidates,
    namedRosterCount,
    rosterEntriesMissingPosition,
    groupedRosterEntries,
}: ReviewStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-text">Step 3 · Review &amp; Create</h2>
                <p className="text-sm text-text/70">Confirm your dynasty details and optional roster import.</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                <div className="space-y-4 rounded-xl border border-primary/15 bg-background/70 p-4">
                    <div className="flex items-center gap-4">
                        <LogoImage candidates={schoolLogoCandidates} alt={summarySchoolName} size={56} />
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
    )
}
