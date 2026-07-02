// dal/features/player-stats/index.ts

import { supabase } from '@/supabase/client'

export interface PlayerStat {
    id: string
    player_id: string
    game_id: string
    attempts: number
    completions: number
    pass_yards: number
    pass_td: number
    pass_int: number
    long: number
    carries: number
    rush_yards: number
    rush_td: number
    fumbles: number
    yac: number
    receptions: number
    rec_yards: number
    rec_td: number
    rac: number
    solo: number
    assists: number
    tackles: number
    tfl: number
    sacks: number
    def_int: number
    forced_fumbles: number
    def_td: number
    fg_made: number
    fg_attempted: number
    xp_made: number
    xp_attempted: number
    punts: number
    punt_yards: number
    touchbacks: number
    kr_yards: number
    kr_td: number
    pr_yards: number
    pr_td: number
    kr_long: number
    pr_long: number
}

export interface CareerPlayerStat extends PlayerStat {
    game_week: number
    game_year: number
}

export interface PassingStat {
    id: string
    player_id: string
    game_id: string
    attempts: number | null
    completions: number | null
    yards: number | null
    td: number | null
    interceptions: number | null
    long: number | null
}

export interface RushingStat {
    id: string
    player_id: string
    game_id: string
    carries: number | null
    yards: number | null
    td: number | null
    fumbles: number | null
    yac: number | null
    long: number | null
}

export interface ReceivingStat {
    id: string
    player_id: string
    game_id: string
    receptions: number | null
    yards: number | null
    td: number | null
    rac: number | null
    yac: number | null
    long: number | null
}

export interface DefensiveStat {
    id: string
    player_id: string
    game_id: string
    solo: number | null
    assists: number | null
    tackles: number | null
    tfl: number | null
    sacks: number | null
    interceptions: number | null
    forced_fumbles: number | null
    td: number | null
}

export interface KickingStat {
    id: string
    player_id: string
    game_id: string
    fg_made: number | null
    fg_attempted: number | null
    xp_made: number | null
    xp_attempted: number | null
    punts: number | null
    punt_yards: number | null
    touchbacks: number | null
}

export interface ReturnStat {
    id: string
    player_id: string
    game_id: string
    kr_yards: number | null
    kr_td: number | null
    kr_long: number | null
    pr_yards: number | null
    pr_td: number | null
    pr_long: number | null
}

export type StatCategory = 'passing' | 'rushing' | 'receiving' | 'defensive' | 'kicking' | 'return'

type FlatStatFields = Omit<PlayerStat, 'id' | 'player_id' | 'game_id'>
type FlatStatField = keyof FlatStatFields
type SkillCategory = 'passing' | 'rushing' | 'receiving'
type ExistingStatRows = {
    passing: PassingStat | null
    rushing: RushingStat | null
    receiving: ReceivingStat | null
    defensive: DefensiveStat | null
    kicking: KickingStat | null
    return: ReturnStat | null
}
type StatCollections = {
    passing: PassingStat[]
    rushing: RushingStat[]
    receiving: ReceivingStat[]
    defensive: DefensiveStat[]
    kicking: KickingStat[]
    return: ReturnStat[]
}
type PlayerInfo = { id: string; name?: string | null; position?: string | null }
type GameInfo = {
    id: string
    week?: number | null
    year_records?: { year?: number | null } | { year?: number | null }[] | null
}
type StatReference = {
    playerId: string
    gameId: string
    category: StatCategory | null
}
type UpdateStatFn = {
    (id: string, updates: Partial<PlayerStat>): Promise<void>
    (playerId: string, gameId: string, updates: Partial<PlayerStat>): Promise<void>
}
type DeleteStatFn = {
    (id: string): Promise<void>
    (playerId: string, gameId: string): Promise<void>
}
type PlayerStatWithName = PlayerStat & { player_name: string; position: string }

type PassingPayload = Omit<PassingStat, 'id'>
type RushingPayload = Omit<RushingStat, 'id'>
type ReceivingPayload = Omit<ReceivingStat, 'id'>
type DefensivePayload = Omit<DefensiveStat, 'id'>
type KickingPayload = Omit<KickingStat, 'id'>
type ReturnPayload = Omit<ReturnStat, 'id'>

const COMPOSITE_ID_SEPARATOR = '__'
const STAT_CATEGORIES: StatCategory[] = ['passing', 'rushing', 'receiving', 'defensive', 'kicking', 'return']
const SKILL_CATEGORIES: SkillCategory[] = ['passing', 'rushing', 'receiving']

