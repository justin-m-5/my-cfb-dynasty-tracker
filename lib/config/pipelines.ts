// lib/pipelines.ts

export interface PipelineRegion {
    region: string
    pipelines: string[]
}

export const pipelinesByRegion: PipelineRegion[] = [
    {
        region: 'Southeast',
        pipelines: ['Metro Atlanta', 'South Georgia', 'Alabama', 'Tennessee', 'Mississippi', 'South Carolina', 'North Carolina', 'Tidewater', 'Kentucky'],
    },
    {
        region: 'Florida',
        pipelines: ['Central Florida', 'South Florida', 'North Florida'],
    },
    {
        region: 'Texas',
        pipelines: ['East Texas', 'North Texas', 'Southwest Texas'],
    },
    {
        region: 'California & West',
        pipelines: ['Southern California', 'Northern California', 'Pacific Northwest', 'Nevada', 'Hawaii', 'Arizona', 'Utah', 'Colorado'],
    },
    {
        region: 'Midwest',
        pipelines: ['Ohio', 'Michigan', 'Illinois', 'Indiana', 'Wisconsin', 'Minnesota', 'Iowa', 'Missouri', 'Kansas', 'Nebraska'],
    },
    {
        region: 'Northeast',
        pipelines: ['Big Apple', 'Pennsylvania', 'New England', 'West Virginia'],
    },
    {
        region: 'South Central',
        pipelines: ['Louisiana', 'Arkansas', 'Oklahoma', 'New Mexico', 'Big Sky'],
    },
]

export const pipelines = pipelinesByRegion.flatMap(r => r.pipelines)
