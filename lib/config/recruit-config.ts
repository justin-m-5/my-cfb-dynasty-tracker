// lib/recruit-config.ts

export const usStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'INTL',
] as const

export type USState = (typeof usStates)[number]

export function starsDisplay(stars: number | null): string {
    if (!stars) return '—'
    return `${stars} ★`
}

export function starsColor(stars: number | null): string {
    switch (stars) {
        case 5: return 'text-amber-500'
        case 4: return 'text-blue-500'
        case 3: return 'text-green-600'
        case 2: return 'text-text/60'
        case 1: return 'text-text/40'
        default: return 'text-text/40'
    }
}