const PASSING_FIELDS = ['attempts', 'completions', 'pass_yards', 'pass_td', 'pass_int', 'long'] as const
const RUSHING_FIELDS = ['carries', 'rush_yards', 'rush_td', 'fumbles', 'yac', 'long'] as const
const RECEIVING_FIELDS = ['receptions', 'rec_yards', 'rec_td', 'rac', 'yac', 'long'] as const
const DEFENSIVE_FIELDS = ['solo', 'assists', 'tackles', 'tfl', 'sacks', 'def_int', 'forced_fumbles', 'def_td'] as const
const KICKING_FIELDS = ['fg_made', 'fg_attempted', 'xp_made', 'xp_attempted', 'punts', 'punt_yards', 'touchbacks'] as const
const RETURN_FIELDS = ['kr_yards', 'kr_td', 'kr_long', 'pr_yards', 'pr_td', 'pr_long'] as const

const PASSING_UNIQUE_FIELDS = ['attempts', 'completions', 'pass_yards', 'pass_td', 'pass_int'] as const
const RUSHING_UNIQUE_FIELDS = ['carries', 'rush_yards', 'rush_td', 'fumbles'] as const
const RECEIVING_UNIQUE_FIELDS = ['receptions', 'rec_yards', 'rec_td', 'rac'] as const
const DEFENSIVE_UNIQUE_FIELDS = ['solo', 'assists', 'tackles', 'tfl', 'sacks', 'def_int', 'forced_fumbles', 'def_td'] as const
const KICKING_UNIQUE_FIELDS = ['fg_made', 'fg_attempted', 'xp_made', 'xp_attempted', 'punts', 'punt_yards', 'touchbacks'] as const
const RETURN_UNIQUE_FIELDS = ['kr_yards', 'kr_td', 'kr_long', 'pr_yards', 'pr_td', 'pr_long'] as const

const CATEGORY_TABLES: Record<StatCategory, string> = {
    passing: 'player_passing_stats',
    rushing: 'player_rushing_stats',
    receiving: 'player_receiving_stats',
    defensive: 'player_defensive_stats',
    kicking: 'player_kicking_stats',
    return: 'player_return_stats',
}

const CATEGORY_FIELDS: Record<StatCategory, readonly FlatStatField[]> = {
    passing: PASSING_FIELDS,
    rushing: RUSHING_FIELDS,
    receiving: RECEIVING_FIELDS,
    defensive: DEFENSIVE_FIELDS,
    kicking: KICKING_FIELDS,
    return: RETURN_FIELDS,
}

const ALL_FLAT_FIELDS = new Set<FlatStatField>([
    ...PASSING_FIELDS,
    ...RUSHING_FIELDS,
    ...RECEIVING_FIELDS,
    ...DEFENSIVE_FIELDS,
    ...KICKING_FIELDS,
    ...RETURN_FIELDS,
])

// Dynamic table access for split stat tables
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function statsTable(table: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (supabase as any).from(table)
}

function numberValue(value: unknown): number {
    const num = Number(value ?? 0)
    return Number.isFinite(num) ? num : 0
}

function createEmptyFields(): FlatStatFields {
    return {
        attempts: 0,
        completions: 0,
        pass_yards: 0,
        pass_td: 0,
        pass_int: 0,
        long: 0,
        carries: 0,
        rush_yards: 0,
        rush_td: 0,
        fumbles: 0,
        yac: 0,
        receptions: 0,
        rec_yards: 0,
        rec_td: 0,
        rac: 0,
        solo: 0,
        assists: 0,
        tackles: 0,
        tfl: 0,
        sacks: 0,
        def_int: 0,
        forced_fumbles: 0,
        def_td: 0,
        fg_made: 0,
        fg_attempted: 0,
        xp_made: 0,
        xp_attempted: 0,
        punts: 0,
        punt_yards: 0,
        touchbacks: 0,
        kr_yards: 0,
        kr_td: 0,
        pr_yards: 0,
        pr_td: 0,
        kr_long: 0,
        pr_long: 0,
    }
}

function makeCompositeId(playerId: string, gameId: string): string {
    return `${playerId}${COMPOSITE_ID_SEPARATOR}${gameId}`
}

function parseCompositeId(id: string): { playerId: string; gameId: string } | null {
    const separatorIndex = id.indexOf(COMPOSITE_ID_SEPARATOR)
    if (separatorIndex <= 0) return null

    const playerId = id.slice(0, separatorIndex)
    const gameId = id.slice(separatorIndex + COMPOSITE_ID_SEPARATOR.length)

    if (!playerId || !gameId) return null

    return { playerId, gameId }
}

function createPlayerStat(playerId: string, gameId: string): PlayerStat {
    return {
        id: makeCompositeId(playerId, gameId),
        player_id: playerId,
        game_id: gameId,
        ...createEmptyFields(),
    }
}

function hasAnyNonZeroField(source: Partial<FlatStatFields>, fields: readonly FlatStatField[]): boolean {
    return fields.some((field) => numberValue(source[field]) !== 0)
}

