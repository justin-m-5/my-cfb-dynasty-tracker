// dal/features/recruits/index.ts

import { supabase } from '@/supabase/client'

export interface Recruit {
    id: string
    dynasty_id: string
    year_record_id: string
    name: string
    position: string
    stars: number | null
    dev_trait: string | null
    state: string | null
    national_rank: number | null
    state_rank: number | null
    position_rank: number | null
    height: string | null
    weight: number | null
}

export const RecruitService = {
    async getRecruits(dynastyId: string, yearRecordId: string): Promise<Recruit[]> {
        const { data, error } = await supabase.from('recruits').select('*').eq('dynasty_id', dynastyId).eq('year_record_id', yearRecordId).order('stars', { ascending: false, nullsFirst: false }).order('national_rank', { ascending: true, nullsFirst: true })

        if (error) {
            console.error('Get recruits error:', error.message)
            return []
        }

        return (data ?? []) as Recruit[]
    },

    async createRecruit(recruit: Omit<Recruit, 'id'>): Promise<Recruit | null> {
        const { data, error } = await supabase.from('recruits').insert(recruit).select().single()

        if (error) {
            console.error('Create recruit error:', error.message)
            return null
        }

        return data as Recruit
    },

    async updateRecruit(id: string, updates: Partial<Recruit>): Promise<void> {
        const { error } = await supabase.from('recruits').update(updates).eq('id', id)

        if (error) throw error
    },

    async deleteRecruit(id: string): Promise<void> {
        const { error } = await supabase.from('recruits').delete().eq('id', id)

        if (error) throw error
    },
}
