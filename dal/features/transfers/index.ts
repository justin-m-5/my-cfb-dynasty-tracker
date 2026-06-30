// dal/features/transfers/index.ts

import { supabase } from '@/supabase/client'

export interface Transfer {
    id: string
    dynasty_id: string
    year_record_id: string
    player_name: string
    position: string
    stars: number | null
    transfer_direction: 'From' | 'To'
    school: string
    dev_trait: string | null
    height: string | null
    weight: number | null
}

export const TransferService = {
    async getTransfers(dynastyId: string, yearRecordId: string): Promise<Transfer[]> {
        const { data, error } = await supabase.from('transfers').select('*').eq('dynasty_id', dynastyId).eq('year_record_id', yearRecordId).order('stars', { ascending: false, nullsFirst: false }).order('player_name', { ascending: true })

        if (error) {
            console.error('Get transfers error:', error.message)
            return []
        }

        return (data ?? []) as Transfer[]
    },

    async createTransfer(transfer: Omit<Transfer, 'id'>): Promise<Transfer | null> {
        const { data, error } = await supabase.from('transfers').insert(transfer).select().single()

        if (error) {
            console.error('Create transfer error:', error.message)
            return null
        }

        return data as Transfer
    },

    async updateTransfer(id: string, updates: Partial<Transfer>): Promise<void> {
        const { error } = await supabase.from('transfers').update(updates).eq('id', id)

        if (error) throw error
    },

    async deleteTransfer(id: string): Promise<void> {
        const { error } = await supabase.from('transfers').delete().eq('id', id)

        if (error) throw error
    },
}