function mergeIntoPlayerStat(target: PlayerStat, partial: Partial<FlatStatFields>): void {
    for (const [key, value] of Object.entries(partial) as [FlatStatField, number][]) {
        if (key === 'long') {
            target.long = Math.max(target.long, numberValue(value))
            continue
        }

        if (key === 'kr_long') {
            target.kr_long = Math.max(target.kr_long, numberValue(value))
            continue
        }

        if (key === 'pr_long') {
            target.pr_long = Math.max(target.pr_long, numberValue(value))
            continue
        }

        if (key === 'yac') {
            target.yac += numberValue(value)
            continue
        }

        target[key] += numberValue(value)
    }
}

function passingToFlat(stat: PassingStat): Partial<FlatStatFields> {
    return {
        attempts: numberValue(stat.attempts),
        completions: numberValue(stat.completions),
        pass_yards: numberValue(stat.yards),
        pass_td: numberValue(stat.td),
        pass_int: numberValue(stat.interceptions),
        long: numberValue(stat.long),
    }
}

function rushingToFlat(stat: RushingStat): Partial<FlatStatFields> {
    return {
        carries: numberValue(stat.carries),
        rush_yards: numberValue(stat.yards),
        rush_td: numberValue(stat.td),
        fumbles: numberValue(stat.fumbles),
        yac: numberValue(stat.yac),
        long: numberValue(stat.long),
    }
}

function receivingToFlat(stat: ReceivingStat): Partial<FlatStatFields> {
    return {
        receptions: numberValue(stat.receptions),
        rec_yards: numberValue(stat.yards),
        rec_td: numberValue(stat.td),
        rac: numberValue(stat.rac),
        yac: numberValue(stat.yac),
        long: numberValue(stat.long),
    }
}

function defensiveToFlat(stat: DefensiveStat): Partial<FlatStatFields> {
    return {
        solo: numberValue(stat.solo),
        assists: numberValue(stat.assists),
        tackles: numberValue(stat.tackles),
        tfl: numberValue(stat.tfl),
        sacks: numberValue(stat.sacks),
        def_int: numberValue(stat.interceptions),
        forced_fumbles: numberValue(stat.forced_fumbles),
        def_td: numberValue(stat.td),
    }
}

function kickingToFlat(stat: KickingStat): Partial<FlatStatFields> {
    return {
        fg_made: numberValue(stat.fg_made),
        fg_attempted: numberValue(stat.fg_attempted),
        xp_made: numberValue(stat.xp_made),
        xp_attempted: numberValue(stat.xp_attempted),
        punts: numberValue(stat.punts),
        punt_yards: numberValue(stat.punt_yards),
        touchbacks: numberValue(stat.touchbacks),
    }
}

function returnToFlat(stat: ReturnStat): Partial<FlatStatFields> {
    return {
        kr_yards: numberValue(stat.kr_yards),
        kr_td: numberValue(stat.kr_td),
        kr_long: numberValue(stat.kr_long),
        pr_yards: numberValue(stat.pr_yards),
        pr_td: numberValue(stat.pr_td),
        pr_long: numberValue(stat.pr_long),
    }
}

function mergeCollections(collections: StatCollections): PlayerStat[] {
    const merged = new Map<string, PlayerStat>()

    const getOrCreate = (playerId: string, gameId: string) => {
        const key = makeCompositeId(playerId, gameId)
        if (!merged.has(key)) {
            merged.set(key, createPlayerStat(playerId, gameId))
        }
        return merged.get(key)!
    }

    for (const stat of collections.passing) {
        mergeIntoPlayerStat(getOrCreate(stat.player_id, stat.game_id), passingToFlat(stat))
    }

    for (const stat of collections.rushing) {
        mergeIntoPlayerStat(getOrCreate(stat.player_id, stat.game_id), rushingToFlat(stat))
    }

    for (const stat of collections.receiving) {
        mergeIntoPlayerStat(getOrCreate(stat.player_id, stat.game_id), receivingToFlat(stat))
    }

    for (const stat of collections.defensive) {
        mergeIntoPlayerStat(getOrCreate(stat.player_id, stat.game_id), defensiveToFlat(stat))
    }

    for (const stat of collections.kicking) {
        mergeIntoPlayerStat(getOrCreate(stat.player_id, stat.game_id), kickingToFlat(stat))
    }

    for (const stat of collections.return) {
        mergeIntoPlayerStat(getOrCreate(stat.player_id, stat.game_id), returnToFlat(stat))
    }

    return Array.from(merged.values())
}

function getActiveCategoriesForFullStat(stat: Omit<PlayerStat, 'id'>): Set<StatCategory> {
    const active = new Set<StatCategory>()

    if (hasAnyNonZeroField(stat, PASSING_UNIQUE_FIELDS) || numberValue(stat.long) !== 0) active.add('passing')
    if (hasAnyNonZeroField(stat, RUSHING_UNIQUE_FIELDS) || numberValue(stat.long) !== 0) active.add('rushing')
    if (hasAnyNonZeroField(stat, RECEIVING_UNIQUE_FIELDS) || numberValue(stat.yac) !== 0 || numberValue(stat.long) !== 0) active.add('receiving')
    if (hasAnyNonZeroField(stat, DEFENSIVE_UNIQUE_FIELDS)) active.add('defensive')
    if (hasAnyNonZeroField(stat, KICKING_UNIQUE_FIELDS)) active.add('kicking')
    if (hasAnyNonZeroField(stat, RETURN_UNIQUE_FIELDS)) active.add('return')

    return active
}

