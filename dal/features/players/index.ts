// dal/features/players/index.ts

import { supabase } from '@/supabase/client'
import type { Recruit } from '@/dal/features/recruits'
import type { Transfer } from '@/dal/features/transfers'

// Player identity (permanent, never duplicated)
export interface Player {
    id: string
    dynasty_id: string
    name: string
    position: string
    height: string | null
    weight: number | null
    avatar_url: string | null
}

// Per-season snapshot
export interface PlayerSeason {
    id: string
    player_id: string
    year_record_id: string
    dynasty_id: string
    year: string | null
    rating: number | null
    jersey_number: number | null
    is_redshirted: boolean
    notes: string | null
    honors: string[]
    dev_trait: string | null
}

export interface CareerSeason extends PlayerSeason {
    record_year: number | null
}

// Combined view for roster display
export interface RosterPlayer extends Player {
    season: PlayerSeason
}

export type PlayerOrigin =
    | { type: 'recruit'; data: Recruit }
    | { type: 'transfer'; data: Transfer }

export interface CreatePlayerInput {
    dynasty_id: string
    name: string
    position: string
    height?: string | null
    weight?: number | null
    avatar_url?: string | null
}

export interface CreatePlayerSeasonInput {
    player_id: string
    year_record_id: string
    dynasty_id: string
    year?: string | null
    rating?: number | null
    jersey_number?: number | null
    is_redshirted?: boolean
    notes?: string | null
    dev_trait?: string | null
}

export const PlayerService = {
    // Get full roster for a season (player identity + season snapshot)
    async getRoster(dynastyId: string, yearRecordId: string): Promise<RosterPlayer[]> {
        const { data, error } = await supabase.from('player_seasons').select('*, players!inner(*)').eq('dynasty_id', dynastyId).eq('year_record_id', yearRecordId).order('player_id')

        if (error) {
            console.error('Get roster error:', error.message)
            return []
        }

        return (data ?? []).map((row: Record<string, unknown>) => {
            const player = row.players as Player
            const season: PlayerSeason = {
                id: row.id as string,
                player_id: row.player_id as string,
                year_record_id: row.year_record_id as string,
                dynasty_id: row.dynasty_id as string,
                year: row.year as string | null,
                rating: row.rating as number | null,
                jersey_number: row.jersey_number as number | null,
                is_redshirted: row.is_redshirted as boolean,
                notes: row.notes as string | null,
                honors: (row.honors as string[] | null) ?? [],
                dev_trait: row.dev_trait as string | null,
            }
            return { ...player, season }
        }).sort((a, b) => a.position.localeCompare(b.position) || a.name.localeCompare(b.name))
    },

    // Create a new player identity + their first season entry
    async createPlayer(input: CreatePlayerInput, seasonInput: Omit<CreatePlayerSeasonInput, 'player_id'>): Promise<RosterPlayer | null> {
        // Insert player identity
        const { data: player, error: pErr } = await supabase.from('players').insert({
            dynasty_id: input.dynasty_id,
            name: input.name,
            position: input.position,
            height: input.height ?? null,
            weight: input.weight ?? null,
            avatar_url: input.avatar_url ?? null,
        }).select().single()

        if (pErr || !player) {
            console.error('Create player error:', pErr?.message)
            return null
        }

        // Insert season entry
        const { data: season, error: sErr } = await supabase.from('player_seasons').insert({
            player_id: player.id,
            year_record_id: seasonInput.year_record_id,
            dynasty_id: seasonInput.dynasty_id,
            year: seasonInput.year ?? null,
            rating: seasonInput.rating ?? null,
            jersey_number: seasonInput.jersey_number ?? null,
            is_redshirted: seasonInput.is_redshirted ?? false,
            notes: seasonInput.notes ?? null,
            dev_trait: seasonInput.dev_trait ?? null,
        }).select().single()

        if (sErr || !season) {
            console.error('Create player season error:', sErr?.message)
            return null
        }

        return { ...(player as Player), season: season as PlayerSeason }
    },

    // Update player identity fields
    async updatePlayer(id: string, updates: Partial<CreatePlayerInput>): Promise<void> {
        const { error } = await supabase.from('players').update(updates).eq('id', id)
        if (error) throw error
    },

    async getPlayer(playerId: string): Promise<Player | null> {
        const { data, error } = await supabase.from('players').select('*').eq('id', playerId).maybeSingle()

        if (error) {
            console.error('Get player error:', error.message)
            return null
        }

        return data as Player | null
    },

    // Update season-specific fields
    async updatePlayerSeason(seasonId: string, updates: Partial<Omit<PlayerSeason, 'id' | 'player_id' | 'year_record_id' | 'dynasty_id'>>): Promise<void> {
        const { error } = await supabase.from('player_seasons').update(updates).eq('id', seasonId)
        if (error) throw error
    },

    // Delete player entirely (cascades to all seasons + stats)
    async deletePlayer(id: string): Promise<void> {
        const { error } = await supabase.from('players').delete().eq('id', id)
        if (error) throw error
    },

    // Get a player's career (all seasons)
    async getPlayerCareer(playerId: string): Promise<CareerSeason[]> {
        const { data, error } = await supabase.from('player_seasons').select('*, year_records!inner(year)').eq('player_id', playerId).order('year_record_id')

        if (error) {
            console.error('Get player career error:', error.message)
            return []
        }

        return (data ?? []).map((row: Record<string, unknown>) => {
            const yearRecord = row.year_records as { year?: number | null } | { year?: number | null }[] | undefined
            const recordYear = Array.isArray(yearRecord) ? yearRecord[0]?.year : yearRecord?.year

            return {
                id: row.id as string,
                player_id: row.player_id as string,
                year_record_id: row.year_record_id as string,
                dynasty_id: row.dynasty_id as string,
                year: row.year as string | null,
                rating: row.rating as number | null,
                jersey_number: row.jersey_number as number | null,
                is_redshirted: row.is_redshirted as boolean,
                notes: row.notes as string | null,
                honors: (row.honors as string[] | null) ?? [],
                dev_trait: row.dev_trait as string | null,
                record_year: recordYear ?? null,
            }
        }).sort((a, b) => (a.record_year ?? 0) - (b.record_year ?? 0))
    },

    async getPlayerOrigin(dynastyId: string, playerName: string): Promise<PlayerOrigin | null> {
        const { data: recruit, error: recruitError } = await supabase.from('recruits').select('*').eq('dynasty_id', dynastyId).eq('name', playerName).limit(1).maybeSingle()

        if (recruitError) {
            console.error('Get player recruit origin error:', recruitError.message)
        } else if (recruit) {
            return { type: 'recruit', data: recruit as Recruit }
        }

        const { data: transfer, error: transferError } = await supabase.from('transfers').select('*').eq('dynasty_id', dynastyId).eq('player_name', playerName).limit(1).maybeSingle()

        if (transferError) {
            console.error('Get player transfer origin error:', transferError.message)
            return null
        }

        if (transfer) {
            return { type: 'transfer', data: transfer as Transfer }
        }

        return null
    },
}
