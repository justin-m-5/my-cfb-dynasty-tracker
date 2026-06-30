// dal/features/awards/index.ts

import { supabase } from '@/supabase/client'

export interface Award {
    id: string
    dynasty_id: string
    year_record_id: string
    player_id: string
    player_name: string
    award_name: string
    team: string | null
    year: number
}

export type CreateAwardInput = Omit<Award, 'id'>

export const AwardService = {
    async getAwards(dynastyId: string, yearRecordId: string): Promise<Award[]> {
        const { data, error } = await supabase.from('awards').select('*').eq('dynasty_id', dynastyId).eq('year_record_id', yearRecordId).order('award_name')

        if (error) {
            console.error('Get awards error:', error.message)
            return []
        }
        return (data ?? []) as Award[]
    },

    async getAwardsByPlayer(dynastyId: string, playerId: string): Promise<Award[]> {
        const { data, error } = await supabase.from('awards').select('*').eq('dynasty_id', dynastyId).eq('player_id', playerId).order('year', { ascending: false })

        if (error) {
            console.error('Get awards by player error:', error.message)
            return []
        }
        return (data ?? []) as Award[]
    },

    async createAward(input: CreateAwardInput): Promise<Award | null> {
        const { data, error } = await supabase.from('awards').insert(input).select().single()

        if (error) {
            console.error('Create award error:', error.message)
            return null
        }
        return data as Award
    },

    async updateAward(id: string, updates: Partial<CreateAwardInput>): Promise<Award | null> {
        const { data, error } = await supabase.from('awards').update(updates).eq('id', id).select().single()

        if (error) {
            console.error('Update award error:', error.message)
            return null
        }
        return data as Award
    },

    async deleteAward(id: string): Promise<boolean> {
        const { error } = await supabase.from('awards').delete().eq('id', id)

        if (error) {
            console.error('Delete award error:', error.message)
            return false
        }
        return true
    },
}