function buildPassingPayload(source: Pick<PlayerStat, 'player_id' | 'game_id'> & Partial<FlatStatFields>): PassingPayload | null {
    const payload: PassingPayload = {
        player_id: source.player_id,
        game_id: source.game_id,
        attempts: numberValue(source.attempts),
        completions: numberValue(source.completions),
        yards: numberValue(source.pass_yards),
        td: numberValue(source.pass_td),
        interceptions: numberValue(source.pass_int),
        long: numberValue(source.long),
    }

    const hasStats = [payload.attempts, payload.completions, payload.yards, payload.td, payload.interceptions, payload.long].some((value) => value !== 0)
    return hasStats ? payload : null
}

function buildRushingPayload(
    source: Pick<PlayerStat, 'player_id' | 'game_id'> & Partial<FlatStatFields>,
    options: { includeYac: boolean }
): RushingPayload | null {
    const payload: RushingPayload = {
        player_id: source.player_id,
        game_id: source.game_id,
        carries: numberValue(source.carries),
        yards: numberValue(source.rush_yards),
        td: numberValue(source.rush_td),
        fumbles: numberValue(source.fumbles),
        yac: options.includeYac ? numberValue(source.yac) : 0,
        long: numberValue(source.long),
    }

    const hasStats = [payload.carries, payload.yards, payload.td, payload.fumbles, payload.yac, payload.long].some((value) => value !== 0)
    return hasStats ? payload : null
}

function buildReceivingPayload(source: Pick<PlayerStat, 'player_id' | 'game_id'> & Partial<FlatStatFields>): ReceivingPayload | null {
    const payload: ReceivingPayload = {
        player_id: source.player_id,
        game_id: source.game_id,
        receptions: numberValue(source.receptions),
        yards: numberValue(source.rec_yards),
        td: numberValue(source.rec_td),
        rac: numberValue(source.rac),
        yac: numberValue(source.yac),
        long: numberValue(source.long),
    }

    const hasStats = [payload.receptions, payload.yards, payload.td, payload.rac, payload.yac, payload.long].some((value) => value !== 0)
    return hasStats ? payload : null
}

function buildDefensivePayload(source: Pick<PlayerStat, 'player_id' | 'game_id'> & Partial<FlatStatFields>): DefensivePayload | null {
    const payload: DefensivePayload = {
        player_id: source.player_id,
        game_id: source.game_id,
        solo: numberValue(source.solo),
        assists: numberValue(source.assists),
        tackles: numberValue(source.tackles),
        tfl: numberValue(source.tfl),
        sacks: numberValue(source.sacks),
        interceptions: numberValue(source.def_int),
        forced_fumbles: numberValue(source.forced_fumbles),
        td: numberValue(source.def_td),
    }

    const hasStats = [payload.solo, payload.assists, payload.tackles, payload.tfl, payload.sacks, payload.interceptions, payload.forced_fumbles, payload.td].some((value) => value !== 0)
    return hasStats ? payload : null
}

function buildKickingPayload(source: Pick<PlayerStat, 'player_id' | 'game_id'> & Partial<FlatStatFields>): KickingPayload | null {
    const payload: KickingPayload = {
        player_id: source.player_id,
        game_id: source.game_id,
        fg_made: numberValue(source.fg_made),
        fg_attempted: numberValue(source.fg_attempted),
        xp_made: numberValue(source.xp_made),
        xp_attempted: numberValue(source.xp_attempted),
        punts: numberValue(source.punts),
        punt_yards: numberValue(source.punt_yards),
        touchbacks: numberValue(source.touchbacks),
    }

    const hasStats = [payload.fg_made, payload.fg_attempted, payload.xp_made, payload.xp_attempted, payload.punts, payload.punt_yards, payload.touchbacks].some((value) => value !== 0)
    return hasStats ? payload : null
}

function buildReturnPayload(source: Pick<PlayerStat, 'player_id' | 'game_id'> & Partial<FlatStatFields>): ReturnPayload | null {
    const payload: ReturnPayload = {
        player_id: source.player_id,
        game_id: source.game_id,
        kr_yards: numberValue(source.kr_yards),
        kr_td: numberValue(source.kr_td),
        kr_long: numberValue(source.kr_long),
        pr_yards: numberValue(source.pr_yards),
        pr_td: numberValue(source.pr_td),
        pr_long: numberValue(source.pr_long),
    }

    const hasStats = [payload.kr_yards, payload.kr_td, payload.kr_long, payload.pr_yards, payload.pr_td, payload.pr_long].some((value) => value !== 0)
    return hasStats ? payload : null
}

