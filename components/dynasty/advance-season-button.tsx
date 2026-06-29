// components/dynasty/advance-season-button.tsx

'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { FastForward } from 'lucide-react'
import { DynastyService, type Dynasty } from '@/dal/features/dynasty'
import { Button } from '@/components/ui/button'

interface AdvanceSeasonButtonProps {
    dynastyId: string
}

export function AdvanceSeasonButton({ dynastyId }: AdvanceSeasonButtonProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [dynasty, setDynasty] = useState<Dynasty | null>(null)
    const [confirming, setConfirming] = useState(false)
    const [advancing, setAdvancing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const homePath = `/dashboard/dynasty/${dynastyId}`
    const isHomePath = pathname === homePath || pathname === `${homePath}/`

    useEffect(() => {
        if (isHomePath) {
            DynastyService.getDynastyById(dynastyId).then(setDynasty)
        }
    }, [dynastyId, isHomePath])

    if (!isHomePath || !dynasty) return null

    const handleAdvance = async () => {
        setAdvancing(true)
        setError(null)
        try {
            const result = await DynastyService.advanceSeason(dynasty.id)
            if (result) {
                router.refresh()
                window.location.reload()
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to advance season')
        } finally {
            setAdvancing(false)
            setConfirming(false)
        }
    }

    if (!confirming) {
        return (
            <div className="flex items-center gap-2">
                {error && <span className="text-xs text-red-500">{error}</span>}
                <Button
                    bg="var(--primary)"
                    text="white"
                    size="sm"
                    onClick={() => setConfirming(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold"
                >
                    <FastForward className="h-3.5 w-3.5" />
                    Next Season
                </Button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-amber-600 font-medium">
                Lock {dynasty.current_year} &amp; advance?
            </span>
            <Button
                bg="var(--green-600)"
                text="white"
                size="sm"
                onClick={handleAdvance}
                disabled={advancing}
                className="text-xs font-semibold"
            >
                {advancing ? '...' : 'Confirm'}
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => { setConfirming(false); setError(null) }}
                disabled={advancing}
                className="text-xs"
            >
                Cancel
            </Button>
        </div>
    )
}
