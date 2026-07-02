import { Button } from '@/components/ui/display/button'
import { Input } from '@/components/ui/form/input'
import { Label } from '@/components/ui/form/label'
import { PositionOptions } from '@/components/ui/form/position-options'
import { Select } from '@/components/ui/form/select'
import { Modal } from '@/components/ui/layout/modal'
import type { PlayerDraft, RosterEntryField } from './types'
import { clampNumberString, ROSTER_DEV_TRAITS, ROSTER_YEAR_ORDER, syncRedshirtYear, VALID_ROSTER_YEARS } from './utils'

interface PlayerEditModalProps {
    isOpen: boolean
    editingPlayerId: string | null
    playerDraft: PlayerDraft
    onUpdateDraft: <K extends RosterEntryField>(field: K, value: PlayerDraft[K]) => void
    onSave: () => void
    onClose: () => void
}

export function PlayerEditModal({
    isOpen,
    editingPlayerId,
    playerDraft,
    onUpdateDraft,
    onSave,
    onClose,
}: PlayerEditModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editingPlayerId ? `Edit ${playerDraft.name || 'Player'}` : 'Add Player'}
            maxWidth="max-w-2xl"
        >
            <div
                className="space-y-4"
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault()
                    }
                }}
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="roster-player-name">Name</Label>
                        <Input
                            id="roster-player-name"
                            value={playerDraft.name}
                            onChange={(event) => onUpdateDraft('name', event.target.value)}
                            placeholder="Player name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="roster-player-position">Position</Label>
                        <Select
                            id="roster-player-position"
                            value={playerDraft.position}
                            onChange={(event) => onUpdateDraft('position', event.target.value)}
                        >
                            <option value="">Select position</option>
                            <PositionOptions />
                            <option value="ATH">ATH</option>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="roster-player-year">Year</Label>
                        <Select
                            id="roster-player-year"
                            value={playerDraft.year}
                            onChange={(event) => {
                                const year = event.target.value
                                onUpdateDraft('year', year)
                                onUpdateDraft('isRedshirted', year.includes('(RS)'))
                            }}
                        >
                            <option value="">Select year</option>
                            {ROSTER_YEAR_ORDER.filter((year) => VALID_ROSTER_YEARS.has(year)).map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="roster-player-height">Height</Label>
                        <Input
                            id="roster-player-height"
                            value={playerDraft.height}
                            onChange={(event) => onUpdateDraft('height', event.target.value)}
                            placeholder={`6'2"`}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="roster-player-weight">Weight</Label>
                        <Input
                            id="roster-player-weight"
                            type="number"
                            min={100}
                            max={400}
                            value={playerDraft.weight}
                            onChange={(event) => onUpdateDraft('weight', event.target.value)}
                            placeholder="lbs"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="roster-player-jersey">Jersey Number</Label>
                        <Input
                            id="roster-player-jersey"
                            type="number"
                            min={0}
                            max={99}
                            value={playerDraft.jerseyNumber}
                            onChange={(event) => onUpdateDraft('jerseyNumber', clampNumberString(event.target.value, 0, 99))}
                            placeholder="0-99"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="roster-player-rating">OVR</Label>
                        <Input
                            id="roster-player-rating"
                            type="number"
                            min={0}
                            max={99}
                            value={playerDraft.rating}
                            onChange={(event) => onUpdateDraft('rating', clampNumberString(event.target.value, 0, 99))}
                            placeholder="0-99"
                        />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="roster-player-dev-trait">Dev Trait</Label>
                        <Select
                            id="roster-player-dev-trait"
                            value={playerDraft.devTrait}
                            onChange={(event) => onUpdateDraft('devTrait', event.target.value)}
                        >
                            {ROSTER_DEV_TRAITS.map((trait) => (
                                <option key={trait} value={trait}>{trait}</option>
                            ))}
                        </Select>
                    </div>

                    <div className="sm:col-span-2">
                        <div className="flex items-center justify-between rounded-lg border border-primary/10 bg-background/60 px-3 py-2">
                            <div>
                                <Label htmlFor="roster-player-redshirt" className="text-sm">Redshirt</Label>
                                <p className="text-xs text-text/55">Toggle whether this player starts the dynasty as redshirted.</p>
                            </div>
                            <input
                                id="roster-player-redshirt"
                                type="checkbox"
                                checked={playerDraft.isRedshirted}
                                onChange={(event) => {
                                    const isRedshirted = event.target.checked
                                    onUpdateDraft('isRedshirted', isRedshirted)
                                    onUpdateDraft('year', syncRedshirtYear(playerDraft.year, isRedshirted))
                                }}
                                className="h-4 w-4 rounded border-primary/20 text-primary focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="save"
                        size="sm"
                        onClick={onSave}
                        disabled={!playerDraft.name.trim() || !playerDraft.position}
                        className="text-xs font-semibold"
                    >
                        {editingPlayerId ? 'Save Changes' : 'Add Player'}
                    </Button>
                    <Button type="button" variant="cancel" size="sm" onClick={onClose} className="text-xs">
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