function buildPayloadForCategory(
    category: StatCategory,
    source: Pick<PlayerStat, 'player_id' | 'game_id'> & Partial<FlatStatFields>,
    options: { includeRushingYac?: boolean } = {}
): PassingPayload | RushingPayload | ReceivingPayload | DefensivePayload | KickingPayload | ReturnPayload | null {
    switch (category) {
        case 'passing':
            return buildPassingPayload(source)
        case 'rushing':
            return buildRushingPayload(source, { includeYac: options.includeRushingYac ?? true })
        case 'receiving':
            return buildReceivingPayload(source)
        case 'defensive':
            return buildDefensivePayload(source)
        case 'kicking':
            return buildKickingPayload(source)
        case 'return':
            return buildReturnPayload(source)
    }
}

function buildPayloadsForFullStat(stat: Omit<PlayerStat, 'id'>) {
    const activeCategories = getActiveCategoriesForFullStat(stat)

    return {
        passing: activeCategories.has('passing') ? buildPassingPayload(stat) : null,
        rushing: activeCategories.has('rushing') ? buildRushingPayload(stat, { includeYac: !activeCategories.has('receiving') }) : null,
        receiving: activeCategories.has('receiving') ? buildReceivingPayload(stat) : null,
        defensive: activeCategories.has('defensive') ? buildDefensivePayload(stat) : null,
        kicking: activeCategories.has('kicking') ? buildKickingPayload(stat) : null,
        return: activeCategories.has('return') ? buildReturnPayload(stat) : null,
    }
}

function existingRowToFlat(category: StatCategory, row: ExistingStatRows[StatCategory]): Partial<FlatStatFields> {
    if (!row) return {}

    switch (category) {
        case 'passing':
            return passingToFlat(row as PassingStat)
        case 'rushing':
            return rushingToFlat(row as RushingStat)
        case 'receiving':
            return receivingToFlat(row as ReceivingStat)
        case 'defensive':
            return defensiveToFlat(row as DefensiveStat)
        case 'kicking':
            return kickingToFlat(row as KickingStat)
        case 'return':
            return returnToFlat(row as ReturnStat)
    }
}

function pickCategoryFields(updates: Partial<PlayerStat>, category: StatCategory): Partial<FlatStatFields> {
    const picked: Partial<FlatStatFields> = {}

    for (const field of CATEGORY_FIELDS[category]) {
        if (field in updates) {
            picked[field] = numberValue(updates[field])
        }
    }

    return picked
}

function determineUpdateCategories(
    updates: Partial<PlayerStat>,
    existingRows: ExistingStatRows,
    referenceCategory: StatCategory | null
): StatCategory[] {
    const keys = new Set(
        Object.keys(updates).filter((key): key is FlatStatField => ALL_FLAT_FIELDS.has(key as FlatStatField))
    )
    const categories = new Set<StatCategory>()

    if ([...PASSING_UNIQUE_FIELDS].some((field) => keys.has(field))) categories.add('passing')
    if ([...RUSHING_UNIQUE_FIELDS].some((field) => keys.has(field))) categories.add('rushing')
    if ([...RECEIVING_UNIQUE_FIELDS].some((field) => keys.has(field))) categories.add('receiving')
    if ([...DEFENSIVE_UNIQUE_FIELDS].some((field) => keys.has(field))) categories.add('defensive')
    if ([...KICKING_UNIQUE_FIELDS].some((field) => keys.has(field))) categories.add('kicking')
    if ([...RETURN_UNIQUE_FIELDS].some((field) => keys.has(field))) categories.add('return')

    if (keys.has('long') && !SKILL_CATEGORIES.some((category) => categories.has(category))) {
        if (referenceCategory && SKILL_CATEGORIES.includes(referenceCategory as SkillCategory)) {
            categories.add(referenceCategory)
        } else {
            const existingLongCategories = SKILL_CATEGORIES.filter((category) => existingRows[category])
            for (const category of existingLongCategories.length > 0 ? existingLongCategories : SKILL_CATEGORIES) {
                categories.add(category)
            }
        }
    }

    if (keys.has('yac') && !categories.has('rushing') && !categories.has('receiving')) {
        if (referenceCategory === 'receiving' || referenceCategory === 'rushing') {
            categories.add(referenceCategory)
        } else if (existingRows.receiving) {
            categories.add('receiving')
        } else if (existingRows.rushing) {
            categories.add('rushing')
        } else {
            categories.add('receiving')
        }
    }

    return Array.from(categories)
}

async function fetchRowsByGameIds<T>(table: string, gameIds: string[]): Promise<T[]> {
    if (gameIds.length === 0) return []

    const { data, error } = await statsTable(table).select('*').in('game_id', gameIds)
    if (error) throw new Error(`${table}: ${error.message}`)

    return (data ?? []) as T[]
}

