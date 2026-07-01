'use client'

import { useState } from 'react'

import type { DraftedPlayer } from '@/dal/features/drafted-players'
import type { RosterPlayer } from '@/dal/features/players'
import type { Recruit } from '@/dal/features/recruits'
import type { Transfer } from '@/dal/features/transfers'
import { TransferService } from '@/dal/features/transfers'
import { DepthChart } from '@/components/dynasty/depth-chart'
import { TransferForm } from '@/components/forms/transfer-form'
import { Modal } from '@/components/ui/modal'

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
    const [transferModalPlayer, setTransferModalPlayer] = useState<RosterPlayer | null>(null)
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
                setTransferModalPlayer(null)
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
                editable
                transfers={transfers}
                recruits={recruits}
                draftedPlayers={draftedPlayers}
                onRosterUpdate={onRosterUpdate}
                onTransferOut={setTransferModalPlayer}
            />

            <Modal
                isOpen={!!transferModalPlayer}
                onClose={() => setTransferModalPlayer(null)}
                title={`Transfer Out: ${transferModalPlayer?.name ?? ''}`}
                maxWidth="max-w-xl"
            >
                {transferModalPlayer && (
                    <TransferForm
                        initial={{
                            player_name: transferModalPlayer.name,
                            position: transferModalPlayer.position,
                            transfer_direction: 'To',
                            height: transferModalPlayer.height,
                            weight: transferModalPlayer.weight,
                            dev_trait: transferModalPlayer.season.dev_trait ?? 'Normal',
                        }}
                        onSave={handleTransferSave}
                        onCancel={() => setTransferModalPlayer(null)}
                        saving={saving}
                        embedded
                    />
                )}
            </Modal>
        </>
    )
}
