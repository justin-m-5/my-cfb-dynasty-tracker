import { supabase } from '@/supabase/client'

export interface RosterTemplate {
    id: string
    name: string
    school: string
    position: string
    height: string | null
    weight: number | null
    overall: number | null
    year: string | null
    dev_trait: string | null
    redshirt_status: string | null
}

const yearMap: Record<string, string> = {
    'freshman': 'FR',
    'sophomore': 'SO',
    'junior': 'JR',
    'senior': 'SR',
    'redshirt freshman': 'FR (RS)',
    'redshirt sophomore': 'SO (RS)',
    'redshirt junior': 'JR (RS)',
    'redshirt senior': 'SR (RS)',
    'graduate': 'SR (RS)',
    'grad transfer': 'SR (RS)',
}

export function normalizeYear(raw: string | null, redshirtStatus?: string | null): string | null {
    if (!raw) return null

    const lower = raw.toLowerCase().trim()

    // If redshirt_status indicates redshirt, prepend it
    if (redshirtStatus && redshirtStatus.toLowerCase().includes('redshirt')) {
        const redshirtKey = `redshirt ${lower}`
        if (yearMap[redshirtKey]) return yearMap[redshirtKey]
    }

    return yearMap[lower] ?? raw
}

export const RosterTemplateService = {
    async getBySchool(school: string): Promise<RosterTemplate[]> {
        const { data, error } = await supabase
            .from('roster_templates')
            .select('*')
            .eq('school', school)
            .order('position')
            .order('name')

        if (error) {
            console.error('Get roster templates error:', error.message)
            return []
        }

        return (data ?? []) as RosterTemplate[]
    },

    async getAvailableSchools(): Promise<string[]> {
        const { data, error } = await supabase
            .from('roster_templates')
            .select('school')

        if (error) {
            console.error('Get available schools error:', error.message)
            return []
        }

        const schools = new Set((data ?? []).map((row: { school: string }) => row.school))
        return [...schools].sort()
    },
}