async function fetchRowsByPlayerId<T>(table: string, playerId: string): Promise<T[]> {
    const { data, error } = await statsTable(table).select('*').eq('player_id', playerId)
    if (error) throw new Error(`${table}: ${error.message}`)

    return (data ?? []) as T[]
}

async function fetchStatCollectionsByGameIds(gameIds: string[]): Promise<StatCollections> {
    const [passing, rushing, receiving, defensive, kicking, returnStats] = await Promise.all([
        fetchRowsByGameIds<PassingStat>(CATEGORY_TABLES.passing, gameIds),
        fetchRowsByGameIds<RushingStat>(CATEGORY_TABLES.rushing, gameIds),
        fetchRowsByGameIds<ReceivingStat>(CATEGORY_TABLES.receiving, gameIds),
        fetchRowsByGameIds<DefensiveStat>(CATEGORY_TABLES.defensive, gameIds),
        fetchRowsByGameIds<KickingStat>(CATEGORY_TABLES.kicking, gameIds),
        fetchRowsByGameIds<ReturnStat>(CATEGORY_TABLES.return, gameIds),
    ])

    return { passing, rushing, receiving, defensive, kicking, return: returnStats }
}

async function fetchStatCollectionsByPlayerId(playerId: string): Promise<StatCollections> {
    const [passing, rushing, receiving, defensive, kicking, returnStats] = await Promise.all([
        fetchRowsByPlayerId<PassingStat>(CATEGORY_TABLES.passing, playerId),
        fetchRowsByPlayerId<RushingStat>(CATEGORY_TABLES.rushing, playerId),
        fetchRowsByPlayerId<ReceivingStat>(CATEGORY_TABLES.receiving, playerId),
        fetchRowsByPlayerId<DefensiveStat>(CATEGORY_TABLES.defensive, playerId),
        fetchRowsByPlayerId<KickingStat>(CATEGORY_TABLES.kicking, playerId),
        fetchRowsByPlayerId<ReturnStat>(CATEGORY_TABLES.return, playerId),
    ])

    return { passing, rushing, receiving, defensive, kicking, return: returnStats }
}

async function fetchSeasonGameIds(dynastyId: string, yearRecordId: string): Promise<string[]> {
    const { data, error } = await supabase.from('games').select('id').eq('dynasty_id', dynastyId).eq('year_record_id', yearRecordId)

    if (error) throw new Error(`games: ${error.message}`)

    return (data ?? []).map((game) => game.id as string)
}

async function fetchExistingRows(playerId: string, gameId: string): Promise<ExistingStatRows> {
    const [passing, rushing, receiving, defensive, kicking, returnStat] = await Promise.all([
        statsTable(CATEGORY_TABLES.passing).select('*').eq('player_id', playerId).eq('game_id', gameId).maybeSingle(),
        statsTable(CATEGORY_TABLES.rushing).select('*').eq('player_id', playerId).eq('game_id', gameId).maybeSingle(),
        statsTable(CATEGORY_TABLES.receiving).select('*').eq('player_id', playerId).eq('game_id', gameId).maybeSingle(),
        statsTable(CATEGORY_TABLES.defensive).select('*').eq('player_id', playerId).eq('game_id', gameId).maybeSingle(),
        statsTable(CATEGORY_TABLES.kicking).select('*').eq('player_id', playerId).eq('game_id', gameId).maybeSingle(),
        statsTable(CATEGORY_TABLES.return).select('*').eq('player_id', playerId).eq('game_id', gameId).maybeSingle(),
    ])

    const responses = [passing, rushing, receiving, defensive, kicking, returnStat]
    const failure = responses.find((response) => response.error)
    if (failure?.error) throw failure.error

    return {
        passing: (passing.data ?? null) as PassingStat | null,
        rushing: (rushing.data ?? null) as RushingStat | null,
        receiving: (receiving.data ?? null) as ReceivingStat | null,
        defensive: (defensive.data ?? null) as DefensiveStat | null,
        kicking: (kicking.data ?? null) as KickingStat | null,
        return: (returnStat.data ?? null) as ReturnStat | null,
    }
}

async function fetchMergedStat(playerId: string, gameId: string): Promise<PlayerStat | null> {
    const collections = await fetchStatCollectionsByGameIds([gameId])
    return mergeCollections(collections).find((stat) => stat.player_id === playerId && stat.game_id === gameId) ?? null
}

