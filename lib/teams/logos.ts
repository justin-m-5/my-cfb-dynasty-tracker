// lib/logos.ts

import { fbsTeams } from './fbs-teams'

export const conferenceLogoByName: Record<string, string> = {
    SEC: '/logos/conferences/SEC_logo_300x300.png',
    ACC: '/logos/conferences/ACC_logo_300x300.png',
    MWC: '/logos/conferences/MWC_logo_300x300.png',
    'Big 12': '/logos/conferences/Big_12_logo_300x300.png',
    'Pac-12': '/logos/conferences/Pac-12_logo-300x300.png',
    AAC: '/logos/conferences/AAC_logo_300x300.png',
    MAC: '/logos/conferences/MAC_logo_300x300.png',
    'Sun Belt': '/logos/conferences/Sun_Belt_logo_300x300.png',
    'Big Ten': '/logos/conferences/Big_Ten_logo_300x300.png',
    'C-USA': '/logos/conferences/CUSA_logo_300x300.png',
    Independents: '/logos/conferences/Independents_logo_300x300.png',
}

export function getTeamLogo(schoolName: string): string {
    const team = fbsTeams.find(t => t.name === schoolName)
    return team?.logo ?? ''
}

function toLogoToken(value: string) {
    return value.replace(/\(([^)]+)\)/g, '$1').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

export function getSchoolLogoCandidates(schoolName: string, nickname: string | null): string[] {
    const school = toLogoToken(schoolName)
    const nick = nickname ? toLogoToken(nickname) : ''

    if (!nick) return [`/logos/${school}_logo_300x300.png`]

    return [
        `/logos/${school}_${nick}_logo_300x300.png`,
        `/logos/${school}_${nick}_Logo_300x300.png`,
        `/logos/${school}_${nick}_300x300.png`,
    ]
}
