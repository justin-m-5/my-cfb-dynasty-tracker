// components/dynasty/sections/home/advance-season.tsx

'use client'

import { useState } from 'react'
import { FastForward } from 'lucide-react'
import { DynastyService, type Dynasty } from '@/dal/features/dynasty'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface AdvanceSeasonProps {
    dynasty: Dynasty
    onAdvanced: (newYear: number) => void
}

export function AdvanceSeason({ dynasty, onAdvanced }: AdvanceSeasonProps) {
    const [confirming, setConfirming] = useState(false)
    const [advancing, setAdvancing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleAdvance = async () => {
        setAdvancing(true)
        setError(null)
        try {
            const result = await DynastyService.advanceSeason(dynasty.id)
            if (result) {
                onAdvanced(result.newYear)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to advance season')
        } finally {
            setAdvancing(false)
            setConfirming(false)
        }
    }

    return (
        <Card>
            <CardContent className="py-4">
                <div className="flex flex-col items-center gap-3 text-center">
                    <p className="text-xs text-text/60">
                        Ready to move on? This will finalize {dynasty.current_year} stats and start a new season.
                    </p>

                    {!confirming ? (
                        <Button
                            bg="var(--primary)"
                            text="white"
                            onClick={() => setConfirming(true)}
                            className="flex items-center gap-2 font-semibold"
                        >
                            <FastForward className="h-4 w-4" />
                            Advance to {dynasty.current_year + 1} Season
                        </Button>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-xs font-medium text-amber-600">
                                Are you sure? This will lock the {dynasty.current_year} season.
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    bg="var(--green-600)"
                                    text="white"
                                    size="sm"
                                    onClick={handleAdvance}
                                    disabled={advancing}
                                    className="font-semibold"
                                >
                                    {advancing ? 'Advancing...' : 'Confirm'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setConfirming(false)}
                                    disabled={advancing}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {error && <p className="text-xs text-red-500">{error}</p>}
                </div>
            </CardContent>
        </Card>
    )
}