async function writePayloads(
    payloads: Partial<Record<StatCategory, PassingPayload | RushingPayload | ReceivingPayload | DefensivePayload | KickingPayload | ReturnPayload | null>>,
    mode: 'insert' | 'upsert'
): Promise<void> {
    const operations: Promise<{ error: Error | null }>[] = []

    for (const category of STAT_CATEGORIES) {
        const payload = payloads[category]
        if (!payload) continue

        const query = mode === 'insert'
            ? statsTable(CATEGORY_TABLES[category]).insert(payload)
            : statsTable(CATEGORY_TABLES[category]).upsert(payload, { onConflict: 'player_id,game_id' })

        operations.push(query)
    }

    if (operations.length === 0) return

    const responses = await Promise.all(operations)
    const failure = responses.find((response) => response.error)
    if (failure?.error) throw failure.error
}

async function deletePlayerGameStats(playerId: string, gameId: string): Promise<void> {
    const responses = await Promise.all(
        STAT_CATEGORIES.map((category) =>
            statsTable(CATEGORY_TABLES[category]).delete().eq('player_id', playerId).eq('game_id', gameId)
        )
    )

    const failure = responses.find((response) => response.error)
    if (failure?.error) throw failure.error
}

async function deleteByRawId(id: string): Promise<void> {
    const responses = await Promise.all(
        STAT_CATEGORIES.map((category) => statsTable(CATEGORY_TABLES[category]).delete().eq('id', id))
    )

    const failure = responses.find((response) => response.error)
    if (failure?.error) throw failure.error
}

async function resolveStatReference(id: string): Promise<StatReference | null> {
    const composite = parseCompositeId(id)
    if (composite) {
        return {
            playerId: composite.playerId,
            gameId: composite.gameId,
            category: null,
        }
    }

    const lookups = await Promise.all(
        STAT_CATEGORIES.map((category) =>
            statsTable(CATEGORY_TABLES[category]).select('player_id, game_id').eq('id', id).maybeSingle()
                .then((response: { data: { player_id?: string; game_id?: string } | null; error: Error | null }) => ({ category, response }))
        )
    )

    const failure = lookups.find(({ response }) => response.error)
    if (failure?.response.error) throw failure.response.error

    const match = lookups.find(({ response }) => response.data)
    if (!match?.response.data) return null

    return {
        playerId: match.response.data.player_id as string,
        gameId: match.response.data.game_id as string,
        category: match.category,
    }
}

async function updateStatImpl(id: string, updates: Partial<PlayerStat>): Promise<void>
async function updateStatImpl(playerId: string, gameId: string, updates: Partial<PlayerStat>): Promise<void>
async function updateStatImpl(
    idOrPlayerId: string,
    gameIdOrUpdates: string | Partial<PlayerStat>,
    maybeUpdates?: Partial<PlayerStat>
): Promise<void> {
    const directIdentifiers = typeof gameIdOrUpdates === 'string'
        ? { playerId: idOrPlayerId, gameId: gameIdOrUpdates, category: null as StatCategory | null }
        : await resolveStatReference(idOrPlayerId)

    const updates = (typeof gameIdOrUpdates === 'string' ? maybeUpdates : gameIdOrUpdates) ?? {}

    if (!directIdentifiers) {
        throw new Error(`Could not resolve player stat identifier: ${idOrPlayerId}`)
    }

    const { playerId, gameId, category: referenceCategory } = directIdentifiers
    const existingRows = await fetchExistingRows(playerId, gameId)
    const categories = determineUpdateCategories(updates, existingRows, referenceCategory)

    if (categories.length === 0) return

    await Promise.all(
        categories.map(async (category) => {
            const existingRow = existingRows[category]
            const existingFlat = existingRowToFlat(category, existingRow)

            const mergedSource = {
                player_id: playerId,
                game_id: gameId,
                ...existingFlat,
                ...pickCategoryFields(updates, category),
            }

            const payload = buildPayloadForCategory(category, mergedSource, {
                includeRushingYac: category === 'rushing',
            })

            if (payload) {
                const { error } = await statsTable(CATEGORY_TABLES[category]).upsert(payload, { onConflict: 'player_id,game_id' })
                if (error) throw error
                return
            }

            if (existingRow) {
                const { error } = await statsTable(CATEGORY_TABLES[category]).delete().eq('player_id', playerId).eq('game_id', gameId)
                if (error) throw error
            }
        })
    )
}

async function deleteStatImpl(id: string): Promise<void>
async function deleteStatImpl(playerId: string, gameId: string): Promise<void>
async function deleteStatImpl(idOrPlayerId: string, maybeGameId?: string): Promise<void> {
    if (maybeGameId) {
        await deletePlayerGameStats(idOrPlayerId, maybeGameId)
        return
    }

    const reference = await resolveStatReference(idOrPlayerId)
    if (reference) {
        await deletePlayerGameStats(reference.playerId, reference.gameId)
        return
    }

    await deleteByRawId(idOrPlayerId)
}

