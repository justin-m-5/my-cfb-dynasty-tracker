// lib/game-utils.ts
// Shared game display utilities

export function getWeekDisplayName(week: number): string {
    if (week === 0) return 'Week 0'
    if (week >= 1 && week <= 14) return `Week ${week}`
    if (week === 15) return 'Conf Champ'
    if (week === 16) return 'CFP R1 / Bowls'
    if (week === 17) return 'CFP QF'
    if (week === 18) return 'CFP SF'
    if (week === 19) return 'Natty'
    return `Week ${week}`
}

export function getWeekFullName(week: number): string {
    if (week === 0) return 'Week 0'
    if (week >= 1 && week <= 14) return `Week ${week}`
    if (week === 15) return 'Conference Championship'
    if (week === 16) return 'CFP First Round / Bowl Season'
    if (week === 17) return 'CFP Quarterfinal'
    if (week === 18) return 'CFP Semifinal'
    if (week === 19) return 'National Championship'
    return `Week ${week}`
}

/** Max week for schedule (games start at week 1) */
export const MAX_SCHEDULE_WEEK = 19

/** Max week for rankings (rankings start at week 0) */
export const MAX_RANKINGS_WEEK = 19

export function getResultColor(result: string): string {
    switch (result) {
        case 'W': return 'bg-green-100/80 text-green-900 dark:bg-green-950/40 dark:text-green-200'
        case 'L': return 'bg-red-100/80 text-red-900 dark:bg-red-950/40 dark:text-red-200'
        case 'Bye': return 'bg-slate-100/80 text-slate-700 dark:bg-slate-800/40 dark:text-slate-300'
        default: return 'bg-background/70 text-text'
    }
}

export function getLocationLabel(location: string): string {
    switch (location) {
        case 'home': return 'vs'
        case 'away': return '@'
        default: return 'vs'
    }
}

export function parseScore(score: string | null): { user: number; opp: number } {
    if (!score) return { user: 0, opp: 0 }
    const [user = '0', opp = '0'] = score.split('-')
    return { user: Number(user) || 0, opp: Number(opp) || 0 }
}

export function buildScore(user: number | string, opp: number | string): string {
    return `${user}-${opp}`
}
