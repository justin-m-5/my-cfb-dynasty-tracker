// dal/features/year-records/index.ts

import { supabase } from '@/supabase/client'

export interface YearRecord {
    id: string
    dynasty_id: string
    year: number
    overall_record: string
    conference_record: string
    bowl_game: string
    bowl_result: string
    points_for: string
    points_against: string
    nat_champ: string
    heisman: string
    recruiting_class_placement: string
    final_ranking: string
    conference_finish: string
    season_stats: Record<string, unknown> | null
}

export const YearRecordService = {
    async getCurrentYearRecord(dynastyId: string): Promise<YearRecord | null> {
        const { data: dynasty } = await supabase
            .from('dynasties')
            .select('current_year')
            .eq('id', dynastyId)
            .single()

        if (!dynasty) return null

        const { data, error } = await supabase
            .from('year_records')
            .select('*')
            .eq('dynasty_id', dynastyId)
            .eq('year', dynasty.current_year)
            .maybeSingle()

        if (error) {
            console.error('Get year record error:', error.message)
            return null
        }

        return data as YearRecord | null
    },

    async getYearRecords(dynastyId: string): Promise<YearRecord[]> {
        const { data, error } = await supabase
            .from('year_records')
            .select('*')
            .eq('dynasty_id', dynastyId)
            .order('year', { ascending: false })

        if (error) {
            console.error('Get year records error:', error.message)
            return []
        }

        return (data ?? []) as YearRecord[]
    },

    async createYearRecord(dynastyId: string, year: number): Promise<YearRecord | null> {
        const { data, error } = await supabase
            .from('year_records')
            .insert({ dynasty_id: dynastyId, year })
            .select()
            .single()

        if (error) {
            console.error('Create year record error:', error.message)
            return null
        }

        return data as YearRecord
    },
}
