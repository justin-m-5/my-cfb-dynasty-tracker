// dal/features/dynasty/index.ts

import { advanceSeason } from './advance-season'
import { createDynasty } from './create-dynasty'
import { deleteDynasty } from './delete-dynasty'
import { getDynasties } from './get-dynasties'
import { getDynastyById } from './get-dynasty'
import { switchTeams } from './switch-teams'

export type { CreateDynastyInput, DynastySummary, SwitchTeamsInput } from './types'
export type { Dynasty } from './get-dynasty'

export const DynastyService = {
    advanceSeason,
    createDynasty,
    deleteDynasty,
    getDynasties,
    getDynastyById,
    switchTeams,
}
