// lib/award-config.ts

export const predefinedAwards = [
    'All-American',
    'All-Conference',
    'Bear Bryant Coach of the Year Award',
    'Biletnikoff Award',
    'Bronco Nagurski Trophy',
    'Broyles Award',
    'Butkus Award',
    'Chuck Bednarik Award',
    'Davey O\'Brien Award',
    'Doak Walker Award',
    'Edge Rusher of the Year',
    'Heisman Memorial Trophy',
    'Jim Thorpe Award',
    'John Mackey Award',
    'Lombardi Award',
    'Lou Groza Award',
    'Maxwell Award',
    'Outland Trophy',
    'Ray Guy Award',
    'Jet Award',
    'Rimington Trophy',
    'Unitas Golden Arm Award',
    'Walter Camp Award',
    'Shaun Alexander Award',
]

// Awards that require a team designation (1st Team, 2nd Team, Freshman)
export const teamAwards = ['All-American', 'All-Conference']

export const teamDesignations = ['1st Team', '2nd Team', 'Freshman'] as const
export type TeamDesignation = (typeof teamDesignations)[number]
