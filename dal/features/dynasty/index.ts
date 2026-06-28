// dal/features/dynasty/index.ts

import { createDynasty } from './create-dynasty'
import { getDynasties } from './get-dynasties'
import { switchTeams } from './switch-teams'

export type { CreateDynastyInput, DynastySummary, SwitchTeamsInput } from './types'

export const DynastyService = {
    createDynasty,
    getDynasties,
    switchTeams,
}
