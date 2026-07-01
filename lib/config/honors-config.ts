// lib/honors-config.ts

export const HONOR_CATEGORIES = [
    { key: 'all-american-1st', label: 'All-American 1st Team' },
    { key: 'all-american-2nd', label: 'All-American 2nd Team' },
    { key: 'freshman-all-american', label: 'Freshman All-American' },
    { key: 'all-conference-1st', label: 'All-Conference 1st Team' },
    { key: 'all-conference-2nd', label: 'All-Conference 2nd Team' },
    { key: 'freshman-all-conference', label: 'Freshman All-Conference' },
] as const

export type HonorKey = (typeof HONOR_CATEGORIES)[number]['key']

export function getHonorLabel(key: string): string {
    return HONOR_CATEGORIES.find(h => h.key === key)?.label ?? key
}