export const PlayerStatService: {
    getStatsForGame(gameId: string): Promise<PlayerStat[]>
    getSeasonStats(dynastyId: string, yearRecordId: string): Promise<PlayerStat[]>
    getSeasonTotalsWithNames(dynastyId: string, yearRecordId: string): Promise<PlayerStatWithName[]>
    getCareerStats(playerId: string): Promise<CareerPlayerStat[]>
    upsertStat(stat: Omit<PlayerStat, 'id'> & { id?: string }): Promise<PlayerStat | null>
    createStat(stat: Omit<PlayerStat, 'id'>): Promise<PlayerStat | null>
    updateStat: UpdateStatFn
    deleteStat: DeleteStatFn
} = {
    async getStatsForGame(gameId: string): Promise<PlayerStat[]> {
        try {
            const collections = await fetchStatCollectionsByGameIds([gameId])
            return mergeCollections(collections)
        } catch (error) {
            console.error('Get player stats error:', error instanceof Error ? error.message : error)
            return []
        }
    },

    async getSeasonStats(dynastyId: string, yearRecordId: string): Promise<PlayerStat[]> {
        try {
            const gameIds = await fetchSeasonGameIds(dynastyId, yearRecordId)
            if (gameIds.length === 0) return []

            const collections = await fetchStatCollectionsByGameIds(gameIds)
            return mergeCollections(collections)
        } catch (error) {
            console.error('Get season stats error:', error instanceof Error ? error.message : error)
            return []
        }
    },

    async getSeasonTotalsWithNames(dynastyId: string, yearRecordId: string): Promise<PlayerStatWithName[]> {
        try {
            const gameIds = await fetchSeasonGameIds(dynastyId, yearRecordId)
            if (gameIds.length === 0) return []

            const stats = mergeCollections(await fetchStatCollectionsByGameIds(gameIds))
            if (stats.length === 0) return []

            const playerIds = Array.from(new Set(stats.map((stat) => stat.player_id)))
            const { data, error } = await supabase.from('players').select('id, name, position').in('id', playerIds)

            if (error) {
                console.error('Get season totals player lookup error:', error.message)
            }

            const playerMap = new Map(
                ((data ?? []) as PlayerInfo[]).map((player) => [player.id, player])
            )

            return stats.map((stat) => {
                const player = playerMap.get(stat.player_id)
                return {
                    ...stat,
                    player_name: player?.name ?? 'Unknown',
                    position: player?.position ?? '',
                }
            })
        } catch (error) {
            console.error('Get season totals error:', error instanceof Error ? error.message : error)
            return []
        }
    },

    async getCareerStats(playerId: string): Promise<CareerPlayerStat[]> {
        try {
            const collections = await fetchStatCollectionsByPlayerId(playerId)
            const stats = mergeCollections(collections)
            if (stats.length === 0) return []

            const gameIds = Array.from(new Set(stats.map((stat) => stat.game_id)))
            const { data, error } = await supabase.from('games').select('id, week, year_records!inner(year)').in('id', gameIds)

            if (error) {
                console.error('Get career games error:', error.message)
            }

            const gameMap = new Map<string, GameInfo>(((data ?? []) as GameInfo[]).map((game) => [game.id, game]))

            return stats
                .map((stat) => {
                    const game = gameMap.get(stat.game_id)
                    const yearRecord = Array.isArray(game?.year_records) ? game?.year_records[0] : game?.year_records
                    return {
                        ...stat,
                        game_week: numberValue(game?.week),
                        game_year: numberValue(yearRecord?.year),
                    }
                })
                .sort((a, b) => (a.game_year - b.game_year) || (a.game_week - b.game_week))
        } catch (error) {
            console.error('Get career stats error:', error instanceof Error ? error.message : error)
            return []
        }
    },

    async upsertStat(stat: Omit<PlayerStat, 'id'> & { id?: string }): Promise<PlayerStat | null> {
        try {
            const { id: _unusedId, ...statWithoutId } = stat
            void _unusedId
            const payloads = buildPayloadsForFullStat(statWithoutId)
            const hasPayloads = Object.values(payloads).some(Boolean)

            if (!hasPayloads) {
                await deletePlayerGameStats(statWithoutId.player_id, statWithoutId.game_id)
                return null
            }

            await writePayloads(payloads, 'upsert')
            return await fetchMergedStat(statWithoutId.player_id, statWithoutId.game_id)
        } catch (error) {
            console.error('Upsert player stat error:', error instanceof Error ? error.message : error)
            return null
        }
    },

    async createStat(stat: Omit<PlayerStat, 'id'>): Promise<PlayerStat | null> {
        try {
            const payloads = buildPayloadsForFullStat(stat)
            const hasPayloads = Object.values(payloads).some(Boolean)

            if (!hasPayloads) return null

            await writePayloads(payloads, 'insert')
            return await fetchMergedStat(stat.player_id, stat.game_id)
        } catch (error) {
            console.error('Create player stat error:', error instanceof Error ? error.message : error)
            return null
        }
    },

    updateStat: updateStatImpl as UpdateStatFn,
    deleteStat: deleteStatImpl as DeleteStatFn,
}
