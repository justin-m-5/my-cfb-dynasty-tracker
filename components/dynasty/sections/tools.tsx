// components/dynasty/sections/tools.tsx

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RecruitPredictor } from './tools/recruit-predictor'
import { RecruitingCalculator } from './tools/recruiting-calculator'
import { PlayerNameGenerator } from './tools/player-name-generator'

export function Tools() {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Recruiting Predictor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecruitPredictor />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Recruiting Calculator</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecruitingCalculator />
                    </CardContent>
                </Card>

                <Card className="col-span-2 sm:col-span-1 md:col-span-1">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Player Name Generator</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PlayerNameGenerator />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
