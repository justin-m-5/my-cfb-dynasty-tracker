'use client'

import { useState } from 'react'

import type { DraftedPlayer } from '@/dal/features/drafted-players'
import type { RosterPlayer } from '@/dal/features/players'
import type { Recruit } from '@/dal/features/recruits'
import type { Transfer } from '@/dal/features/transfers'
import { TransferService } from '@/dal/features/transfers'
import { DepthChart } from '@/components/dynasty/depth-chart'
import { TransferForm } from '@/components/forms/transfer-form'
import { Modal } from '@/components/ui/layout/modal'

interface RosterManagementProps {
    roster: RosterPlayer[]
    transfers: Transfer[]
    recruits: Recruit[]
    draftedPlayers: DraftedPlayer[]
    dynastyId: string
    yearRecordId: string
    onRosterUpdate: (updated: RosterPlayer[]) => void
    onTransfersUpdate: (updated: Transfer[]) => void
}

type PendingRosterAction = {
    player: RosterPlayer
    type: 'transfer' | 'cut'
}

export function RosterManagement({
    roster,
    transfers,
    recruits,
    draftedPlayers,
    dynastyId,
    yearRecordId,
    onRosterUpdate,
    onTransfersUpdate,
}: RosterManagementProps) {
    const [pendingAction, setPendingAction] = useState<PendingRosterAction | null>(null)
    const [saving, setSaving] = useState(false)

    const handleTransferSave = async (form: Partial<Transfer>) => {
        setSaving(true)
        try {
            const created = await TransferService.createTransfer({
                dynasty_id: dynastyId,
                year_record_id: yearRecordId,
                player_name: form.player_name ?? '',
                position: form.position ?? '',
                stars: form.stars ?? null,
                transfer_direction: 'To',
                school: form.school ?? '',
                dev_trait: form.dev_trait ?? 'Normal',
                height: form.height ?? null,
                weight: form.weight ?? null,
            })
            if (created) {
                onTransfersUpdate([...transfers, created])
                setPendingAction(null)
            }
        } catch (err) {
            console.error('Failed to create transfer:', err)
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            <DepthChart
                roster={roster}
                mode="advance-season"
                transfers={transfers}
                recruits={recruits}
                draftedPlayers={draftedPlayers}
                onRosterUpdate={onRosterUpdate}
                onTransferOut={(player) => setPendingAction({ player, type: 'transfer' })}
                onCut={(player) => setPendingAction({ player, type: 'cut' })}
            />

            <Modal
                isOpen={!!pendingAction}
                onClose={() => setPendingAction(null)}
                title={`${pendingAction?.type === 'cut' ? 'Cut Player' : 'Transfer Out'}: ${pendingAction?.player.name ?? ''}`}
                maxWidth="max-w-xl"
            >
                {pendingAction && (
                    <TransferForm
                        initial={{
                            player_name: pendingAction.player.name,
                            position: pendingAction.player.position,
                            transfer_direction: 'To',
                            height: pendingAction.player.height,
                            weight: pendingAction.player.weight,
                            dev_trait: pendingAction.player.season.dev_trait ?? 'Normal',
                        }}
                        onSave={handleTransferSave}
                        onCancel={() => setPendingAction(null)}
                        saving={saving}
                        embedded
                    />
                )}
            </Modal>
        </>
    )
}
