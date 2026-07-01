// lib/player-config.ts

export const positions = [
    // Offense
    'QB', 'HB', 'FB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT',
    // Defense
    'CB', 'DT', 'FS', 'LEDG', 'MIKE', 'REDG', 'SAM', 'SS', 'WILL',
    // Special Teams
    'K', 'P',
    // Recruiting only
    'ATH',
] as const

export type Position = (typeof positions)[number]

export const positionGroups: Record<string, readonly string[]> = {
    Offense: ['QB', 'HB', 'FB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT'],
    Defense: ['CB', 'DT', 'FS', 'LEDG', 'MIKE', 'REDG', 'SAM', 'SS', 'WILL'],
    'Special Teams': ['K', 'P'],
}

// Includes ATH for recruit/transfer forms
export const recruitPositionGroups: Record<string, readonly string[]> = {
    Offense: ['QB', 'HB', 'FB', 'WR', 'TE', 'LT', 'LG', 'C', 'RG', 'RT'],
    Defense: ['CB', 'DT', 'FS', 'LEDG', 'MIKE', 'REDG', 'SAM', 'SS', 'WILL'],
    'Special Teams': ['K', 'P'],
    Other: ['ATH'],
}

export const positionLabels: Record<Position, string> = {
    QB: 'Quarterback',
    HB: 'Halfback',
    FB: 'Fullback',
    WR: 'Wide Receiver',
    TE: 'Tight End',
    LT: 'Left Tackle',
    LG: 'Left Guard',
    C: 'Center',
    RG: 'Right Guard',
    RT: 'Right Tackle',
    CB: 'Cornerback',
    DT: 'Defensive Tackle',
    FS: 'Free Safety',
    LEDG: 'Left Edge',
    MIKE: 'Mike Backer',
    REDG: 'Right Edge',
    SAM: 'Sam Backer',
    SS: 'Strong Safety',
    WILL: 'Will Backer',
    K: 'Kicker',
    P: 'Punter',
    ATH: 'Athlete',
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
