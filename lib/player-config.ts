// lib/player-config.ts

export const positions = [
    'QB', 'HB', 'FB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT',
    'LE', 'RE', 'DT', 'LOLB', 'MLB', 'ROLB',
    'CB', 'FS', 'SS',
    'K', 'P',
] as const

export type Position = (typeof positions)[number]

export const positionGroups: Record<string, readonly string[]> = {
    Offense: ['QB', 'HB', 'FB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT'],
    Defense: ['LE', 'RE', 'DT', 'LOLB', 'MLB', 'ROLB', 'CB', 'FS', 'SS'],
    'Special Teams': ['K', 'P'],
}

export const years = ['FR', 'FR (RS)', 'SO', 'SO (RS)', 'JR', 'JR (RS)', 'SR', 'SR (RS)'] as const

export const devTraits = ['Normal', 'Impact', 'Star', 'Elite'] as const
export type DevTrait = (typeof devTraits)[number]

export const devTraitColors: Record<DevTrait, string> = {
    Elite: 'bg-purple-500/20 text-purple-600',
    Star: 'bg-yellow-500/20 text-yellow-700',
    Impact: 'bg-blue-500/20 text-blue-600',
    Normal: 'bg-gray-500/15 text-text/60',
}
